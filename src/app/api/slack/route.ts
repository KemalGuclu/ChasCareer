import { NextResponse } from "next/server";

// Slack webhook URL från miljövariabel
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

type SlackMessage = {
  text?: string;
  blocks?: Array<{
    type: string;
    text?: {
      type: string;
      text: string;
      emoji?: boolean;
    };
    elements?: Array<{
      type: string;
      text: string;
      emoji?: boolean;
    }>;
    accessory?: {
      type: string;
      text: {
        type: string;
        text: string;
        emoji?: boolean;
      };
      url?: string;
      action_id?: string;
    };
  }>;
};

// Funktion för att skicka till Slack kanal via webhook
export async function sendToSlack(message: SlackMessage): Promise<boolean> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL not configured");
    return false;
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to send Slack message:", error);
    return false;
  }
}

// Funktion för att skicka DM via Slack API (kräver Bot Token)
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

export async function sendSlackDM(
  email: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!SLACK_BOT_TOKEN) {
    console.warn("SLACK_BOT_TOKEN not configured");
    return { success: false, error: "Slack Bot Token ej konfigurerad" };
  }

  try {
    // 1. Hitta användare via email
    const lookupRes = await fetch(
      `https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(email)}`,
      {
        headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
      }
    );
    const lookupData = await lookupRes.json();

    if (!lookupData.ok) {
      return { success: false, error: `Användare hittades ej: ${email}` };
    }

    const userId = lookupData.user.id;

    // 2. Öppna/hämta DM-kanal
    const openRes = await fetch("https://slack.com/api/conversations.open", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ users: userId }),
    });
    const openData = await openRes.json();

    if (!openData.ok) {
      return { success: false, error: "Kunde ej öppna DM-kanal" };
    }

    const channelId = openData.channel.id;

    // 3. Skicka meddelande
    const msgRes = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: channelId,
        text: message,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: message,
            },
          },
        ],
      }),
    });
    const msgData = await msgRes.json();

    if (!msgData.ok) {
      return { success: false, error: `Kunde ej skicka: ${msgData.error}` };
    }

    return { success: true };
  } catch (error) {
    console.error("Slack DM error:", error);
    return { success: false, error: "Oväntat fel vid Slack DM" };
  }
}

// Hjälpfunktioner för vanliga meddelanden
export function createDeadlineReminder(
  studentName: string,
  deadline: string,
  phase: string,
  daysLeft: number
): SlackMessage {
  const urgencyEmoji = daysLeft <= 1 ? "🚨" : daysLeft <= 7 ? "⚠️" : "📅";
  
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${urgencyEmoji} *Deadline-påminnelse*`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${studentName}* har deadline för *${phase}* om *${daysLeft} dag${daysLeft === 1 ? "" : "ar"}*\n📆 Deadline: ${deadline}`,
        },
      },
    ],
  };
}

export function createLiaApprovalNotification(
  studentName: string,
  companyName: string,
  status: "approved" | "rejected"
): SlackMessage {
  const emoji = status === "approved" ? "✅" : "❌";
  const action = status === "approved" ? "godkänd" : "avvisad";
  
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${emoji} *LIA-plats ${action}*`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${studentName}* LIA-ansökan hos *${companyName}* har blivit *${action}*`,
        },
      },
    ],
  };
}

export function createMilestoneCompletionNotification(
  studentName: string,
  milestoneName: string,
  progressPercent: number
): SlackMessage {
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🎉 *Moment avklarat*`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${studentName}* har avklarat *${milestoneName}*\n📈 Total progression: ${progressPercent}%`,
        },
      },
    ],
  };
}

// API endpoint för att testa Slack-integration
export async function POST(request: Request) {
  try {
    const { type, data } = await request.json();

    let message: SlackMessage;

    switch (type) {
      case "test":
        message = {
          text: "🧪 Testmeddelande från ChasCareer!",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "🧪 *Testmeddelande*\nSlack-integrationen fungerar!",
              },
            },
          ],
        };
        break;

      case "deadline":
        message = createDeadlineReminder(
          data.studentName,
          data.deadline,
          data.phase,
          data.daysLeft
        );
        break;

      case "lia_approval":
        message = createLiaApprovalNotification(
          data.studentName,
          data.companyName,
          data.status
        );
        break;

      case "milestone":
        message = createMilestoneCompletionNotification(
          data.studentName,
          data.milestoneName,
          data.progressPercent
        );
        break;

      case "dm":
        // Skicka DM direkt till användare
        if (!data.email || !data.message) {
          return NextResponse.json(
            { error: "Email och meddelande krävs" },
            { status: 400 }
          );
        }
        const dmResult = await sendSlackDM(data.email, data.message);
        if (dmResult.success) {
          return NextResponse.json({ success: true });
        } else {
          return NextResponse.json(
            { error: dmResult.error },
            { status: 400 }
          );
        }

      default:
        return NextResponse.json(
          { error: "Unknown message type" },
          { status: 400 }
        );
    }

    const success = await sendToSlack(message);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to send to Slack" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Slack API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
