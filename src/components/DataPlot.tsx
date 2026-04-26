import React, { useMemo, useRef, useEffect, useState } from 'react';
import uPlot from 'uplot';
import UplotReact from 'uplot-react';
import 'uplot/dist/uPlot.min.css';
import { DownsampledPoint } from '@/types';

interface DataPlotProps {
  data: DownsampledPoint[];
}

const DataPlot: React.FC<DataPlotProps> = React.memo(({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const plotData = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        new Float64Array([0]),
        new Float64Array([0]),
        new Float64Array([0]),
        new Float64Array([0]),
      ] as uPlot.AlignedData;
    }

    const xs = new Float64Array(data.map((p) => p.x));
    const ys = new Float64Array(data.map((p) => p.y));
    const yMins = new Float64Array(data.map((p) => p.yMin));
    const yMaxs = new Float64Array(data.map((p) => p.yMax));

    return [xs, ys, yMins, yMaxs] as uPlot.AlignedData;
  }, [data]);

  const options = useMemo<uPlot.Options>(() => {
    return {
      width: containerWidth,
      height: 400,
      cursor: {
        y: false,
        lock: false,
      },
      scales: {
        x: {
          time: false,
        },
      },
      series: [
        {
          label: 'X',
        },
        {
          label: 'Y',
          stroke: 'rgba(13, 0, 125, 1)',
          width: 2,
          points: { show: false },
        },
        {
          label: 'Min',
          stroke: 'rgba(13, 0, 125, 0.25)',
          width: 1,
          points: { show: false },
        },
        {
          label: 'Max',
          stroke: 'rgba(13, 0, 125, 0.25)',
          width: 1,
          points: { show: false },
        },
      ],
      axes: [
        {},
        {
          label: 'Value',
          labelSize: 20,
          grid: { show: true },
        },
      ],
    };
  }, [containerWidth]);

  return (
    <div className="h-[440px] rounded border bg-white p-2" ref={containerRef}>
      {!data || data.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-center text-gray-500">
            Select a CSV file to display the plot
          </p>
        </div>
      ) : (
        <UplotReact options={options} data={plotData} />
      )}
    </div>
  );
});

export default DataPlot;
