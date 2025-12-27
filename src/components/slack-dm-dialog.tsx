"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";

type Props = {
  studentName: string;
  studentEmail: string;
};

export function SlackDMDialog({ studentName, studentEmail }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "dm",
          data: {
            email: studentEmail,
            message: `📩 *Meddelande från ChasCareer*\n\nHej ${studentName}!\n\n${message}`,
          },
        }),
      });

      if (res.ok) {
        setResult({ type: "success", message: "Meddelande skickat!" });
        setMessage("");
        setTimeout(() => {
          setOpen(false);
          setResult(null);
        }, 2000);
      } else {
        const data = await res.json();
        setResult({ type: "error", message: data.error || "Kunde ej skicka meddelande" });
      }
    } catch {
      setResult({ type: "error", message: "Något gick fel" });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Skicka Slack-meddelande">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Skicka meddelande till {studentName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Meddelande</Label>
            <Textarea
              id="message"
              placeholder="Skriv ditt meddelande..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>
          {result && (
            <div
              className={`p-3 rounded-lg text-sm ${
                result.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {result.message}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Avbryt
          </Button>
          <Button onClick={handleSend} disabled={loading || !message.trim()}>
            {loading ? "Skickar..." : "Skicka via Slack"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
