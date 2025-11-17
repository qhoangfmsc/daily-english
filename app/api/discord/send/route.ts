import type { DiscordMessage } from "@/app/(tools)/translation-challenge/common/discord";

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { webhookUrl, message } = body as {
      webhookUrl: string;
      message: DiscordMessage;
    };

    if (!webhookUrl || !message) {
      return NextResponse.json(
        { success: false, error: "Thiếu webhookUrl hoặc message" },
        { status: 400 },
      );
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();

      // eslint-disable-next-line no-console
      console.error("Discord webhook error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      return NextResponse.json(
        {
          success: false,
          error: `Discord API error: ${response.status} ${response.statusText}`,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã gửi đến Discord thành công",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error sending to Discord:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi gửi đến Discord",
      },
      { status: 500 },
    );
  }
}
