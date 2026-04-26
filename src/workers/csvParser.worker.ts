/// <reference lib="webworker" />

const ctx = self as unknown as DedicatedWorkerGlobalScope;
ctx.addEventListener('message', (event) => {
  const { action, file } = event.data;

  if (action === 'parse') {
    parseCSV(file);
  }
});

const CHUNK_SIZE = 5 * 1024 * 1024;
const BATCH_SIZE = 100000;

/**
 * Parses the file incrementally to keep memory bounded while streaming
 * progress updates back to the main thread.
 */
async function parseCSV(fileBuffer: ArrayBuffer) {
  let dataPoints: { x: number; y: number }[] = [];
  let buffer = '';
  let totalPoints = 0;
  let totalLines = 0;
  let processedBytes = 0;

  // Reuse one decoder so streamed reads preserve chunk boundaries correctly.
  const decoder = new TextDecoder();

  for (let offset = 0; offset < fileBuffer.byteLength; offset += CHUNK_SIZE) {
    const chunkEnd = Math.min(offset + CHUNK_SIZE, fileBuffer.byteLength);
    const chunk = fileBuffer.slice(offset, chunkEnd);

    const isLastChunk = chunkEnd === fileBuffer.byteLength;
    const text = decoder.decode(chunk, { stream: !isLastChunk });

    buffer += text;
    processedBytes = chunkEnd;
    const lastNewlineIndex = buffer.lastIndexOf('\n');

    if (lastNewlineIndex !== -1) {
      const completeLines = buffer.substring(0, lastNewlineIndex).split('\n');
      buffer = buffer.substring(lastNewlineIndex + 1);

      for (const line of completeLines) {
        totalLines++;

        if (!line.trim()) continue;

        const [x, y] = line.split(',').map((v) => parseFloat(v.trim()));

        if (!isNaN(x) && !isNaN(y)) {
          dataPoints.push({ x, y });
          totalPoints++;
        }

        if (dataPoints.length >= BATCH_SIZE) {
          const pointsBatch = dataPoints.slice();

          ctx.postMessage({
            action: 'result',
            points: pointsBatch,
            count: pointsBatch.length,
            currentTotal: totalPoints,
          });

          dataPoints = [];
          reportProgress(
            processedBytes,
            fileBuffer.byteLength,
            totalPoints,
            totalLines,
          );

          // Yield between batches so the UI can apply progress updates.
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
    }

    reportProgress(
      processedBytes,
      fileBuffer.byteLength,
      totalPoints,
      totalLines,
    );

    // Yield between chunk reads to keep parsing responsive on large files.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  if (buffer.trim()) {
    totalLines++;
    const [x, y] = buffer
      .trim()
      .split(',')
      .map((v) => parseFloat(v.trim()));
    if (!isNaN(x) && !isNaN(y)) {
      dataPoints.push({ x, y });
      totalPoints++;
    }
  }

  if (dataPoints.length > 0) {
    ctx.postMessage({
      action: 'result',
      points: dataPoints.slice(),
      count: dataPoints.length,
      currentTotal: totalPoints,
    });
  }

  ctx.postMessage({
    action: 'complete',
    totalPoints,
    totalLines,
    processedBytes: fileBuffer.byteLength,
  });

  reportProgress(
    fileBuffer.byteLength,
    fileBuffer.byteLength,
    totalPoints,
    totalLines,
  );
}

function reportProgress(
  processed: number,
  total: number,
  points: number,
  lines: number,
) {
  ctx.postMessage({
    action: 'progress',
    processed,
    total,
    percentComplete: Math.round((processed / total) * 100),
    currentPoints: points,
    currentLines: lines,
  });
}
