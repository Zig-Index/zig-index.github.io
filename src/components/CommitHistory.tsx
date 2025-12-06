import React, { memo, useMemo, useState } from 'react';
import { formatDistanceToNow, subDays, isAfter, format, startOfDay } from 'date-fns';
import type { CommitInfo } from '../lib/schemas';
import { GitCommit, ExternalLink } from 'lucide-react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  type ChartConfig 
} from './ui/chart';

interface CommitHistoryProps {
  commits: CommitInfo[];
  isLoading: boolean;
  error?: string;
  repoUrl: string;
}

type TimeRange = '7d' | '1m' | '1y';

const chartConfig = {
  commits: {
    label: "Commits",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const CommitHistory = memo(function CommitHistory({ commits, isLoading, error, repoUrl }: CommitHistoryProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const chartData = useMemo(() => {
    if (!commits || commits.length === 0) return [];

    const now = new Date();
    let daysToSubtract = 7;
    
    if (timeRange === '1m') daysToSubtract = 30;
    if (timeRange === '1y') daysToSubtract = 365;

    const startDate = startOfDay(subDays(now, daysToSubtract));

    // Initialize map with all dates in range set to 0
    const dateMap = new Map<string, number>();
    for (let i = 0; i <= daysToSubtract; i++) {
      const date = subDays(now, daysToSubtract - i);
      dateMap.set(format(date, 'yyyy-MM-dd'), 0);
    }

    // Count commits
    commits.forEach(commit => {
      const commitDate = new Date(commit.author.date);
      if (isAfter(commitDate, startDate)) {
        const key = format(commitDate, 'yyyy-MM-dd');
        if (dateMap.has(key)) {
          dateMap.set(key, (dateMap.get(key) || 0) + 1);
        }
      }
    });

    // Convert to array
    return Array.from(dateMap.entries()).map(([dateStr, count]) => {
      const date = new Date(dateStr);
      let formattedDate = '';
      if (timeRange === '7d') formattedDate = format(date, 'EEE');
      else if (timeRange === '1m') formattedDate = format(date, 'd MMM');
      else formattedDate = format(date, 'MMM d');
      
      return {
        date: formattedDate,
        fullDate: dateStr,
        commits: count
      };
    });
  }, [commits, timeRange]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <GitCommit className="w-5 h-5" />
          Commit History
        </h3>
        <div className="h-[200px] bg-muted/20 animate-pulse rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && (!commits || commits.length === 0)) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <GitCommit className="w-5 h-5" />
          Commit History
        </h3>
        <p className="text-sm text-muted-foreground">Failed to load commits.</p>
      </div>
    );
  }

  if (!commits || commits.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <GitCommit className="w-5 h-5" />
          Commit History
        </h3>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <a 
            href={`${repoUrl}/commits`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            View all <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Chart Section */}
      <div className="space-y-4">
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
            <XAxis 
              dataKey="date" 
              tickLine={false} 
              tickMargin={10} 
              axisLine={false}
              minTickGap={30}
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              allowDecimals={false}
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="commits" 
              stroke="var(--color-commits)" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ChartContainer>
      </div>
      
      {/* Recent Commits List */}
      <div className="space-y-4 relative">
        <h4 className="text-sm font-medium text-muted-foreground">Recent Activity</h4>
        {/* Vertical line connecting commits */}
        <div className="absolute left-[7px] top-8 bottom-2 w-0.5 bg-border" />
        
        {commits.slice(0, 5).map((commit) => (
          <div key={commit.sha} className="relative pl-6 group">
            {/* Dot on the timeline */}
            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-background bg-muted-foreground/30 group-hover:bg-primary transition-colors" />
            
            <div className="flex flex-col gap-1">
              <a 
                href={commit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:text-primary line-clamp-2 leading-snug"
                title={commit.message}
              >
                {commit.message.split('\n')[0]}
              </a>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {commit.author.avatarUrl ? (
                  <img 
                    src={commit.author.avatarUrl} 
                    alt={commit.author.login || commit.author.name} 
                    className="w-4 h-4 rounded-full"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px]">
                    {commit.author.name.charAt(0)}
                  </div>
                )}
                <span className="truncate max-w-[100px]">
                  {commit.author.login || commit.author.name}
                </span>
                <span>•</span>
                <span title={new Date(commit.author.date).toLocaleString()}>
                  {formatDistanceToNow(new Date(commit.author.date), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default CommitHistory;