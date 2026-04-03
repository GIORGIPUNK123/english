import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import {
  useFileUploadHybrid,
  FileMetadataT,
  TeacherFileFieldT,
} from '../../../hooks/useFileUploadHybrid';
import { UserDataT } from '../../../types';

interface FileListHybridProps {
  userId: string;
}

type UserFileEntryT = {
  field: TeacherFileFieldT;
  path: string;
};

export const FileListHybrid: React.FC<FileListHybridProps> = ({ userId }) => {
  const [files, setFiles] = useState<FileMetadataT[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getFilesMetadata, deleteFile } = useFileUploadHybrid();
  const [deletingFilePath, setDeletingFilePath] = useState<string | null>(null);

  const getUserFileEntries = (userData: UserDataT): UserFileEntryT[] => {
    const mapping: Array<[TeacherFileFieldT, string | undefined]> = [
      ['cv_file_path', userData.cv_file_path],
      ['pfp_file_path', userData.pfp_file_path],
      ['video_file_path', userData.video_file_path],
    ];

    return mapping
      .filter(([, path]) => Boolean(path))
      .map(([field, path]) => ({
        field,
        path: path as string,
      }));
  };

  const loadFiles = async (entries: UserFileEntryT[]) => {
    const filePaths = entries.map((entry) => entry.path);

    if (filePaths.length > 0) {
      const filesWithMetadata = await getFilesMetadata(filePaths);
      setFiles(filesWithMetadata);
    } else {
      setFiles([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const userRef = doc(db, 'users', userId);
    const docSnapshot = await new Promise<any>((resolve) => {
      const unsubscribe = onSnapshot(userRef, (snap) => {
        unsubscribe();
        resolve(snap);
      });
    });

    if (docSnapshot.exists()) {
      const userData = docSnapshot.data() as UserDataT;
      await loadFiles(getUserFileEntries(userData));
    }
    setRefreshing(false);
  };

  useEffect(() => {
    // Listen to user document for file paths (real-time)
    const userRef = doc(db, 'users', userId);

    const unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data() as UserDataT;
        await loadFiles(getUserFileEntries(userData));
      } else {
        setFiles([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const resolveFieldFromPath = (filePath: string): TeacherFileFieldT | null => {
    if (filePath.includes('/cv/') || filePath.includes('/cv_file_path/')) {
      return 'cv_file_path';
    }
    if (filePath.includes('/pfp/') || filePath.includes('/pfp_file_path/')) {
      return 'pfp_file_path';
    }
    if (
      filePath.includes('/video/') ||
      filePath.includes('/video_file_path/')
    ) {
      return 'video_file_path';
    }
    return null;
  };

  const handleDelete = async (file: FileMetadataT) => {
    if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    const field = resolveFieldFromPath(file.fullPath);
    if (!field) {
      alert('Unable to determine file type for deletion.');
      return;
    }

    setDeletingFilePath(file.fullPath);
    try {
      await deleteFile(userId, field, file.fullPath);
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    } finally {
      setDeletingFilePath(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('video/')) return '🎥';
    if (type === 'application/pdf') return '📄';
    if (type.includes('word') || type === 'application/msword') return '📝';
    return '📎';
  };

  const getFolderFromPath = (fullPath: string): string => {
    if (fullPath.includes('/cv/') || fullPath.includes('/cv_file_path/')) {
      return 'cv';
    }
    if (fullPath.includes('/pfp/') || fullPath.includes('/pfp_file_path/')) {
      return 'profile picture';
    }
    if (
      fullPath.includes('/video/') ||
      fullPath.includes('/video_file_path/')
    ) {
      return 'intro video';
    }
    return 'file';
  };

  const groupFilesByFolder = (files: FileMetadataT[]) => {
    return files.reduce(
      (acc, file) => {
        const folder = getFolderFromPath(file.fullPath);
        if (!acc[folder]) {
          acc[folder] = [];
        }
        acc[folder].push(file);
        return acc;
      },
      {} as Record<string, FileMetadataT[]>,
    );
  };

  if (loading) {
    return (
      <div className='p-6 text-gray-700 dark:text-gray-300'>
        Loading files...
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className='p-6 text-center text-gray-600 dark:text-gray-400'>
        <p>No files uploaded yet.</p>
      </div>
    );
  }

  const groupedFiles = groupFilesByFolder(files);

  return (
    <div className='w-full max-w-5xl p-6 mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
          My Files
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`px-4 py-2 text-sm font-semibold text-white transition-colors rounded-lg ${
            refreshing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {refreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {Object.entries(groupedFiles).map(([folder, folderFiles]) => (
        <div key={folder} className='mb-8'>
          <h3 className='pb-2 mb-4 text-lg font-semibold text-gray-900 capitalize border-b-2 border-blue-600 dark:text-white'>
            📁 {folder.replace(/_/g, ' ')}
          </h3>

          <div className='space-y-4'>
            {folderFiles.map((file) => (
              <div
                key={file.fullPath}
                className='flex items-center p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700'
              >
                <div className='flex items-center flex-1 gap-4'>
                  <span className='text-3xl'>
                    {getFileIcon(file.contentType)}
                  </span>

                  <div className='flex-1'>
                    <div className='mb-1 font-semibold text-gray-900 dark:text-white'>
                      {file.name}
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      {formatFileSize(file.size)} • Uploaded{' '}
                      {formatDate(file.timeCreated)}
                    </div>
                  </div>
                </div>

                <div className='flex gap-2'>
                  {file.contentType.startsWith('image/') ? (
                    <a
                      href={file.downloadURL}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='px-4 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700'
                    >
                      View
                    </a>
                  ) : (
                    <a
                      href={file.downloadURL}
                      download={file.name}
                      className='px-4 py-2 text-sm font-semibold text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700'
                    >
                      Download
                    </a>
                  )}

                  <button
                    onClick={() => handleDelete(file)}
                    disabled={deletingFilePath === file.fullPath}
                    className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${
                      deletingFilePath === file.fullPath
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 cursor-pointer'
                    }`}
                  >
                    {deletingFilePath === file.fullPath
                      ? 'Deleting...'
                      : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
