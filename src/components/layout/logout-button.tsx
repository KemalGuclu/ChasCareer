"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="p-2 hover:bg-muted rounded-md"
      title="Logga ut"
    >
      <LogOut className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
