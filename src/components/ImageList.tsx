/* eslint-disable @next/next/no-img-element */
import React from 'react';

export type ImgData = {
  id: number;
  file: File;
  status: 'compressing' | 'done' | 'error';
  originalUrl: string;
  compressedUrl?: string;
  error?: string;
  compressedSize?: number;
};

interface ImageListProps {
  images: ImgData[];
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ImageList: React.FC<ImageListProps> = ({ images }) => {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Image List</h2>
      <div className="space-y-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="flex flex-col md:flex-row items-center border p-4 rounded"
          >
            <div className="flex-1 flex flex-col items-center">
              <p className="font-bold mb-2">Original</p>
              <img
                src={img.originalUrl}
                alt="Original"
                className="w-32 h-32 object-cover rounded border mb-2"
              />
              <p className="text-sm">Size: {formatBytes(img.file.size)}</p>
            </div>
            {img.status === 'done' && img.compressedUrl ? (
              <div className="flex-1 flex flex-col items-center mt-4 md:mt-0">
                <p className="font-bold mb-2">Compressed</p>
                <img
                  src={img.compressedUrl}
                  alt="Compressed"
                  className="w-32 h-32 object-cover rounded border mb-2"
                />
                <p className="text-sm">
                  Size:{' '}
                  {img.compressedSize ? formatBytes(img.compressedSize) : 'N/A'}
                </p>
                <a
                  href={img.compressedUrl}
                  download={`${img.file.name.replace(
                    /\.[^/.]+$/,
                    ''
                  )}-compressed.webp`}
                  className="mt-2 inline-block px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Download
                </a>
              </div>
            ) : img.status === 'compressing' ? (
              <div className="flex-1 flex flex-col items-center mt-4 md:mt-0">
                <p className="font-bold">Compressing...</p>
              </div>
            ) : img.status === 'error' ? (
              <div className="flex-1 flex flex-col items-center mt-4 md:mt-0">
                <p className="font-bold text-red-500">Error in compression</p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageList;
