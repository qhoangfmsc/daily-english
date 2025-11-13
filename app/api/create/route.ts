import { NextResponse } from "next/server";
import {
  LessonSchema,
  API_CONFIG,
  SYSTEM_PROMPT,
  USER_PROMPT,
  RESPONSE_FORMAT,
} from "./config";

export async function POST() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY không được cấu hình" },
        { status: 500 }
      );
    }

    // Gọi OpenRouter API với structured output
    const response = await fetch(API_CONFIG.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "30 Days English",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: USER_PROMPT,
          },
        ],
        response_format: RESPONSE_FORMAT,
        temperature: API_CONFIG.temperature,
        max_tokens: API_CONFIG.max_tokens,
      }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      console.error("OpenRouter API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return NextResponse.json(
        { 
          error: `OpenRouter API error: ${response.status} ${response.statusText}`,
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Không có dữ liệu từ API" },
        { status: 500 }
      );
    }

    // Parse và validate response
    const parsedContent = JSON.parse(content);
    const validatedData = LessonSchema.parse(parsedContent);

    return NextResponse.json({
      success: true,
      data: validatedData,
    });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo bài học",
      },
      { status: 500 }
    );
  }
}

