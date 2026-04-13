const DEFAULT_CHUNK_SIZE = 1024 * 1024; // 1MB

export function splitFile(
  data: ArrayBuffer,
  chunkSize: number = DEFAULT_CHUNK_SIZE
): Uint8Array[] {
  const bytes = new Uint8Array(data);
  const chunks: Uint8Array[] = [];
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    chunks.push(bytes.slice(offset, offset + chunkSize));
  }
  return chunks;
}

export async function* splitFileStream(
  file: Blob,
  chunkSize: number = DEFAULT_CHUNK_SIZE
): AsyncGenerator<{ index: number; total: number; data: Uint8Array }> {
  const total = Math.ceil(file.size / chunkSize);
  for (let i = 0; i < total; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const slice = file.slice(start, end);
    const buffer = await slice.arrayBuffer();
    yield { index: i, total, data: new Uint8Array(buffer) };
  }
}

export function reassemble(chunks: Uint8Array[]): ArrayBuffer {
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result.buffer;
}

export function totalChunks(fileSize: number, chunkSize: number = DEFAULT_CHUNK_SIZE): number {
  return Math.ceil(fileSize / chunkSize);
}
