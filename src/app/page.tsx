'use client';

import { useState, useRef, useEffect } from 'react';
import ImageList, { ImgData } from '../components/ImageList';

export default function Home() {
  const [images, setImages] = useState<ImgData[]>([]);
  const [text, setText] = useState('');

  const workerRef = useRef<Worker | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !workerRef.current) return;
    const filesArray = Array.from(files);
    filesArray.forEach((file, index) => {
      const id = Date.now() + index;

      const originalUrl = URL.createObjectURL(file);
      setImages((prev) => [
        ...prev,
        { id, file, status: 'compressing', originalUrl },
      ]);

      // Send the file with its id to the worker.
      workerRef.current!.postMessage({
        id,
        imageFile: file,
        options: { quality: 75 },
      });
    });
  };

  // Initialize the worker once when the component mounts.
  useEffect(() => {
    const worker = new Worker(
      new URL('../worker/imageCompressionWorker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    // Listen for messages from the worker.
    worker.onmessage = (
      event: MessageEvent<{ id: number; blob?: Blob; error?: string }>
    ) => {
      const { id, blob: compressedBlob, error } = event.data;
      setImages((prev) =>
        prev.map((img) => {
          if (img.id === id) {
            if (error) return { ...img, status: 'error', error };
            const compressedSize = compressedBlob!.size;
            const compressedUrl = URL.createObjectURL(compressedBlob!);
            return { ...img, status: 'done', compressedUrl, compressedSize };
          }
          return img;
        })
      );
    };

    return () => {
      worker.terminate();
    };
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        Image Compression with Web Workers
      </h1>
      <div className="rounded shadow p-4 mb-4 flex flex-col gap-2">
        <p className="text-sm">
          While images are compressing, you can interact with the textarea below
          and observe the text being typed and UI is not frozen.
        </p>
        <p className="text-sm">
          Even you can open the dev tools and then open the performance tab and
          see the INP(Interaction to Next Paint) is very low.
        </p>
        <textarea
          className="w-full h-32 border rounded p-2 text-black"
          placeholder="Type here while images are compressing..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
      </div>
      <div className="rounded shadow p-4">
        <input
          type="file"
          multiple
          accept="image/webp"
          onChange={handleFileChange}
        />
        <ImageList images={images} />
      </div>
    </div>
  );
}
