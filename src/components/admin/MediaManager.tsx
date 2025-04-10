import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Copy, Image, Film, File, Check } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { storage, ref, uploadManager, listFiles, downloadFile } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import imageCompression from 'browser-image-compression';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true
};

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadProgress?: number;
}

const MediaManager: React.FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const mediaRef = ref(storage, 'media');
      const result = await listFiles(mediaRef);
      
      const filesData = await Promise.all(
        result.items.map(async (item) => {
          const url = await downloadFile(item);
          return {
            id: item.name,
            name: item.name.split('-').slice(1).join('-'), // Remove UUID prefix
            url,
            type: item.name.split('.').pop()?.toLowerCase() || '',
            size: 0 // Size will be fetched when needed
          };
        })
      );

      setFiles(filesData);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} exceeds maximum size of 500MB`);
        continue;
      }

      const id = `${Date.now()}-${file.name}`;
      let fileToUpload = file;

      // Compress images if they're too large
      if (file.type.startsWith('image/')) {
        try {
          fileToUpload = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS);
        } catch (error) {
          console.error('Error compressing image:', error);
          // Continue with original file if compression fails
        }
      }

      try {
        await uploadManager.addTask(id, fileToUpload, {
          onProgress: (progress) => {
            setUploading(prev => ({ ...prev, [id]: progress }));
          },
          onComplete: (url) => {
            setFiles(prev => [...prev, {
              id,
              name: file.name,
              url,
              type: file.type,
              size: file.size
            }]);
            setUploading(prev => {
              const { [id]: removed, ...rest } = prev;
              return rest;
            });
            toast.success(`${file.name} uploaded successfully`);
          },
          onError: (error) => {
            console.error('Error uploading file:', error);
            toast.error(`Failed to upload ${file.name}`);
            setUploading(prev => {
              const { [id]: removed, ...rest } = prev;
              return rest;
            });
          }
        });
      } catch (error) {
        console.error('Error starting upload for ' + file.name + ':', error);
        toast.error(`Failed to start upload for ${file.name}`);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'application/pdf': ['.pdf']
    }
  });

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Film;
    return File;
  };

  return (
    <div className="space-y-6">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 hover:border-purple-500/50'
      }`}>
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-gray-400">
          or click to select files (max 500MB)
        </p>
      </div>

      {Object.keys(uploading).length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Uploading</h3>
          {Object.entries(uploading).map(([id, progress]) => (
            <div key={id} className="glass p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm">{id.split('-').slice(1).join('-')}</span>
                <span className="text-sm">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.type);
            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-4 rounded-lg"
              >
                <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-white/5">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1 mr-2">{file.name}</span>
                  <CopyToClipboard text={file.url} onCopy={() => handleCopy(file.id)}>
                    <button className="p-2 hover:bg-white/10 rounded-full">
                      {copiedId === file.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </CopyToClipboard>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaManager;