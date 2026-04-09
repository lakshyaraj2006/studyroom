import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator
} from "@/components/ui/sidebar"

import { NavLink, useNavigate } from "react-router-dom"
import { SidebarUserDropdown } from "./user-dropdown-sidebar"
import { navLinks } from "../navbar.component"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "../ui/button"
import { LogInIcon } from "lucide-react"

export function AppSidebar() {
  const { authToken } = useAuth();
  const navigate = useNavigate();

  return (
    <Sidebar>

      <SidebarHeader>
        <div className="px-3 py-2 text-lg font-bold">
          Study<span className="text-indigo-500">Room</span>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-0" />

      {/* Content */}
      <SidebarContent>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            {navLinks.map((item, idx) => (
              <SidebarMenuItem key={idx + 2}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `text-sm font-medium transition ${isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                      }`
                    }
                  >
                    <span>{item.name}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>

      <SidebarSeparator className="mx-0" />
      <SidebarFooter>
        {authToken
          ? <SidebarUserDropdown />
          : <Button
            onClick={() => navigate("/auth/signin")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <LogInIcon size={16} />
            <span>Sign In</span>
          </Button>
        }
      </SidebarFooter>

    </Sidebar>
  )
}