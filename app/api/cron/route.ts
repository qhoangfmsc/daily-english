import { NextResponse } from "next/server";

const DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;

function getDayOfWeek(date: Date): typeof DAY_NAMES[number] {
  return DAY_NAMES[date.getDay()];
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function calculateWorkingDays(startDate: Date, endDate = new Date()) {
  let count = 0;
  const current = new Date(startDate);
  
  current.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

export async function GET() {
  try {
    const discordWebhookUrl = "https://discord.com/api/webhooks/1402137172483768332/8irZRAm0m8XwI-QZ5JyqhsAYs5xA9uju5nVFclfYah1M2vJJpajrtgnJdxwpsIsSDYIe";

    if (!discordWebhookUrl) {
      console.error("DISCORD_WEBHOOK_URL không được cấu hình");
      return NextResponse.json(
        { error: "DISCORD_WEBHOOK_URL không được cấu hình" },
        { status: 500 }
      );
    }

    const startDate = new Date("2025-11-13");
    const today = new Date();
    const todayDayOfWeek = getDayOfWeek(today);
    
    // Nếu là Saturday hoặc Sunday thì return luôn không làm gì
    if (isWeekend(today)) {
      console.log(`Hôm nay là ${todayDayOfWeek}, không thực hiện cron job`);
      return NextResponse.json({
        success: true,
        message: `Hôm nay là ${todayDayOfWeek}, không thực hiện cron job`,
        dayOfWeek: todayDayOfWeek,
      });
    }
    
    const workingDays = calculateWorkingDays(startDate, today);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    };

    const message = `📅 **Báo cáo tổng ngày đã học Dịch thuật**
Ngày bắt đầu học: ${formatDate(startDate)}
Hôm nay: ${formatDate(today)}
Tổng số ngày đã học: **${workingDays} ngày**`;

    const response = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Discord webhook error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      return NextResponse.json(
        { 
          error: `Discord webhook error: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    console.log("Đã gửi thông báo Discord thành công");
    
    return NextResponse.json({
      success: true,
      message: "Đã gửi thông báo Discord thành công"
    });
  } catch (error) {
    console.error("Error sending Discord message:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Có lỗi xảy ra khi gửi thông báo Discord"
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}

