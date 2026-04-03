import { useState } from 'react';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
  UploadTaskSnapshot,
  UploadMetadata,
} from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { storage, db } from '../firebase/firebase-config';

export interface FileMetadataT {
  name: string;
  fullPath: string;
  size: number;
  contentType: string;
  timeCreated: string;
  updated: string;
  downloadURL: string;
}

export interface UploadProgressT {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error: string | null;
  downloadURL: string | null;
}

export type TeacherFileFieldT =
  | 'cv_file_path'
  | 'pfp_file_path'
  | 'video_file_path';

const storageFolderByField: Record<TeacherFileFieldT, 'cv' | 'pfp' | 'video'> =
  {
    cv_file_path: 'cv',
    pfp_file_path: 'pfp',
    video_file_path: 'video',
  };

export const useFileUploadHybrid = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgressT>({
    progress: 0,
    status: 'idle',
    error: null,
    downloadURL: null,
  });

  /**
   * Upload a file and save just the path to Firestore
   * @param file - The file to upload
   * @param userId - The user ID
   * @param folder - Optional subfolder
   * @returns Promise with the file path
   */
  const uploadFile = async (
    file: File,
    userId: string,
    field: TeacherFileFieldT,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Enforce type by explicit field target.
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        const isCV =
          file.type === 'application/pdf' ||
          file.type === 'application/msword' ||
          file.type ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        const fieldValidation: Record<TeacherFileFieldT, boolean> = {
          cv_file_path: isCV,
          pfp_file_path: isImage,
          video_file_path: isVideo,
        };

        if (!fieldValidation[field]) {
          const fieldErrorMessages: Record<TeacherFileFieldT, string> = {
            cv_file_path: 'CV must be PDF, DOC, or DOCX',
            pfp_file_path: 'Profile picture must be an image file',
            video_file_path: 'Video must be a valid video file',
          };
          reject(new Error(fieldErrorMessages[field]));
          return;
        }

        const extension = file.name.includes('.')
          ? file.name.split('.').pop()?.toLowerCase() || 'bin'
          : 'bin';
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storageFolder = storageFolderByField[field];
        const filePath = `users/${userId}/${storageFolder}/${storageFolder}.${extension}`;

        const storageRef = ref(storage, filePath);

        const metadata: UploadMetadata = {
          contentType: file.type,
          customMetadata: {
            originalName: sanitizedFileName,
            uploadedAt: Math.floor(Date.now() / 1000).toString(),
          },
        };

        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        setUploadProgress({
          progress: 0,
          status: 'uploading',
          error: null,
          downloadURL: null,
        });

        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress((prev) => ({
              ...prev,
              progress,
            }));
          },
          (error) => {
            console.error('Upload error:', error);
            let errorMessage = 'Upload failed';

            switch (error.code) {
              case 'storage/unauthorized':
                errorMessage = 'You do not have permission to upload files';
                break;
              case 'storage/canceled':
                errorMessage = 'Upload was cancelled';
                break;
              case 'storage/unknown':
                errorMessage = 'An unknown error occurred';
                break;
            }

            setUploadProgress({
              progress: 0,
              status: 'error',
              error: errorMessage,
              downloadURL: null,
            });

            reject(new Error(errorMessage));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              // Keep only one file per teacher field by deleting previous target file when it differs.
              const userRef = doc(db, 'users', userId);
              const userSnapshot = await getDoc(userRef);
              const previousPath = userSnapshot.exists()
                ? (userSnapshot.data()?.[field] as string | undefined)
                : undefined;

              if (previousPath && previousPath !== filePath) {
                try {
                  await deleteObject(ref(storage, previousPath));
                } catch (deleteError) {
                  console.warn('Previous file cleanup skipped:', deleteError);
                }
              }

              await updateDoc(userRef, {
                [field]: filePath,
              });

              setUploadProgress({
                progress: 100,
                status: 'success',
                error: null,
                downloadURL,
              });

              resolve(filePath);
            } catch (error) {
              console.error('Error saving file path:', error);
              setUploadProgress({
                progress: 0,
                status: 'error',
                error: 'Failed to save file information',
                downloadURL: null,
              });
              reject(error);
            }
          },
        );
      } catch (error) {
        console.error('Error initiating upload:', error);
        setUploadProgress({
          progress: 0,
          status: 'error',
          error: 'Failed to start upload',
          downloadURL: null,
        });
        reject(error);
      }
    });
  };

  /**
   * Get full metadata for multiple file paths
   * @param filePaths - Array of file paths
   * @returns Array of file metadata
   */
  const getFilesMetadata = async (
    filePaths: string[],
  ): Promise<FileMetadataT[]> => {
    try {
      const metadataPromises = filePaths.map(async (path) => {
        try {
          const storageRef = ref(storage, path);
          const metadata = await getMetadata(storageRef);
          const downloadURL = await getDownloadURL(storageRef);

          return {
            name: metadata.name,
            fullPath: metadata.fullPath,
            size: metadata.size,
            contentType: metadata.contentType || 'unknown',
            timeCreated: metadata.timeCreated,
            updated: metadata.updated,
            downloadURL,
          };
        } catch (error) {
          console.error(`Error getting metadata for ${path}:`, error);
          return null;
        }
      });

      const results = await Promise.all(metadataPromises);
      // Filter out any failed requests
      return results.filter((file): file is FileMetadataT => file !== null);
    } catch (error) {
      console.error('Error fetching files metadata:', error);
      return [];
    }
  };

  /**
   * Delete a file from Storage and remove path from Firestore
   * @param userId - The user ID
   * @param filePath - Full path to the file
   */
  const deleteFile = async (
    userId: string,
    field: TeacherFileFieldT,
    filePath: string,
  ): Promise<void> => {
    try {
      // Delete from Storage
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);

      // Remove explicit field from Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [field]: null,
      });

      setUploadProgress({
        progress: 0,
        status: 'idle',
        error: null,
        downloadURL: null,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  const resetUpload = () => {
    setUploadProgress({
      progress: 0,
      status: 'idle',
      error: null,
      downloadURL: null,
    });
  };

  return {
    uploadFile,
    getFilesMetadata,
    deleteFile,
    resetUpload,
    uploadProgress,
  };
};
