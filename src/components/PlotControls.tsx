import React, { useCallback, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface PlotControlsProps {
  start: number;
  windowSize: number;
  interval: number;
  increment: number;
  downsamplingThreshold: number;
  isPlaying: boolean;
  totalPoints: number;
  onStartChange: (value: number) => void;
  onWindowSizeChange: (value: number) => void;
  onIntervalChange: (value: number) => void;
  onIncrementChange: (value: number) => void;
  onDownsamplingThresholdChange: (value: number) => void;
  onPlayToggle: () => void;
}

const PlotControls: React.FC<PlotControlsProps> = React.memo(
  ({
    start,
    windowSize,
    interval,
    increment,
    downsamplingThreshold,
    isPlaying,
    totalPoints,
    onStartChange,
    onWindowSizeChange,
    onIntervalChange,
    onIncrementChange,
    onDownsamplingThresholdChange,
    onPlayToggle,
  }) => {
    const maxStart = Math.max(totalPoints - windowSize, 0);

    const [showTooltip, setShowTooltip] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseEnter = useCallback(() => {
      if (totalPoints === 0) {
        setShowTooltip(true);
      }
    }, [totalPoints]);

    const handleMouseLeave = useCallback(() => {
      setShowTooltip(false);
    }, []);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (totalPoints === 0) {
          setMousePosition({ x: e.clientX, y: e.clientY });
        }
      },
      [totalPoints],
    );

    const handleStartChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
          onStartChange(value);
        }
      },
      [onStartChange],
    );

    const validateStart = useCallback(
      (
        e:
          | React.FocusEvent<HTMLInputElement>
          | React.KeyboardEvent<HTMLInputElement>,
      ) => {
        const value = parseInt(e.currentTarget.value);
        if (!isNaN(value)) {
          const validatedValue = Math.max(0, Math.min(value, maxStart));
          if (validatedValue !== value) {
            onStartChange(validatedValue);
          }
        } else {
          onStartChange(start);
        }
      },
      [maxStart, onStartChange, start],
    );

    const handleWindowSizeChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
          onWindowSizeChange(value);
        }
      },
      [onWindowSizeChange],
    );

    const validateWindowSize = useCallback(
      (
        e:
          | React.FocusEvent<HTMLInputElement>
          | React.KeyboardEvent<HTMLInputElement>,
      ) => {
        const value = parseInt(e.currentTarget.value);
        if (!isNaN(value)) {
          const validatedValue = Math.max(1, Math.min(value, totalPoints));
          if (validatedValue !== value) {
            onWindowSizeChange(validatedValue);
          }
        } else {
          onWindowSizeChange(windowSize);
        }
      },
      [onWindowSizeChange, windowSize, totalPoints],
    );

    const handleIntervalChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
          onIntervalChange(value);
        }
      },
      [onIntervalChange],
    );

    const validateInterval = useCallback(
      (
        e:
          | React.FocusEvent<HTMLInputElement>
          | React.KeyboardEvent<HTMLInputElement>,
      ) => {
        const value = parseInt(e.currentTarget.value);
        if (!isNaN(value)) {
          const validatedValue = Math.max(16, value);
          if (validatedValue !== value) {
            onIntervalChange(validatedValue);
          }
        } else {
          onIntervalChange(interval);
        }
      },
      [onIntervalChange, interval],
    );

    const handleIncrementChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
          onIncrementChange(value);
        }
      },
      [onIncrementChange],
    );

    const validateIncrement = useCallback(
      (
        e:
          | React.FocusEvent<HTMLInputElement>
          | React.KeyboardEvent<HTMLInputElement>,
      ) => {
        const value = parseInt(e.currentTarget.value);
        if (!isNaN(value)) {
          const validatedValue = Math.max(1, value);
          if (validatedValue !== value) {
            onIncrementChange(validatedValue);
          }
        } else {
          onIncrementChange(increment);
        }
      },
      [onIncrementChange, increment],
    );

    const handleKeyDown = useCallback(
      (
        validator: (
          e:
            | React.FocusEvent<HTMLInputElement>
            | React.KeyboardEvent<HTMLInputElement>,
        ) => void,
      ) =>
        (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            validator(e);
          }
        },
      [],
    );

    const handleDownsamplingThresholdChange = useCallback(
      (value: number[]) => {
        onDownsamplingThresholdChange(value[0]);
      },
      [onDownsamplingThresholdChange],
    );

    return (
      <>
        <div
          className={
            totalPoints === 0 ? 'relative cursor-not-allowed' : 'relative'
          }
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          <Card className={`mb-4 ${totalPoints === 0 ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle>Plot Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                <div>
                  <Label htmlFor="start-input">Start Position (S)</Label>
                  <Input
                    id="start-input"
                    type="number"
                    disabled={totalPoints === 0}
                    value={totalPoints === 0 ? 0 : start}
                    onChange={handleStartChange}
                    onBlur={validateStart}
                    onKeyDown={handleKeyDown(validateStart)}
                    min={0}
                    max={maxStart}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="window-size-input">Window Size (N)</Label>
                  <Input
                    id="window-size-input"
                    type="number"
                    disabled={totalPoints === 0}
                    value={totalPoints === 0 ? 0 : windowSize}
                    onChange={handleWindowSizeChange}
                    onBlur={validateWindowSize}
                    onKeyDown={handleKeyDown(validateWindowSize)}
                    min={1}
                    max={totalPoints}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="interval-input">Update Interval (T) ms</Label>
                  <Input
                    id="interval-input"
                    type="number"
                    disabled={totalPoints === 0}
                    value={interval}
                    onChange={handleIntervalChange}
                    onBlur={validateInterval}
                    onKeyDown={handleKeyDown(validateInterval)}
                    min={16}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="increment-input">Increment Size (P)</Label>
                  <Input
                    id="increment-input"
                    type="number"
                    disabled={totalPoints === 0}
                    value={increment}
                    onChange={handleIncrementChange}
                    onBlur={validateIncrement}
                    onKeyDown={handleKeyDown(validateIncrement)}
                    min={1}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2 xl:col-span-1">
                  <Label htmlFor="downsampling-threshold-slider">
                    Downsampling threshold
                  </Label>
                  <div className="relative mt-1 flex h-10 items-center">
                    <Slider
                      id="downsampling-threshold-slider"
                      disabled={totalPoints === 0}
                      min={500}
                      max={10000}
                      step={500}
                      value={[downsamplingThreshold]}
                      onValueChange={handleDownsamplingThresholdChange}
                    />
                    <div
                      className="absolute -translate-x-1/2 translate-y-6 transform rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
                      style={{
                        left: `${((downsamplingThreshold - 500) / (10000 - 500)) * 100}%`,
                      }}
                    >
                      {downsamplingThreshold.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-end md:col-span-2 xl:col-span-1">
                  <Button
                    onClick={onPlayToggle}
                    disabled={totalPoints === 0}
                    variant={isPlaying ? 'outline' : 'default'}
                    className="w-full"
                  >
                    {isPlaying ? 'Stop' : 'Start'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {showTooltip && totalPoints === 0 && (
          <div
            className="pointer-events-none fixed z-50 rounded bg-black px-2 py-1 text-sm text-white"
            style={{
              left: `${mousePosition.x + 10}px`,
              top: `${mousePosition.y + 10}px`,
              maxWidth: '400px',
            }}
          >
            Ensure that a file is selected and/or there is data to plot
          </div>
        )}
      </>
    );
  },
);

export default PlotControls;
