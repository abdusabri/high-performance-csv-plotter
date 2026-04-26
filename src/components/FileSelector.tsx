import React, { useCallback } from 'react';
import { Button } from './ui/button';

interface FileSelectorProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  progress: number;
}

const FileSelector: React.FC<FileSelectorProps> = React.memo(
  ({ onFileSelect, isLoading, progress }) => {
    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          onFileSelect(file);
        }
      },
      [onFileSelect],
    );

    return (
      <div className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="file-input"
            disabled={isLoading}
          />
          <label htmlFor="file-input">
            <Button
              variant="outline"
              disabled={isLoading}
              asChild
              className="cursor-pointer"
            >
              <span>Select CSV File</span>
            </Button>
          </label>
          <a
            href="https://onedrive.live.com/?redeem=aHR0cHM6Ly8xZHJ2Lm1zL3UvYy8zNWYwYjA3ZTAxZmNhYmQxL0lRQjQxOUFKWm1fMlNvcUpycThSdlBiYkFmWno1V1EzcmxoQnhLN0JLQzM5TDZzP2U9cU54TGdy&cid=35F0B07E01FCABD1&id=35F0B07E01FCABD1%21s09d0d7786f664af68a89aeaf11bcf6db&parId=35F0B07E01FCABD1%21112&o=OneUp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:underline"
          >
            or use this 2M-row sample CSV
          </a>

          {isLoading && (
            <div className="w-full sm:max-w-xl sm:flex-1">
              <p className="mb-1 text-sm">Loading: {progress}%</p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default FileSelector;
