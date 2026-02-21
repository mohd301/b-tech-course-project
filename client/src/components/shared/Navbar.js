import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { User, LogOut, Key } from "lucide-react"
import { logoutUser } from "../../slices/SliceUser"
import { logoutPriv } from "../../slices/SlicePriv"
import { getUserType } from "../../functions/getUserType"

export default function Navbar() {
  const user = useSelector((state) => state.user.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    const type = getUserType()
    localStorage.removeItem("authToken")
    localStorage.removeItem("userType")
    if (type === "Admin" || type === "Regulator") {
      dispatch(logoutPriv())
    } else {
      dispatch(logoutUser())
    }
    navigate("/")
    window.location.reload()
  }

  const displayName = user?.Email || user?.email || "Account"
  const displayPhone = user?.Phone || user?.phone || ""
  const userType = localStorage.getItem("userType") || ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline max-w-[160px] truncate">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            {displayPhone && (
              <p className="text-xs text-muted-foreground">{displayPhone}</p>
            )}
            {userType && (
              <p className="text-xs text-muted-foreground capitalize">{userType}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userType === "User" && (
          <DropdownMenuItem
            onClick={() => navigate("/home")}
            className="cursor-pointer"
          >
            <Key className="mr-2 h-4 w-4" />
            My Profile
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
