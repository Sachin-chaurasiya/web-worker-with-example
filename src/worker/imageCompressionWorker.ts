/// <reference lib="webworker" />

const ctx = self as DedicatedWorkerGlobalScope;

import { decode, encode } from '@jsquash/webp';

ctx.onmessage = async (
  event: MessageEvent<{
    id: number;
    imageFile: File;
    options: { quality: number };
  }>
) => {
  // make sure the wasm is loaded
  await import('@jsquash/webp');

  const { imageFile, options, id } = event.data;
  const fileBuffer = await imageFile.arrayBuffer();
  try {
    const imageData = await decode(fileBuffer);
    const compressedBuffer = await encode(imageData, options);
    const compressedBlob = new Blob([compressedBuffer], {
      type: imageFile.type,
    });
    ctx.postMessage({ id, blob: compressedBlob });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    ctx.postMessage({ id, error: message });
  }
};

export {};
