# High-Performance CSV Plotter

This project contains a React and TypeScript app for plotting large CSV datasets in the browser.

Live app: [plotting.abdusabri.com](https://plotting.abdusabri.com/)

## Overview

- React 18 + TypeScript app built with Vite
- Browser-based CSV upload and parsing
- Web Worker-based parsing to keep the UI responsive during file loading
- Sliding window playback with configurable start position, window size, update interval, and increment size
- `uPlot`-based chart rendering with downsampling for large windows
- Window-level `min`, `max`, `average`, and `variance` calculations

## Prerequisites

- Node.js: `22.14.0` or newer
- npm: `10.9.2` or newer

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The app runs at [http://localhost:5173](http://localhost:5173).

### 3. Load a dataset

Use the file picker in the app to load a local CSV file, or use the linked 2M-row sample file exposed in the UI.

## Data Format

The current parser expects a simple two-column numeric CSV:

```csv
0,12.4
1,12.9
2,11.7
```

- Each row should contain `x,y`
- Rows that do not parse into numeric pairs are skipped
- The parser does not currently support headers or column selection

## Scripts

| Script                 | Description                                                      |
| :--------------------- | :--------------------------------------------------------------- |
| `npm run dev`          | Starts the Vite development server.                              |
| `npm run build`        | Runs TypeScript build checks and bundles the app for production. |
| `npm run lint`         | Runs ESLint.                                                     |
| `npm run preview`      | Serves the production build locally.                             |
| `npm run format`       | Formats the repository with Prettier.                            |
| `npm run format:check` | Checks repository formatting without writing changes.            |

## Project Structure

```text
src/
    App.tsx                  # Main page layout and top-level composition
    main.tsx                 # App entrypoint
    index.css                # Global styles
    constants/               # Default plotting and playback settings
    types/                   # Shared TypeScript types
    hooks/
        useDataStream.ts     # File loading, worker lifecycle, and progress state
        usePlotWindow.ts     # Sliding window state and playback loop
    utils/
        dataProcessor.ts     # Window aggregates and downsampling logic
    workers/
        csvParser.worker.ts  # Chunked CSV parsing in a Web Worker
    components/
        FileSelector.tsx     # File upload and sample data entry point
        PlotControls.tsx     # Window and playback controls
        DataPlot.tsx         # uPlot chart wrapper
        Aggregates.tsx       # Aggregate metrics display
        ui/                  # Shared UI primitives
```

## Implementation Notes

- Vite, React, and TypeScript keep the app small and straightforward while still making the data flow easy to reason about.
- `uPlot` and `uplot-react` are used for chart rendering because the app is centered on plotting large datasets efficiently.
- Tailwind CSS and `shadcn/ui` are used for the controls and layout so the implementation can stay focused on the plotting behavior.
- CSV parsing runs in [`src/workers/csvParser.worker.ts`](/home/abdu/dev/abdu-fe-data-plot/src/workers/csvParser.worker.ts), where the file is read in chunks and posted back to the main thread in batches.
- The playback loop in [`src/hooks/usePlotWindow.ts`](/home/abdu/dev/abdu-fe-data-plot/src/hooks/usePlotWindow.ts) uses `requestAnimationFrame` while still respecting the configured update interval.
- [`src/utils/dataProcessor.ts`](/home/abdu/dev/abdu-fe-data-plot/src/utils/dataProcessor.ts) calculates aggregates and downsampled chart data together for the active window.

## Performance Notes

- File parsing happens off the main thread, so loading large files does not block React rendering.
- The worker reads the file in chunks instead of decoding the whole file in one synchronous pass.
- The chart renders a downsampled view of the active window rather than every point in that window.
- Aggregate metrics are calculated from the full active window, not from the downsampled subset.
- In practice, the active window size is the main performance lever once the file has been loaded.

## Limitations

- The parser currently expects a narrow two-column numeric CSV format.
- The full parsed dataset is kept in browser memory after loading.
- Aggregate calculations are recomputed for each active window.
