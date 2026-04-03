import React, { useState } from 'react';
import { FileUploadHybrid } from './FileUploadHybrid';
import { FileListHybrid } from './FileListHybrid';

interface FileTestViewProps {
  userId: string;
}

export const FileTestView: React.FC<FileTestViewProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('upload');

  return (
    <div className='w-full h-full'>
      <div className='p-6 mb-6 bg-yellow-100 border-l-4 border-yellow-500 dark:bg-yellow-900 dark:border-yellow-700'>
        <h2 className='mb-2 text-xl font-bold text-yellow-800 dark:text-yellow-200'>
          🧪 File Upload Test Area
        </h2>
        <p className='text-yellow-700 dark:text-yellow-300'>
          This is a temporary testing section. Upload videos or CV files (PDF,
          DOC, DOCX) and see them listed below.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className='flex gap-2 mb-6 border-b border-gray-300 dark:border-gray-700'>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'upload'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📤 Upload Files
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'list'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📁 My Files
        </button>
      </div>

      {/* Tab Content */}
      <div className='overflow-auto'>
        {activeTab === 'upload' ? (
          <FileUploadHybrid userId={userId} />
        ) : (
          <FileListHybrid userId={userId} />
        )}
      </div>
    </div>
  );
};
