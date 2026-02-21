import * as React from "react"
import { cn } from "../../lib/utils"

const Stepper = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center space-x-4", className)}
    {...props}
  >
    {children}
  </div>
))
Stepper.displayName = "Stepper"

const StepperItem = React.forwardRef(({ className, children, isActive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center space-x-2",
      isActive ? "text-primary" : "text-muted-foreground",
      className
    )}
    {...props}
  >
    <div className={cn(
      "flex items-center justify-center w-8 h-8 rounded-full border-2",
      isActive ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted-foreground"
    )}>
      {children}
    </div>
  </div>
))
StepperItem.displayName = "StepperItem"

export { Stepper, StepperItem }
