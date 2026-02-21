import * as React from "react"
import { cn } from "../../lib/utils"

const Pagination = React.forwardRef(({ className, children, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  >
    {children}
  </nav>
))
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  >
    {children}
  </ul>
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

const PaginationLink = React.forwardRef(({ className, isActive, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      isActive
        ? "bg-primary text-primary-foreground hover:bg-primary/90"
        : "bg-background hover:bg-accent hover:text-accent-foreground",
      className
    )}
    {...props}
  />
))
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = React.forwardRef(({ className, ...props }, ref) => (
  <PaginationLink ref={ref} className={cn("", className)} {...props} />
))
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = React.forwardRef(({ className, ...props }, ref) => (
  <PaginationLink ref={ref} className={cn("", className)} {...props} />
))
PaginationNext.displayName = "PaginationNext"

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
}
