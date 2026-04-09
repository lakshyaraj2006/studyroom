import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar"
import { ChevronRight, LogOut, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import useLogout from "@/hooks/useLogout"

export function SidebarUserDropdown() {
  const { usrInfo } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition">

          <Avatar className="inline-flex w-8 h-8 rounded-full overflow-hidden">
            <AvatarImage
              src={usrInfo?.avatar || "/user.png"}
              className="w-full h-full object-cover"
            />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          <span className="text-sm font-medium truncate flex-1 text-left">
            {usrInfo?.username || "User"}
          </span>

          <ChevronRight
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />

        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="end"
        className="w-44 rounded-xl shadow-lg border p-2"
      >
        <DropdownMenuItem
          onClick={() => navigate(`/profile/${usrInfo?.handle}`)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <User size={16} />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={logout}
          className="flex items-center gap-2 cursor-pointer"
        >
          <LogOut size={16} />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}