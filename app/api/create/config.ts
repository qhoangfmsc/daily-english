import { z } from "zod";

// Schema cho structured output - chỉ nội dung bài học
export const LessonSchema = z.object({
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

// API Configuration
export const API_CONFIG = {
  url: "https://openrouter.ai/api/v1/chat/completions",
  model: "openai/gpt-4.1-mini",
  temperature: 1.2,
  max_tokens: 400000,
} as const;

// System Prompt
export const SYSTEM_PROMPT = "You are a English teacher creating a lesson to practice translating paragraphs at IELTS band 5.0.";

// User Prompt
export const USER_PROMPT = `Create a Vietnamese to English translation lesson for IELTS 5.0.

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
- Memorize new vocabulary words`;

// JSON Schema for response format
export const JSON_SCHEMA = {
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
} as const;

// Response format configuration
export const RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "lesson",
    strict: true,
    schema: JSON_SCHEMA,
  },
} as const;

