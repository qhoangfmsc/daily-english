import { NextResponse } from "next/server";
import { z } from "zod";

// Schema cho structured output - chỉ nội dung bài học
const LessonSchema = z.object({
  goal: z.string().describe("Goal of the lesson"),
  tense: z.string().describe("Tense used (or 'Mixed Tenses' if multiple)"),
  vietnameseText: z.string().describe("Vietnamese paragraph (80-120 words) to translate. Must naturally include the Vietnamese translations corresponding to all words in newVocabulary"),
  englishText: z.string().describe("English translation (80-120 words). Must naturally include all words from newVocabulary within the paragraph"),
  newVocabulary: z.array(z.object({
    word: z.string().describe("A word from the englishText paragraph that students will learn. If the word is a verb, use the infinitive form (base form), not conjugated forms. For example, if the paragraph contains 'played', use 'play'"),
    type: z.string().describe("The type of the word (e.g. noun, verb, adjective, adverb, preposition, conjunction, interjection)"),
    translation: z.string().describe("The translation of the word in Vietnamese"),
  })).describe("List of 3 new vocabulary words. Each word must appear in the englishText paragraph, and its Vietnamese translation must appear in the vietnameseText paragraph. Verbs must be in infinitive form (base form)"),
  reviewVocabulary: z.array(z.string()).optional().describe("List of old vocabulary to review (optional, up to 3 words). If a word is a verb, use the infinitive form (base form), not conjugated forms"),
});

export async function POST() {
  try {
    const apiKey = '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';
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY không được cấu hình" },
        { status: 500 }
      );
    }

    // Gọi OpenRouter API với structured output
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": 'localhost:1501',
        "X-Title": "English Challenge",
      },
      body: JSON.stringify({
        model: "openai/gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a English teacher creating a lesson to practice translating paragraphs at IELTS band 5.0.",
          },
          {
            role: "user",
            content: `Create a Vietnamese to English translation lesson for IELTS 5.0.

Lesson Structure:
- Include a medium paragraph (80-120 words) in Vietnamese with its English translation
- Use appropriate tenses (can be a single tense or mixed tenses, label as "Mixed Tenses" if multiple)
- Focus on IELTS Writing Task 2 style at band 5.0 complexity
- Keep paragraph concise but meaningful

Vocabulary Requirements:
- Select 3 new vocabulary words that appear naturally in the English paragraph
- Each new word must be present in the englishText paragraph
- The Vietnamese translation of each new word must appear in the vietnameseText paragraph
- For verbs: always use the infinitive form (base form) in vocabulary lists, even if the paragraph uses conjugated forms
  Example: if the paragraph contains "played", "playing", or "plays", the vocabulary word should be "play"
- Review vocabulary is optional (up to 3 words from previous lessons if applicable)

Learning Goals:
- Accurate translation with 80% accuracy target
- Memorize new vocabulary words`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "lesson",
            strict: true,
            schema: {
              type: "object",
              properties: {
                goal: {
                  type: "string",
                  description: "Goal of the lesson",
                },
                tense: {
                  type: "string",
                  description: "Tense used (or 'Mixed Tenses' if multiple)",
                },
                vietnameseText: {
                  type: "string",
                  description: "Vietnamese paragraph (80-120 words) to translate. Must naturally include the Vietnamese translations corresponding to all words in newVocabulary",
                },
                englishText: {
                  type: "string",
                  description: "English translation (80-120 words). Must naturally include all words from newVocabulary within the paragraph",
                },
                newVocabulary: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      word: {
                        type: "string",
                        description: "A word from the englishText paragraph that students will learn. If the word is a verb, use the infinitive form (base form), not conjugated forms. For example, if the paragraph contains 'played', use 'play'",
                      },
                      type: {
                        type: "string",
                        description: "The type of the word (e.g. noun, verb, adjective, adverb, preposition, conjunction, interjection)",
                      },
                      translation: {
                        type: "string",
                        description: "The translation of the word in Vietnamese",
                      },
                    },
                    required: ["word", "type", "translation"],
                    additionalProperties: false,
                  },
                  description: "List of 3 new vocabulary words. Each word must appear in the englishText paragraph, and its Vietnamese translation must appear in the vietnameseText paragraph. Verbs must be in infinitive form (base form)",
                },
                reviewVocabulary: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "List of old vocabulary to review (optional, up to 3 words). If a word is a verb, use the infinitive form (base form), not conjugated forms",
                },
              },
              required: ["goal", "tense", "vietnameseText", "englishText", "newVocabulary"],
              additionalProperties: false,
            },
          },
        },
        temperature: 1.2,
        max_tokens: 400000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: `OpenRouter API error: ${errorData}` },
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

