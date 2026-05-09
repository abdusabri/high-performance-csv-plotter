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

interface PlaybackState {
  start: number;
  windowSize: number;
  isPlaying: boolean;
}

export function usePlotWindow({
  data,
  defaultWindowSize = DEFAULT_WINDOW_SIZE,
  defaultInterval = DEFAULT_INTERVAL,
  defaultIncrement = DEFAULT_INCREMENT,
  defaultDownsamplingThreshold = DEFAULT_DOWNSAMPLING_THRESHOLD,
}: UsePlotWindowProps) {
  const dataLength = data.length;
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    start: 0,
    windowSize: defaultWindowSize,
    isPlaying: false,
  });
  const [interval, setIntervalState] = useState(defaultInterval);
  const [increment, setIncrementState] = useState(defaultIncrement);
  const [downsamplingThreshold, setDownsamplingThresholdState] = useState(
    defaultDownsamplingThreshold,
  );

  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const maxStart = Math.max(dataLength - playbackState.windowSize, 0);

  const togglePlay = useCallback(() => {
    setPlaybackState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  }, []);

  const animateFrame = useCallback(
    (timestamp: number) => {
      if (timestamp - lastUpdateTimeRef.current >= interval) {
        setPlaybackState((prev) => {
          const nextStart = Math.min(prev.start + increment, maxStart);

          return {
            ...prev,
            start: nextStart,
            isPlaying: nextStart < maxStart,
          };
        });

        lastUpdateTimeRef.current = timestamp;
      }

      if (playbackState.isPlaying) {
        animationRef.current = requestAnimationFrame(animateFrame);
      }
    },
    [increment, interval, maxStart, playbackState.isPlaying],
  );

  useEffect(() => {
    if (playbackState.isPlaying) {
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
  }, [playbackState.isPlaying, animateFrame]);

  useEffect(() => {
    setPlaybackState((prev) => ({
      ...prev,
      isPlaying: false,
      start: 0,
      windowSize:
        dataLength > 0
          ? Math.min(defaultWindowSize, dataLength)
          : defaultWindowSize,
    }));
  }, [dataLength, defaultWindowSize]);

  const handleStartChange = useCallback(
    (value: number) => {
      setPlaybackState((prev) => ({
        ...prev,
        start: dataLength === 0 ? 0 : Math.max(0, Math.min(value, maxStart)),
      }));
    },
    [dataLength, maxStart],
  );

  const handleWindowSizeChange = useCallback(
    (value: number) => {
      if (dataLength === 0) {
        setPlaybackState((prev) => ({
          ...prev,
          start: 0,
          windowSize: defaultWindowSize,
        }));
        return;
      }

      const nextWindowSize = Math.max(1, Math.min(value, dataLength));
      setPlaybackState((prev) => ({
        ...prev,
        windowSize: nextWindowSize,
        start: Math.min(prev.start, Math.max(dataLength - nextWindowSize, 0)),
      }));
    },
    [dataLength, defaultWindowSize],
  );

  const handleIntervalChange = useCallback((value: number) => {
    setIntervalState(value);
  }, []);

  const handleIncrementChange = useCallback((value: number) => {
    setIncrementState(value);
  }, []);

  const handleDownsamplingThresholdChange = useCallback((value: number) => {
    setDownsamplingThresholdState(value);
  }, []);

  return {
    start: playbackState.start,
    setStart: handleStartChange,
    windowSize: playbackState.windowSize,
    setWindowSize: handleWindowSizeChange,
    interval,
    setInterval: handleIntervalChange,
    increment,
    setIncrement: handleIncrementChange,
    downsamplingThreshold,
    setDownsamplingThreshold: handleDownsamplingThresholdChange,
    isPlaying: playbackState.isPlaying,
    togglePlay,
  };
}
