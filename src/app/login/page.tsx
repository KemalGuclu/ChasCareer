"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password: "demo", // Demo mode
      redirect: false,
    });

    if (result?.ok) {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  const handleDemoLogin = async (role: string) => {
    setLoading(true);
    const emails: Record<string, string> = {
      student: "student@chasacademy.se",
      admin: "admin@chasacademy.se",
      teacher: "teacher@chasacademy.se",
    };

    await signIn("credentials", {
      email: emails[role],
      password: "demo",
      redirect: false,
    });

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground text-2xl font-bold">
            CC
          </div>
          <CardTitle className="text-2xl">ChasCareer</CardTitle>
          <CardDescription>
            Logga in för att fortsätta till din dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="din@email.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loggar in..." : "Logga in"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Eller prova demo
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <Button
              variant="outline"
              onClick={() => handleDemoLogin("student")}
              disabled={loading}
            >
              🎓 Demo som Studerande
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDemoLogin("teacher")}
              disabled={loading}
            >
              👩‍🏫 Demo som Utbildare
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDemoLogin("admin")}
              disabled={loading}
            >
              ⚙️ Demo som Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
