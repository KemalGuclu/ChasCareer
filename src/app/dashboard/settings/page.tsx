import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SlackSettings } from "./slack-settings";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const slackConfigured = !!process.env.SLACK_WEBHOOK_URL;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inställningar</h1>
        <p className="text-muted-foreground">
          Hantera applikationens inställningar och integrationer
        </p>
      </div>

      <SlackSettings configured={slackConfigured} />
    </div>
  );
}
