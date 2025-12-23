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

// Funktion för att skicka till Slack
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
