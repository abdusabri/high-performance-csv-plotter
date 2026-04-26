import { useState, useCallback, useRef, useEffect } from 'react';
import { DataPoint } from '@/types';
import {
  DEFAULT_WINDOW_SIZE,
  DEFAULT_INTERVAL,
  DEFAULT_INCREMENT,
  DEFAULT_DOWNSAMPLING_THRESHOLD,
} from '@/constants';

interface UsePlotWindowProps {
  data: DataPoint[];
  defaultWindowSize?: number;
  defaultInterval?: number;
  defaultIncrement?: number;
  defaultDownsamplingThreshold?: number;
}

export function usePlotWindow({
  data,
  defaultWindowSize = DEFAULT_WINDOW_SIZE,
  defaultInterval = DEFAULT_INTERVAL,
  defaultIncrement = DEFAULT_INCREMENT,
  defaultDownsamplingThreshold = DEFAULT_DOWNSAMPLING_THRESHOLD,
}: UsePlotWindowProps) {
  const dataLength = data.length;
  const [start, setStart] = useState(0);
  const [windowSize, setWindowSize] = useState(defaultWindowSize);
  const [interval, setInterval] = useState(defaultInterval);
  const [increment, setIncrement] = useState(defaultIncrement);
  const [downsamplingThreshold, setDownsamplingThreshold] = useState(
    defaultDownsamplingThreshold,
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const maxStart = Math.max(dataLength - windowSize, 0);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const animateFrame = useCallback(
    (timestamp: number) => {
      if (timestamp - lastUpdateTimeRef.current >= interval) {
        setStart((prev) => {
          const newStart = prev + increment;
          if (newStart >= maxStart) {
            setIsPlaying(false);
            return maxStart;
          }
          return newStart;
        });

        lastUpdateTimeRef.current = timestamp;
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animateFrame);
      }
    },
    [interval, increment, isPlaying, maxStart],
  );

  useEffect(() => {
    if (isPlaying) {
      lastUpdateTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animateFrame);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, animateFrame]);

  useEffect(() => {
    setIsPlaying(false);
    setStart(0);

    if (dataLength > 0) {
      setWindowSize(Math.min(defaultWindowSize, dataLength));
    } else {
      setWindowSize(defaultWindowSize);
    }
  }, [dataLength, defaultWindowSize]);

  const handleStartChange = useCallback(
    (value: number) => {
      if (dataLength === 0) {
        setStart(0);
        return;
      }

      setStart(Math.max(0, Math.min(value, maxStart)));
    },
    [dataLength, maxStart],
  );

  const handleWindowSizeChange = useCallback(
    (value: number) => {
      if (dataLength === 0) {
        setWindowSize(defaultWindowSize);
        setStart(0);
        return;
      }

      const nextWindowSize = Math.max(1, Math.min(value, dataLength));
      setWindowSize(nextWindowSize);
      setStart((currentStart) =>
        Math.min(currentStart, Math.max(dataLength - nextWindowSize, 0)),
      );
    },
    [dataLength, defaultWindowSize],
  );

  return {
    start,
    setStart: handleStartChange,
    windowSize,
    setWindowSize: handleWindowSizeChange,
    interval,
    setInterval,
    increment,
    setIncrement,
    downsamplingThreshold,
    setDownsamplingThreshold,
    isPlaying,
    togglePlay,
  };
}
