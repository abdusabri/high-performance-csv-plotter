import { useState, useCallback, useEffect, useRef } from 'react';
import { DataPoint } from '@/types';

export function useDataStream() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const pointsCollectionRef = useRef<DataPoint[]>([]);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setData([]);

    pointsCollectionRef.current = [];

    try {
      if (workerRef.current) {
        workerRef.current.terminate();
      }

      workerRef.current = new Worker(
        new URL('@/workers/csvParser.worker.ts', import.meta.url).href,
      );

      workerRef.current.onmessage = (event) => {
        const { action } = event.data;

        if (action === 'progress') {
          const { percentComplete } = event.data;
          setProgress(percentComplete);
        } else if (action === 'result') {
          const { points } = event.data;

          if (points && points.length > 0) {
            pointsCollectionRef.current.push(...points);
          }
        } else if (action === 'complete') {
          const { totalPoints } = event.data;

          if (pointsCollectionRef.current.length !== totalPoints) {
            console.warn(
              `Worker reported ${totalPoints} points, but ${pointsCollectionRef.current.length} were collected.`,
            );
          }

          pointsCollectionRef.current.sort((a, b) => a.x - b.x);
          setData([...pointsCollectionRef.current]);
          setIsLoading(false);
        }
      };

      workerRef.current.onerror = (e) => {
        setError(`Worker error: ${e.message}`);
        setIsLoading(false);
      };

      const arrayBuffer = await file.arrayBuffer();
      workerRef.current.postMessage({
        action: 'parse',
        file: arrayBuffer,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Error processing file: ${message}`);
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, progress, error, processFile };
}
