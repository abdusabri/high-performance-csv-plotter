import { useMemo, useCallback } from 'react';
import FileSelector from './components/FileSelector';
import PlotControls from './components/PlotControls';
import DataPlot from './components/DataPlot';
import AggregatesDisplay from './components/Aggregates';
import { useDataStream } from './hooks/useDataStream';
import { usePlotWindow } from './hooks/usePlotWindow';
import { processData } from './utils/dataProcessor';
import {
  DEFAULT_WINDOW_SIZE,
  DEFAULT_INTERVAL,
  DEFAULT_INCREMENT,
  DEFAULT_DOWNSAMPLING_THRESHOLD,
} from './constants';

function App() {
  const { data, isLoading, progress, error, processFile } = useDataStream();

  const {
    start,
    setStart,
    windowSize,
    setWindowSize,
    interval,
    setInterval,
    increment,
    setIncrement,
    downsamplingThreshold,
    setDownsamplingThreshold,
    isPlaying,
    togglePlay,
  } = usePlotWindow({
    data,
    defaultWindowSize: DEFAULT_WINDOW_SIZE,
    defaultInterval: DEFAULT_INTERVAL,
    defaultIncrement: DEFAULT_INCREMENT,
    defaultDownsamplingThreshold: DEFAULT_DOWNSAMPLING_THRESHOLD,
  });

  const { downsampledData, aggregates } = useMemo(() => {
    if (!data || !data.length) {
      return {
        downsampledData: [],
        aggregates: { min: 0, max: 0, average: 0, variance: 0 },
      };
    }
    const result = processData(data, start, windowSize, downsamplingThreshold);
    return result;
  }, [data, start, windowSize, downsamplingThreshold]);

  const handleFileSelect = useCallback(
    (file: File) => {
      processFile(file);
    },
    [processFile],
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-foreground">
            High-Performance CSV Plotter
          </h1>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-6">
        <FileSelector
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
          progress={progress}
        />

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <>
          <div className="mb-2">
            <p className="text-sm text-muted-foreground">
              {data.length > 0
                ? `Total data points: ${data.length.toLocaleString()}`
                : 'Select a CSV file to begin'}
            </p>
          </div>

          <PlotControls
            start={start}
            windowSize={windowSize}
            interval={interval}
            increment={increment}
            downsamplingThreshold={downsamplingThreshold}
            isPlaying={isPlaying}
            totalPoints={data.length}
            onStartChange={setStart}
            onWindowSizeChange={setWindowSize}
            onIntervalChange={setInterval}
            onIncrementChange={setIncrement}
            onDownsamplingThresholdChange={setDownsamplingThreshold}
            onPlayToggle={togglePlay}
          />

          <div className="mb-4">
            <DataPlot data={downsampledData} />
          </div>

          <AggregatesDisplay
            aggregates={aggregates}
            hasData={data.length > 0}
          />
        </>
      </main>
    </div>
  );
}

export default App;
