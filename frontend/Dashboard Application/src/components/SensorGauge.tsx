import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

interface SensorGaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  threshold: number;
}

// Calculate the status color based on value compared to threshold
const statusVariants = cva(
  "font-medium text-xl",
  {
    variants: {
      status: {
        danger: "text-red-500",
        warning: "text-yellow-500",
        good: "text-green-500",
      },
    },
    defaultVariants: {
      status: "good",
    },
  }
);

export const SensorGauge: React.FC<SensorGaugeProps> = ({ value, min, max, label, threshold }) => {
  // Normalize value between 0 and 100% for the gauge
  const normalizedValue = Math.max(min, Math.min(max, value));
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  
  // Determine status based on threshold
  let status: "danger" | "warning" | "good" = "good";
  if (value <= threshold) {
    status = "danger";
  } else if (value <= threshold + 15) {
    status = "warning";
  }
  
  // Gauge colors
  const COLORS = {
    danger: "#ef4444",
    warning: "#f59e0b",
    good: "#10b981",
    background: "#e5e7eb"
  };
  
  // Gauge data
  const gaugeData = [
    { name: 'Value', value: percentage },
    { name: 'Remaining', value: 100 - percentage }
  ];
  
  return (
    <div className="w-full">
      <div className="h-36 flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell key="value" fill={COLORS[status]} />
              <Cell key="remaining" fill={COLORS.background} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end mb-5">
          <span className={cn(statusVariants({ status }))}>{value}{label}</span>
          {/* <span className="text-[10px] text-muted-foreground mt-1">
            Soil Moisture
          </span> */}
        </div>
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>Low ({min}%)</span>
        <span>Optimal (50%)</span>
        <span>High ({max}%)</span>
      </div>
    </div>
  );
};