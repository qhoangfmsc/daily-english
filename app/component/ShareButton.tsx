"use client";

import { useState, useEffect } from "react";
import GenerateButton, { LessonData } from "./GenerateButton";

interface DayChallenge {
    day: number;
    tense: string;
    vietnameseText: string;
    englishText: string;
    newVocabulary: {
        word: string;
        type: string;
        translation: string;
    }[];
    reviewVocabulary: string[];
}

interface ShareButtonProps {
    day?: DayChallenge;
    isOpen?: boolean;
    onClose?: () => void;
}

interface DiscordField {
    name: string;
    value: string;
    inline?: boolean;
}

interface WebhookConfig {
    name: string;
    url: string;
}

// Discord webhook configuration
const WEBHOOK_CONFIGS: WebhookConfig[] = [
    {
        name: "Test Ori",
        url: "https://discord.com/api/webhooks/1402137172483768332/8irZRAm0m8XwI-QZ5JyqhsAYs5xA9uju5nVFclfYah1M2vJJpajrtgnJdxwpsIsSDYIe",
    },
    {
        name: "Test 2 Ori",
        url: "https://discord.com/api/webhooks/1420310534406017056/roWASFuVz_NCi1lXQq0J3jKSCrFqhrrov65o2b4sA-YqGVWtlPghosbtPOUox9MhG1y4",
    },
    {
        name: "Vietnix Learning English",
        url: "https://discord.com/api/webhooks/1438019727283851304/88kA1Hiv_Hg6v8pjWOsvRMHSUNHJG3mzTSfm18muySTpLndF8sSVW8XsCdiDVr4Q4Kzx"
    }
];

export default function ShareButton({ day, isOpen: externalIsOpen, onClose }: ShareButtonProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [sendStatus, setSendStatus] = useState<"success" | "error" | null>(null);
    const [editableDay, setEditableDay] = useState<DayChallenge | null>(null);

    // Use external isOpen if provided, otherwise use internal state
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = (value: boolean) => {
        if (externalIsOpen === undefined) {
            setInternalIsOpen(value);
        } else if (!value && onClose) {
            onClose();
        }
    };

    const formatDiscordMessage = (dayData: DayChallenge) => {
        // Format message with embed for Discord - single day, daily quiz style
        const fields: DiscordField[] = [];

        fields.push({
            name: "",
            value: "\u200b",
            inline: false,
        });

        // Words to review
        if (dayData.reviewVocabulary && dayData.reviewVocabulary.length > 0) {
            const reviewText = dayData.reviewVocabulary
                .map((word) => {
                    const cambridgeUrl = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word.toLowerCase())}`;
                    return `[${word}](${cambridgeUrl})`;
                })
                .join(", ");
            fields.push({
                name: "🔄 Words to Review",
                value: `${reviewText || "None"}`,
                inline: false,
            });

            // Add empty field to create spacing
            fields.push({
                name: "",
                value: "\u200b",
                inline: false,
            });
        }

        // New vocabulary with Cambridge Dictionary links
        if (dayData.newVocabulary && dayData.newVocabulary.length > 0) {
            const vocabText = dayData.newVocabulary
                .map((v) => {
                    const cambridgeUrl = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(v.word.toLowerCase())}`;
                    return `[**${v.word}**](${cambridgeUrl}) (${v.type}) - ${v.translation}`;
                })
                .join("\n");
            fields.push({
                name: "✨ Today's New Vocabulary",
                value: vocabText,
                inline: false,
            });

            fields.push({
                name: "",
                value: "\u200b",
                inline: false,
            });
        }

        // Sentence to translate
        fields.push({
            name: "📝 Sentence to Translate",
            value: `\`\`\`\n${dayData.vietnameseText}\n\`\`\``,
            inline: false,
        });

        // Add empty field to create spacing
        fields.push({
            name: "",
            value: "\u200b",
            inline: false,
        });

        // Sample translation with spoiler
        fields.push({
            name: "💡 Sample Translation (Click to reveal)",
            value: `||\`\`\`\n${dayData.englishText}\n\`\`\`||`,
            inline: false,
        });

        const embed = {
            title: `📅 Day ${dayData.day} Challenge`,
            description: `Translate the following sentence into English using the **${dayData.tense}** tense!`,
            color: 0x0C8C5F,
            fields: fields,
            footer: {
                text: `\n\nNote: Make sure to translate the sentence into English before revealing the sample translation.`,
            },
        };

        return {
            content: `# 🎯 **DAILY CHALLENGE**`,
            embeds: [embed],
        };
    };

    // Initialize editable day when modal opens
    useEffect(() => {
        if (isOpen) {
            if (day) {
                setEditableDay({
                    ...day,
                    newVocabulary: day.newVocabulary ? [...day.newVocabulary] : [],
                    reviewVocabulary: day.reviewVocabulary ? [...day.reviewVocabulary] : [],
                });
            } else {
                // Create default empty day if no day provided
                setEditableDay({
                    day: 1,
                    tense: "",
                    vietnameseText: "",
                    englishText: "",
                    newVocabulary: [],
                    reviewVocabulary: [],
                });
            }
            // Reset status when modal opens
            setSendStatus(null);
        } else {
            setEditableDay(null);
            setSendStatus(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleGenerateData = (generatedData: LessonData) => {
        // Merge generated data with existing editableDay, keeping the day number if it exists
        setEditableDay((prev) => ({
            day: prev?.day || 1,
            tense: generatedData.tense || "",
            vietnameseText: generatedData.vietnameseText || "",
            englishText: generatedData.englishText || "",
            newVocabulary: generatedData.newVocabulary || [],
            reviewVocabulary: generatedData.reviewVocabulary || [],
        }));
    };

    const handleSend = async () => {
        if (!webhookUrl.trim() || !editableDay) {
            setSendStatus("error");
            setTimeout(() => setSendStatus(null), 3000);
            return;
        }

        setIsSending(true);
        setSendStatus(null);

        try {
            // Format message from editableDay
            const message = formatDiscordMessage(editableDay);

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(message),
            });

            if (response.ok) {
                setSendStatus("success");
                setTimeout(() => {
                    setIsOpen(false);
                    setSendStatus(null);
                }, 2000);
            } else {
                setSendStatus("error");
            }
        } catch {
            setSendStatus("error");
        } finally {
            setIsSending(false);
            setTimeout(() => setSendStatus(null), 3000);
        }
    };

    const updateVocabulary = (index: number, field: "word" | "type" | "translation", value: string) => {
        if (!editableDay) return;
        const newVocabulary = [...editableDay.newVocabulary];
        newVocabulary[index] = { ...newVocabulary[index], [field]: value };
        setEditableDay({
            ...editableDay,
            newVocabulary: newVocabulary,
        });
    };

    const addVocabulary = () => {
        if (!editableDay) return;
        setEditableDay({
            ...editableDay,
            newVocabulary: [
                ...editableDay.newVocabulary,
                { word: "", type: "", translation: "" },
            ],
        });
    };

    const removeVocabulary = (index: number) => {
        if (!editableDay) return;
        const newVocabulary = editableDay.newVocabulary.filter((_, i) => i !== index);
        setEditableDay({
            ...editableDay,
            newVocabulary: newVocabulary,
        });
    };

    const updateReviewWord = (index: number, value: string) => {
        if (!editableDay) return;
        const newReviewVocabulary = [...editableDay.reviewVocabulary];
        newReviewVocabulary[index] = value;
        setEditableDay({
            ...editableDay,
            reviewVocabulary: newReviewVocabulary,
        });
    };

    const addReviewWord = () => {
        if (!editableDay) return;
        setEditableDay({
            ...editableDay,
            reviewVocabulary: [...editableDay.reviewVocabulary, ""],
        });
    };

    const removeReviewWord = (index: number) => {
        if (!editableDay) return;
        const newReviewVocabulary = editableDay.reviewVocabulary.filter((_, i) => i !== index);
        setEditableDay({
            ...editableDay,
            reviewVocabulary: newReviewVocabulary,
        });
    };

    return (
        <>
            {day && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200"
                    title="Share to Discord"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                    </svg>
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                Share to Discord
                            </h2>
                            <div className="flex items-center gap-3">
                                <GenerateButton
                                    onGenerate={handleGenerateData}
                                    showStatus={false}
                                />
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        setSendStatus(null);
                                    }}
                                    className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            {/* Webhook URL Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                    Discord Webhook URL
                                </label>

                                <input
                                    type="text"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    placeholder="https://discord.com/api/webhooks/..."
                                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />

                                {/* Webhook Badges */}
                                {WEBHOOK_CONFIGS.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {WEBHOOK_CONFIGS.map((config, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setWebhookUrl(config.url)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${webhookUrl === config.url
                                                    ? "bg-indigo-600 text-white shadow-md"
                                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700"
                                                    }`}
                                                title={`Click to use: ${config.name}`}
                                            >
                                                {config.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>


                            {/* Editable Day Data */}
                            {editableDay && (
                                <div className="space-y-4">

                                    {/* Day Number */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                            Day
                                        </label>
                                        <input
                                            type="number"
                                            value={editableDay.day}
                                            onChange={(e) =>
                                                setEditableDay({
                                                    ...editableDay,
                                                    day: parseInt(e.target.value) || 0,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Tense */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                            Tense
                                        </label>
                                        <input
                                            type="text"
                                            value={editableDay.tense}
                                            onChange={(e) =>
                                                setEditableDay({
                                                    ...editableDay,
                                                    tense: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Vietnamese Text */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                            Vietnamese Text
                                        </label>
                                        <textarea
                                            value={editableDay.vietnameseText}
                                            onChange={(e) =>
                                                setEditableDay({
                                                    ...editableDay,
                                                    vietnameseText: e.target.value,
                                                })
                                            }
                                            rows={3}
                                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                                        />
                                    </div>

                                    {/* English Text */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                            English Text
                                        </label>
                                        <textarea
                                            value={editableDay.englishText}
                                            onChange={(e) =>
                                                setEditableDay({
                                                    ...editableDay,
                                                    englishText: e.target.value,
                                                })
                                            }
                                            rows={3}
                                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                                        />
                                    </div>

                                    {/* New Vocabulary */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                                New Vocabulary
                                            </label>
                                            <button
                                                onClick={addVocabulary}
                                                className="text-xs px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 rounded-md text-indigo-700 dark:text-indigo-300 transition-colors"
                                            >
                                                + Thêm từ vựng
                                            </button>
                                        </div>
                                        {editableDay.newVocabulary.map((vocab, index) => (
                                            <div
                                                key={index}
                                                className="p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 space-y-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                                        Từ vựng {index + 1}
                                                    </span>
                                                    <button
                                                        onClick={() => removeVocabulary(index)}
                                                        className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded text-red-700 dark:text-red-300 transition-colors"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Word"
                                                    value={vocab.word}
                                                    onChange={(e) =>
                                                        updateVocabulary(index, "word", e.target.value)
                                                    }
                                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                                <select
                                                    value={vocab.type}
                                                    onChange={(e) =>
                                                        updateVocabulary(index, "type", e.target.value)
                                                    }
                                                    className="w-full p-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                >
                                                    <option value="noun">Noun</option>
                                                    <option value="verb">Verb</option>
                                                    <option value="adjective">Adjective</option>
                                                    <option value="adverb">Adverb</option>
                                                    <option value="pronoun">Pronoun</option>
                                                    <option value="preposition">Preposition</option>
                                                    <option value="conjunction">Conjunction</option>
                                                    <option value="interjection">Interjection</option>
                                                    <option value="article">Article</option>
                                                    <option value="determiner">Determiner</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Translation"
                                                    value={vocab.translation}
                                                    onChange={(e) =>
                                                        updateVocabulary(index, "translation", e.target.value)
                                                    }
                                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Review Vocabulary */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                                Review Vocabulary
                                            </label>
                                            <button
                                                onClick={addReviewWord}
                                                className="text-xs px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 rounded-md text-indigo-700 dark:text-indigo-300 transition-colors"
                                            >
                                                + Thêm từ
                                            </button>
                                        </div>
                                        {editableDay.reviewVocabulary.map((word, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="Review word"
                                                    value={word}
                                                    onChange={(e) =>
                                                        updateReviewWord(index, e.target.value)
                                                    }
                                                    className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                                <button
                                                    onClick={() => removeReviewWord(index)}
                                                    className="px-2 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded text-red-700 dark:text-red-300 transition-colors"
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status Message */}
                            {sendStatus && (
                                <div
                                    className={`p-3 rounded-lg ${sendStatus === "success"
                                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                        : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                        }`}
                                >
                                    <p
                                        className={`text-sm ${sendStatus === "success"
                                            ? "text-green-800 dark:text-green-200"
                                            : "text-red-800 dark:text-red-200"
                                            }`}
                                    >
                                        {sendStatus === "success"
                                            ? "✅ Đã gửi thành công đến Discord!"
                                            : "❌ Có lỗi xảy ra khi gửi. Vui lòng kiểm tra webhook URL."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setSendStatus(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={isSending || !webhookUrl.trim()}
                                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSending ? (
                                    <>
                                        <svg
                                            className="animate-spin h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Đang gửi...
                                    </>
                                ) : (
                                    "Gửi đến Discord"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

