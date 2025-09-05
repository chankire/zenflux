import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RefreshIndicatorProps {
  lastRefreshTime: Date;
  timezone?: string;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
}

const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  lastRefreshTime,
  timezone,
  onRefresh,
  isLoading = false
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [displayTime, setDisplayTime] = useState('');

  // Auto-detect user timezone if not provided
  const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const formatRefreshTime = () => {
      const now = new Date();
      const diffMs = now.getTime() - lastRefreshTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Create timezone-aware formatter
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: userTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const timeString = formatter.format(lastRefreshTime);
      
      // Format timezone display (continent/country)
      const timezoneDisplay = userTimezone.replace('_', '/');

      if (diffHours < 24) {
        // Same day
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const refreshDate = new Date(lastRefreshTime);
        refreshDate.setHours(0, 0, 0, 0);
        
        if (today.getTime() === refreshDate.getTime()) {
          return `Last refreshed Today at ${timeString} (${timezoneDisplay})`;
        } else {
          return `Last refreshed Yesterday at ${timeString} (${timezoneDisplay})`;
        }
      } else {
        // More than 24 hours ago
        const dateFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: userTimezone,
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        
        const dateString = dateFormatter.format(lastRefreshTime);
        return `Last refreshed ${dateString} at ${timeString} (${timezoneDisplay})`;
      }
    };

    setDisplayTime(formatRefreshTime());
  }, [lastRefreshTime, userTimezone, currentTime]);

  const getRelativeTime = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastRefreshTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return 'Over a week ago';
  };

  const getStatusColor = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastRefreshTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 5) return 'text-green-600';
    if (diffMinutes < 15) return 'text-yellow-600';
    if (diffMinutes < 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Clock className={`h-4 w-4 ${getStatusColor()}`} />
          <span className={`text-sm ${getStatusColor()}`}>
            {getRelativeTime()}
          </span>
        </div>
        
        {onRefresh && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="h-8 px-3"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm font-medium">{displayTime}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click to refresh data
              </p>
            </TooltipContent>
          </Tooltip>
        )}

        {!onRefresh && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <span className="text-xs text-muted-foreground">
                  {displayTime.split('(')[0].trim()}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm font-medium">{displayTime}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default RefreshIndicator;