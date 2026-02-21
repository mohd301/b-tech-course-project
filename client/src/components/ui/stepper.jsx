import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const stepperVariants = cva(
  "flex flex-col",
  {
    variants: {
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

const Step = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
Step.displayName = "Step"

const StepIndicator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white",
      className
    )}
    {...props}
  />
))
StepIndicator.displayName = "StepIndicator"

const StepLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("ml-4 flex flex-col", className)}
    {...props}
  />
))
StepLabel.displayName = "StepLabel"

const StepTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-semibold", className)} {...props} />
))
StepTitle.displayName = "StepTitle"

const StepDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-slate-600", className)} {...props} />
))
StepDescription.displayName = "StepDescription"

const Stepper = ({ steps, currentStep, className }) => (
  <div className={cn("flex items-center w-full mb-6", className)}>
    {steps.map((step, index) => (
      <React.Fragment key={index}>
        <div className="flex flex-col items-center">
          <StepIndicator
            className={cn(
              index < currentStep
                ? "border-blue-600 bg-blue-600 text-white"
                : index === currentStep
                ? "border-blue-600 text-blue-600"
                : "border-gray-300 text-gray-400"
            )}
          >
            {index < currentStep ? "✓" : index + 1}
          </StepIndicator>
          <span
            className={cn(
              "text-xs mt-1",
              index <= currentStep ? "text-blue-600 font-medium" : "text-gray-400"
            )}
          >
            {step}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div
            className={cn(
              "flex-1 h-0.5 mx-2",
              index < currentStep ? "bg-blue-600" : "bg-gray-200"
            )}
          />
        )}
      </React.Fragment>
    ))}
  </div>
)
Stepper.displayName = "Stepper"

export { Step, StepIndicator, StepLabel, StepTitle, StepDescription, stepperVariants, Stepper }
