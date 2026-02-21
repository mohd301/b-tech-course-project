import * as React from "react"
import { cn } from "../../lib/utils"

const SheetContext = React.createContext({})

const Sheet = ({ open, onOpenChange, children, ...props }) => {
  const [internalOpen, setInternalOpen] = React.useState(false)

  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = (newValue) => {
    if (onOpenChange) {
      onOpenChange(newValue)
    } else {
      setInternalOpen(newValue)
    }
  }

  return (
    <SheetContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

const SheetTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { setIsOpen } = React.useContext(SheetContext)

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={() => setIsOpen(true)}
      {...props}
    >
      {children}
    </button>
  )
})
SheetTrigger.displayName = "SheetTrigger"

const SheetContent = React.forwardRef(({ className, children, side = "left", ...props }, ref) => {
  const { isOpen, setIsOpen } = React.useContext(SheetContext)

  if (!isOpen) return null

  const sideClasses = {
    left: "inset-y-0 left-0 h-full w-64 border-r",
    right: "inset-y-0 right-0 h-full w-64 border-l",
    top: "inset-x-0 top-0 h-auto border-b",
    bottom: "inset-x-0 bottom-0 h-auto border-t",
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div
        ref={ref}
        className={cn(
          "fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out",
          sideClasses[side],
          className
        )}
        {...props}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        {children}
      </div>
    </div>
  )
})
SheetContent.displayName = "SheetContent"

const SheetHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
))
SheetTitle.displayName = "SheetTitle"

const SheetClose = React.forwardRef(({ className, ...props }, ref) => (
  <button ref={ref} className={cn("absolute right-4 top-4", className)} {...props} />
))
SheetClose.displayName = "SheetClose"

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose }
