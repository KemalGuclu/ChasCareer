"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/logout")}
      className="p-2 hover:bg-muted rounded-md"
      title="Logga ut"
    >
      <LogOut className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
