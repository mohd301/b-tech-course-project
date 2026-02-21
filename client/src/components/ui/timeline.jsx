import * as React from "react"

import { cn } from "../../lib/utils"

const Timeline = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative pl-8", className)}
    {...props}
  />
))
Timeline.displayName = "Timeline"

const TimelineItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative pb-8 last:pb-0", className)}
    {...props}
  >
    <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center">
      <div className="h-4 w-4 rounded-full border-2 border-blue-600 bg-white" />
    </div>
    <div className="ml-4 space-y-1">{children}</div>
  </div>
))
TimelineItem.displayName = "TimelineItem"

const TimelineContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1", className)}
    {...props}
  />
))
TimelineContent.displayName = "TimelineContent"

const TimelineDate = React.forwardRef(({ className, ...props }, ref) => (
  <time
    ref={ref}
    className={cn("text-xs text-slate-500", className)}
    {...props}
  />
))
TimelineDate.displayName = "TimelineDate"

const TimelineTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn("font-semibold text-slate-950", className)}
    {...props}
  />
))
TimelineTitle.displayName = "TimelineTitle"

const TimelineDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-600", className)}
    {...props}
  />
))
TimelineDescription.displayName = "TimelineDescription"

export { Timeline, TimelineItem, TimelineContent, TimelineDate, TimelineTitle, TimelineDescription }
