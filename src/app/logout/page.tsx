"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "./actions";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      await logout();
      router.push("/");
    };
    doLogout();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground">Loggar ut...</p>
    </div>
  );
}
