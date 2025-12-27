import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center space-y-6 p-8">
        <img 
          src="/favicon.png" 
          alt="ChasCareer" 
          className="mx-auto h-20 w-20 rounded-2xl shadow-lg"
        />
        <h1 className="text-4xl font-bold tracking-tight">ChasCareer</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Din väg till drömjobbet inom IT – från utbildning till anställning.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Logga in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
