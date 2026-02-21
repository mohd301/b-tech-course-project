import React from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import Navbar from "./Navbar"
import { Separator } from "../ui/separator"
import { Shield } from "lucide-react"

export default function Header() {
  const user = useSelector((state) => state.user.user)
  const privToken = useSelector((state) => state.priv.token)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-primary-foreground leading-none">
              Online Subsidy Eligibility System
            </h1>
          </div>
          <h1 className="text-base font-bold text-primary-foreground sm:hidden">
            OSES
          </h1>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {(user || privToken) && (
            <>
              <Separator orientation="vertical" className="h-6 bg-primary-foreground/20" />
              <Navbar />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
