import React from "react"
import { Button } from "../ui/button"
import { LucideIcon } from "lucide-react"

export default function EmptyState({
  icon: Icon,
  headline,
  description,
  ctaText,
  onCtaClick,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-4 text-muted-foreground">
          <Icon className="h-16 w-16 mx-auto" />
        </div>
      )}
      {headline && (
        <h3 className="text-xl font-semibold mb-2">{headline}</h3>
      )}
      {description && (
        <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      )}
      {ctaText && onCtaClick && (
        <Button onClick={onCtaClick}>{ctaText}</Button>
      )}
    </div>
  )
}
