import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Aggregates } from '@/types';

interface AggregatesDisplayProps {
  aggregates: Aggregates;
  hasData: boolean;
}

const formatValue = (value: number, digits: number, hasData: boolean) =>
  hasData ? value.toFixed(digits) : '--';

const AggregatesDisplay: React.FC<AggregatesDisplayProps> = React.memo(
  ({ aggregates, hasData }) => {
    const { min, max, average, variance } = aggregates;

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Data Aggregates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Min</h3>
              <p className="text-2xl font-medium">
                {formatValue(min, 4, hasData)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Max</h3>
              <p className="text-2xl font-medium">
                {formatValue(max, 4, hasData)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Average
              </h3>
              <p className="text-2xl font-medium">
                {formatValue(average, 4, hasData)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Variance
              </h3>
              <p className="text-2xl font-medium">
                {formatValue(variance, 6, hasData)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
);

export default AggregatesDisplay;
