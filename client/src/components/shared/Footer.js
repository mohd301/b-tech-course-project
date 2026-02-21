import React from "react"
import { Separator } from "../ui/separator"
import { Mail, Info, Shield } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-primary mt-auto">
      <div className="py-4 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            {/* Contact */}
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary-foreground/80" />
              <div>
                <p className="text-xs font-semibold text-primary-foreground">Contact Us</p>
                <p className="text-xs text-primary-foreground/70">support@subsidy.om</p>
              </div>
            </div>

            <Separator orientation="vertical" className="hidden md:block h-8 bg-primary-foreground/20" />

            {/* Brand */}
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary-foreground/80" />
              <p className="text-xs text-primary-foreground">
                &copy; {new Date().getFullYear()} Online Subsidy Eligibility System
              </p>
            </div>

            <Separator orientation="vertical" className="hidden md:block h-8 bg-primary-foreground/20" />

            {/* About */}
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary-foreground/80" />
              <div>
                <p className="text-xs font-semibold text-primary-foreground">About</p>
                <p className="text-xs text-primary-foreground/70">Subsidy Eligibility Portal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
