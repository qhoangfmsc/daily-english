import { NextResponse } from "next/server";

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1402137172483768332/8irZRAm0m8XwI-QZ5JyqhsAYs5xA9uju5nVFclfYah1M2vJJpajrtgnJdxwpsIsSDYIe";
const START_DATE = new Date("2025-11-13");

function getTotalWorkingDays(startDate: Date, today: Date) {
  const normalize = (d: Date) => ((d = new Date(d)), d.setHours(0, 0, 0, 0), d);
  const start = normalize(startDate);
  const end = normalize(today);

  let count = 0;
  for (
    let current = new Date(start);
    current <= end;
    current.setDate(current.getDate() + 1)
  ) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

function createMessage(startDate: Date, workingDays: number) {
  const formatDate = (date: Date) =>
    date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return `📅 **Báo cáo tổng ngày đã học Dịch thuật**
Ngày bắt đầu học: ${formatDate(startDate)}
Hôm nay: ${formatDate(new Date())}
Tổng số ngày đã học: **${workingDays} ngày**`;
}

export async function GET() {
  try {
    const message = createMessage(START_DATE, getTotalWorkingDays(START_DATE, new Date()));
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: `Error: ${response.statusText}` }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: `Error: ${error instanceof Error ? error.message : "Unknown"}` }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
