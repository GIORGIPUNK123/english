import React, { useState } from 'react';
import {
  TeacherFileFieldT,
  useFileUploadHybrid,
} from '../../../hooks/useFileUploadHybrid';

interface FileUploadHybridProps {
  userId: string;
  onUploadComplete?: () => void;
}

export const FileUploadHybrid: React.FC<FileUploadHybridProps> = ({
  userId,
  onUploadComplete,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [field, setField] = useState<TeacherFileFieldT>('cv_file_path');
  const { uploadFile, uploadProgress, resetUpload } = useFileUploadHybrid();

  const FIELD_LABELS: Record<TeacherFileFieldT, string> = {
    cv_file_path: 'CV',
    pfp_file_path: 'Profile Picture',
    video_file_path: 'Intro Video',
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      const isCV =
        file.type === 'application/pdf' ||
        file.type === 'application/msword' ||
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      const isValidByField: Record<TeacherFileFieldT, boolean> = {
        cv_file_path: isCV,
        pfp_file_path: isImage,
        video_file_path: isVideo,
      };

      if (!isValidByField[field]) {
        const errorsByField: Record<TeacherFileFieldT, string> = {
          cv_file_path: 'Only CV files are allowed (PDF, DOC, DOCX)',
          pfp_file_path: 'Only image files are allowed for profile picture',
          video_file_path: 'Only video files are allowed for intro video',
        };
        alert(errorsByField[field]);
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
      resetUpload();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    try {
      const filePath = await uploadFile(selectedFile, userId, field);
      console.log('File uploaded to:', filePath);

      setSelectedFile(null);

      if (onUploadComplete) {
        onUploadComplete();
      }

      const fileInput = document.getElementById(
        'file-upload',
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('video/')) return '🎥';
    if (type === 'application/pdf') return '📄';
    if (type.includes('word') || type === 'application/msword') return '📝';
    return '📎';
  };

  return (
    <div className='w-full max-w-3xl p-6 mx-auto bg-white rounded-lg shadow dark:bg-gray-800'>
      <h2 className='mb-6 text-2xl font-bold text-gray-900 dark:text-white'>
        Upload Teacher Files
      </h2>

      <div className='mb-6'>
        <label
          htmlFor='folder-select'
          className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
        >
          Select File Type:
        </label>
        <select
          id='folder-select'
          value={field}
          onChange={(e) => setField(e.target.value as TeacherFileFieldT)}
          className='w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500'
        >
          <option value='cv_file_path'>CV (1 file)</option>
          <option value='pfp_file_path'>Profile Picture (1 file)</option>
          <option value='video_file_path'>Intro Video (1 file)</option>
        </select>
      </div>

      <div className='mb-6'>
        <input
          id='file-upload'
          type='file'
          onChange={handleFileSelect}
          accept={
            field === 'cv_file_path'
              ? '.pdf,.doc,.docx'
              : field === 'pfp_file_path'
                ? 'image/*'
                : 'video/*'
          }
          className='block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400'
        />

        {selectedFile && (
          <div className='p-4 mt-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <p className='mb-1 text-sm font-medium text-gray-700 dark:text-gray-300'>
              Target: {FIELD_LABELS[field]}
            </p>
            <p className='flex items-center gap-2 mb-2'>
              <span className='text-2xl'>{getFileIcon(selectedFile.type)}</span>
              <strong className='text-gray-900 dark:text-white'>
                {selectedFile.name}
              </strong>
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Type: {selectedFile.type || 'unknown'} | Size:{' '}
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploadProgress.status === 'uploading'}
        className={`w-full px-6 py-3 text-white font-semibold rounded-lg transition-colors ${
          selectedFile && uploadProgress.status !== 'uploading'
            ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {uploadProgress.status === 'uploading' ? 'Uploading...' : 'Upload File'}
      </button>

      {uploadProgress.status === 'uploading' && (
        <div className='mt-6'>
          <div className='mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
            Upload Progress: {Math.round(uploadProgress.progress)}%
          </div>
          <div className='w-full h-4 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-700'>
            <div
              className='h-full transition-all duration-300 bg-green-500 dark:bg-green-600'
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
        </div>
      )}

      {uploadProgress.status === 'success' && (
        <div className='p-4 mt-6 text-green-800 bg-green-100 border-l-4 border-green-500 rounded dark:bg-green-900 dark:text-green-200'>
          ✓ File uploaded successfully!
        </div>
      )}

      {uploadProgress.status === 'error' && uploadProgress.error && (
        <div className='p-4 mt-6 text-red-800 bg-red-100 border-l-4 border-red-500 rounded dark:bg-red-900 dark:text-red-200'>
          ✗ {uploadProgress.error}
        </div>
      )}

      <div className='p-4 mt-8 text-sm bg-blue-50 dark:bg-blue-900 rounded-lg'>
        <strong className='text-blue-900 dark:text-blue-200'>
          Supported files:
        </strong>
        <ul className='mt-2 space-y-1 text-blue-800 dark:text-blue-300'>
          <li>• One CV file (PDF, DOC, DOCX)</li>
          <li>• One profile image (JPG, PNG, WebP, etc.)</li>
          <li>• One intro video (MP4, MOV, AVI, WebM, etc.)</li>
        </ul>
        <p className='mt-2 text-blue-900 dark:text-blue-200'>
          Uploading again to the same type replaces the previous file.
        </p>
        <p className='mt-3 font-semibold text-blue-900 dark:text-blue-200'>
          Maximum file size: 50MB
        </p>
      </div>
    </div>
  );
};
