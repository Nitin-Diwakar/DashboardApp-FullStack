// src/components/ui/progress.tsx - Enhanced Progress Component
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    threshold?: number;
    showThreshold?: boolean;
  }
>(({ className, value, threshold, showThreshold = false, ...props }, ref) => {
  const progressValue = value || 0;
  const thresholdValue = threshold || 50;
  
  // Color logic based on value and threshold
  const getProgressColor = () => {
    if (threshold) {
      if (progressValue < thresholdValue * 0.7) return "bg-red-500";
      if (progressValue < thresholdValue) return "bg-orange-500";
      if (progressValue <= thresholdValue * 1.2) return "bg-green-500";
      return "bg-blue-500";
    }
    
    if (progressValue < 30) return "bg-red-500";
    if (progressValue < 60) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <div className="relative">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn("h-full w-full flex-1 transition-all", getProgressColor())}
          style={{ transform: `translateX(-${100 - (progressValue || 0)}%)` }}
        />
        
        {/* Threshold indicator */}
        {showThreshold && threshold && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-600 opacity-70"
            style={{ left: `${(thresholdValue / 100) * 100}%` }}
          />
        )}
      </ProgressPrimitive.Root>
      
      {/* Value display */}
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>0%</span>
        {showThreshold && threshold && (
          <span className="text-red-600">Threshold: {thresholdValue}%</span>
        )}
        <span>100%</span>
      </div>
    </div>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };