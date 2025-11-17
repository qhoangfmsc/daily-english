import type { Lesson } from "@/app/(tools)/translation-challenge/common/type";
import type {
  DiscordField,
  DiscordMessage,
} from "@/app/(tools)/translation-challenge/common/discord";

import { NextResponse } from "next/server";

import { DISCORD_WEBHOOK_URLS } from "./config";

const getApiUrl = () => {
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set");
  }

  return `${baseUrl}/api/translation-challenge/create`;
};

const createChallenge = async (): Promise<Lesson> => {
  const response = await fetch(getApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: response.statusText,
    }));

    throw new Error(
      `Error creating challenge: ${response.statusText}. ${JSON.stringify(errorData)}`,
    );
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Không có dữ liệu challenge được trả về");
  }

  return result.data;
};

const formatChallengeToDiscord = (lesson: Lesson): DiscordMessage => {
  const vocabText =
    lesson.newVocabulary.length > 0
      ? lesson.newVocabulary
          .map((v) => {
            const wordLower = v.word.toLowerCase().trim();
            const dictionaryUrl = `https://dictionary.cambridge.org/vi/dictionary/english/${encodeURIComponent(wordLower)}`;

            return `[**${v.word}**](${dictionaryUrl}) (${v.type}): ${v.translation}`;
          })
          .join("\n")
      : "";

  const reviewText =
    lesson.reviewVocabulary.length > 0
      ? lesson.reviewVocabulary
          .map((word) => {
            const wordLower = word.toLowerCase().trim();
            const dictionaryUrl = `https://dictionary.cambridge.org/vi/dictionary/english/${encodeURIComponent(wordLower)}`;

            return `[**${word}**](${dictionaryUrl})`;
          })
          .join(", ")
      : "";

  const fields: DiscordField[] = [];

  if (vocabText) {
    fields.push({ name: "", value: "\u200b", inline: false });
    fields.push({
      name: "📚 Today's New Vocabulary",
      value: vocabText,
      inline: false,
    });
  }

  if (reviewText) {
    fields.push({ name: "", value: "\u200b", inline: false });
    fields.push({
      name: "🔄 Review Vocabulary",
      value: reviewText,
      inline: false,
    });
  }

  if (lesson.vietnameseText) {
    fields.push({ name: "", value: "\u200b", inline: false });
    fields.push({
      name: "📝 Sentence to Translate",
      value: `\`\`\`${lesson.vietnameseText}\`\`\``,
      inline: false,
    });
  }

  if (lesson.englishText) {
    fields.push({ name: "", value: "\u200b", inline: false });
    fields.push({
      name: "✅ Sample Translation (Click to reveal)",
      value: `||\`\`\`${lesson.englishText}\`\`\`||`,
      inline: false,
    });
  }

  return {
    content: "# 🎯 **DAILY CHALLENGE**",
    embeds: [
      {
        title: "📅 Daily Challenge",
        description: `Write a short paragraph every day with the intention of practicing regularly`,
        color: 0x0c8c5f,
        fields,
        footer: {
          text: "\n\nNote: Make sure to translate the sentence into English before revealing the sample translation.",
        },
      },
    ],
  };
};

const sendToDiscord = async (
  webhookUrl: string,
  message: DiscordMessage,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);

      // eslint-disable-next-line no-console
      console.error("Discord webhook error:", {
        url: webhookUrl,
        status: response.status,
        error: errorText,
      });

      return {
        success: false,
        error: `Discord API error: ${response.status} ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error sending to Discord:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi gửi đến Discord",
    };
  }
};

const sendToMultipleDiscords = async (
  webhookUrls: string[],
  message: DiscordMessage,
): Promise<Array<{ url: string; success: boolean; error?: string }>> => {
  const results = await Promise.all(
    webhookUrls.map(async (url) => ({
      url,
      ...(await sendToDiscord(url, message)),
    })),
  );

  return results;
};

export async function GET() {
  try {
    const challenge = await createChallenge();
    const discordMessage = formatChallengeToDiscord(challenge);

    if (DISCORD_WEBHOOK_URLS.length === 0) {
      return NextResponse.json({
        success: true,
        message:
          "Challenge created successfully, but no Discord URLs configured",
        data: challenge,
        discordResults: [],
      });
    }

    const discordResults = await sendToMultipleDiscords(
      DISCORD_WEBHOOK_URLS,
      discordMessage,
    );

    const successCount = discordResults.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Challenge created and sent to ${successCount}/${DISCORD_WEBHOOK_URLS.length} Discord webhooks`,
      data: challenge,
      discordResults: {
        total: DISCORD_WEBHOOK_URLS.length,
        success: successCount,
        failed: DISCORD_WEBHOOK_URLS.length - successCount,
        details: discordResults,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in daily cron:", error);

    return NextResponse.json(
      {
        success: false,
        error: `Error: ${error instanceof Error ? error.message : "Unknown"}`,
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  return GET();
}
