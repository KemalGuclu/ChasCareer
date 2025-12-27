"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  Building2,
  Target,
  FileText,
  Settings,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { LogoutButton } from "./logout-button";

const navigation = {
  // Gemensamt för alla
  common: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ],
  // Endast för studenter
  student: [
    { name: "Min Progression", href: "/dashboard/progression", icon: Target },
    { name: "Mina Leads", href: "/dashboard/leads", icon: Users },
    { name: "Min LIA", href: "/dashboard/lia", icon: Briefcase },
  ],
  // Endast för utbildare
  teacher: [
    { name: "Mina Grupper", href: "/dashboard/teacher", icon: GraduationCap },
  ],
  // Endast för admin/lärare
  admin: [
    { name: "Studerande", href: "/dashboard/students", icon: GraduationCap },
    { name: "Företag", href: "/dashboard/companies", icon: Building2 },
    { name: "LIA-platser", href: "/dashboard/lia-management", icon: Briefcase },
    { name: "Rapporter", href: "/dashboard/reports", icon: FileText },
    { name: "Användare", href: "/dashboard/users", icon: Users },
    { name: "Inställningar", href: "/dashboard/settings", icon: Settings },
  ],
};

interface AppLayoutProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const pathname = usePathname();
  const isAdmin = user?.role === "ADMIN" || user?.role === "TEACHER";

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img 
              src="/favicon.png" 
              alt="ChasCareer" 
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-lg font-semibold">ChasCareer</span>
          </Link>
        </SidebarHeader>
        
        <SidebarContent>
          {/* Gemensamt: Dashboard */}
          <SidebarGroup>
            <SidebarGroupLabel>Översikt</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.common.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Student-specifikt */}
          {!isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>Min Career</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.student.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Utbildare-specifikt */}
          {user?.role === "TEACHER" && (
            <SidebarGroup>
              <SidebarGroupLabel>Utbildare</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.teacher.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Admin/Lärare */}
          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.admin.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name || "Användare"}</span>
                <span className="text-xs text-muted-foreground">{user?.role || "Student"}</span>
              </div>
            </div>
            <LogoutButton />
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
