"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare,
  CheckCircle2,
  XCircle,
  Send,
  Bell,
} from "lucide-react";

type Props = {
  configured: boolean;
};

export function SlackSettings({ configured }: Props) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const sendTestMessage = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "test" }),
      });

      if (res.ok) {
        setTestResult("success");
      } else {
        setTestResult("error");
      }
    } catch (error) {
      setTestResult("error");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Slack Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>Slack-integration</CardTitle>
            </div>
            {configured ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Konfigurerad
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">
                <XCircle className="h-3 w-3 mr-1" />
                Ej konfigurerad
              </Badge>
            )}
          </div>
          <CardDescription>
            Skicka automatiska notifikationer till Slack
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {configured ? (
            <>
              <p className="text-sm text-muted-foreground">
                Slack-integrationen är aktiv. Systemet kan skicka:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Deadline-påminnelser</li>
                <li>LIA-godkännande notifikationer</li>
                <li>Milestone-avklarade meddelanden</li>
              </ul>
              <div className="flex items-center gap-4 pt-4">
                <Button 
                  onClick={sendTestMessage} 
                  disabled={isTesting}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isTesting ? "Skickar..." : "Skicka testmeddelande"}
                </Button>
                {testResult === "success" && (
                  <span className="text-green-600 text-sm flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Meddelande skickat!
                  </span>
                )}
                {testResult === "error" && (
                  <span className="text-red-600 text-sm flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    Kunde inte skicka
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                För att aktivera Slack-integration:
              </p>
              <ol className="text-sm list-decimal list-inside mt-2 space-y-1">
                <li>Skapa en Slack-app på <a href="https://api.slack.com/apps" target="_blank" className="text-primary hover:underline">api.slack.com/apps</a></li>
                <li>Aktivera Incoming Webhooks</li>
                <li>Lägg till webhook URL i <code className="bg-background px-1 rounded">.env</code>:</li>
              </ol>
              <pre className="bg-background p-2 rounded mt-2 text-xs overflow-x-auto">
                SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifikationsinställningar */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifikationsinställningar</CardTitle>
          </div>
          <CardDescription>
            Konfigurera vilka händelser som triggar notifikationer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="font-medium">Deadline-påminnelser</div>
                <div className="text-sm text-muted-foreground">7 dagar och 1 dag innan deadline</div>
              </div>
              <Badge variant="outline">Aktiverad</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="font-medium">LIA-ansökningar</div>
                <div className="text-sm text-muted-foreground">När nya LIA-ansökningar väntar på godkännande</div>
              </div>
              <Badge variant="outline">Aktiverad</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">Milestone-progression</div>
                <div className="text-sm text-muted-foreground">När studerande avklarar moment</div>
              </div>
              <Badge variant="outline">Aktiverad</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
