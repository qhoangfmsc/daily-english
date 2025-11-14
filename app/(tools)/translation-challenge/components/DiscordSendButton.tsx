"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Alert } from "@heroui/alert";
import { DayChallenge, VocabularyItem } from "../common/type";
import { WEBHOOK_CONFIGS, type DiscordMessage } from "../common/discord";

const WORD_TYPES = [
    "noun",
    "verb",
    "adjective",
    "adverb",
    "preposition",
    "conjunction",
    "interjection",
    "pronoun",
    "determiner",
] as const;

interface DiscordSendButtonProps {
    dayData: DayChallenge;
}

export const DiscordSendButton = ({ dayData }: DiscordSendButtonProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [webhookUrl, setWebhookUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        day: dayData.day.toString(),
        description: `Translate the following sentence into English using the **${dayData.tense}**!`,
        sentenceToTranslate: dayData.vietnameseText,
        sampleTranslation: dayData.englishText,
    });

    const [newVocabulary, setNewVocabulary] = useState<VocabularyItem[]>(
        dayData.newVocabulary.map((v) => ({ ...v }))
    );
    const [reviewVocabulary, setReviewVocabulary] = useState<string[]>(
        dayData.reviewVocabulary ? [...dayData.reviewVocabulary] : []
    );
    const [showSampleTranslation, setShowSampleTranslation] = useState(false);

    const handleAddNewVocab = () => {
        setNewVocabulary([
            ...newVocabulary,
            { word: "", type: "", translation: "" },
        ]);
    };

    const handleRemoveNewVocab = (index: number) => {
        setNewVocabulary(newVocabulary.filter((_, i) => i !== index));
    };

    const handleUpdateNewVocab = (
        index: number,
        field: keyof VocabularyItem,
        value: string
    ) => {
        const updated = [...newVocabulary];
        updated[index] = { ...updated[index], [field]: value };
        setNewVocabulary(updated);
    };

    const handleAddReviewVocab = () => {
        setReviewVocabulary([...reviewVocabulary, ""]);
    };

    const handleRemoveReviewVocab = (index: number) => {
        setReviewVocabulary(reviewVocabulary.filter((_, i) => i !== index));
    };

    const handleUpdateReviewVocab = (index: number, value: string) => {
        const updated = [...reviewVocabulary];
        updated[index] = value;
        setReviewVocabulary(updated);
    };

    const handleSelectWebhook = (url: string) => {
        setWebhookUrl(url);
    };

    const handleSend = async () => {
        if (!webhookUrl.trim()) {
            setError("Vui lòng nhập hoặc chọn Discord webhook URL");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const vocabText =
                newVocabulary.filter((v) => v.word && v.type && v.translation).length > 0
                    ? newVocabulary
                        .filter((v) => v.word && v.type && v.translation)
                        .map((v) => {
                            const wordLower = v.word.toLowerCase().trim();
                            const dictionaryUrl = `https://dictionary.cambridge.org/vi/dictionary/english/${encodeURIComponent(wordLower)}`;
                            return `[**${v.word}**](${dictionaryUrl}) (${v.type}): ${v.translation}`;
                        })
                        .join("\n")
                    : "";

            const reviewText =
                reviewVocabulary.filter((w) => w.trim()).length > 0
                    ? reviewVocabulary
                        .filter((w) => w.trim())
                        .map((word) => {
                            const wordLower = word.toLowerCase().trim();
                            const dictionaryUrl = `https://dictionary.cambridge.org/vi/dictionary/english/${encodeURIComponent(wordLower)}`;
                            return `[**${word}**](${dictionaryUrl})`;
                        })
                        .join(", ")
                    : "";

            const fields = [];
            if (vocabText) {
                fields.push({
                    name: "",
                    value: "\u200b",
                    inline: false,
                });
                fields.push({
                    name: "📚 Today's New Vocabulary",
                    value: vocabText,
                    inline: false,
                });
            }

            if (reviewText) {
                fields.push({
                    name: "",
                    value: "\u200b",
                    inline: false,
                });
                fields.push({
                    name: "🔄 Review Vocabulary",
                    value: reviewText,
                    inline: false,
                });
            }

            if (formData.sentenceToTranslate) {
                fields.push({
                    name: "",
                    value: "\u200b",
                    inline: false,
                });
                fields.push({
                    name: "📝 Sentence to Translate",
                    value: `\`\`\`${formData.sentenceToTranslate}\`\`\``,
                    inline: false,
                });
            }

            if (formData.sampleTranslation) {
                fields.push({
                    name: "",
                    value: "\u200b",
                    inline: false,
                });
                fields.push({
                    name: "✅ Sample Translation (Click to reveal)",
                    value: `||\`\`\`${formData.sampleTranslation}\`\`\`||`,
                    inline: false,
                });
            }

            const discordMessage: DiscordMessage = {
                content: "# 🎯 **DAILY CHALLENGE**",
                embeds: [
                    {
                        title: `📅 Day ${formData.day} Challenge`,
                        description: formData.description,
                        color: 0x0c8c5f,
                        fields: fields,
                        footer: {
                            text: "\n\nNote: Make sure to translate the sentence into English before revealing the sample translation.",
                        },
                    },
                ],
            };

            const response = await fetch("/api/discord/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    webhookUrl: webhookUrl.trim(),
                    message: discordMessage,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Có lỗi xảy ra khi gửi đến Discord");
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setWebhookUrl("");
            }, 1500);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Có lỗi xảy ra khi gửi đến Discord";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                color="primary"
                variant="flat"
                onPress={onOpen}
                startContent={
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-current"
                    >
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                }
            >
                Gửi Discord
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-xl font-bold">Gửi Challenge đến Discord</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Chỉnh sửa nội dung dạng markdown và nhập webhook URL để gửi
                                </p>
                            </ModalHeader>
                            <ModalBody className="gap-6 h-[70vh] overflow-y-auto">
                                {/* Section: Webhook Configuration */}
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 bg-primary-500 rounded-full" />
                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                        Discord Configuration
                                    </h3>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-foreground">
                                        Webhook URL
                                    </label>
                                    <Input
                                        placeholder="Nhập webhook URL hoặc chọn nhanh bên dưới"
                                        value={webhookUrl}
                                        onValueChange={setWebhookUrl}
                                        isRequired
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {WEBHOOK_CONFIGS.map((webhook) => (
                                            <Chip
                                                key={webhook.url}
                                                variant={webhookUrl === webhook.url ? "solid" : "flat"}
                                                color={webhookUrl === webhook.url ? "primary" : "default"}
                                                className="cursor-pointer"
                                                onClick={() => handleSelectWebhook(webhook.url)}
                                            >
                                                {webhook.name}
                                            </Chip>
                                        ))}
                                    </div>
                                </div>

                                {/* Section: Basic Info */}
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 bg-default-500 rounded-full" />
                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                        Basic Information
                                    </h3>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Input
                                        label="Ngày Challenge"
                                        value={formData.day}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({ ...prev, day: value }))
                                        }
                                        type="number"
                                        min={1}
                                        max={15}
                                    />
                                    <Input
                                        label="Description"
                                        placeholder="Mô tả cho challenge"
                                        value={formData.description}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({ ...prev, description: value }))
                                        }
                                    />
                                </div>

                                {/* Section: New Vocabulary Editor */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-5 bg-success-500 rounded-full" />
                                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                            📚 Today's New Vocabulary ({newVocabulary.length})
                                        </h3>
                                    </div>
                                    <Button
                                        size="sm"
                                        color="success"
                                        variant="flat"
                                        onPress={handleAddNewVocab}
                                    >
                                        + Thêm từ
                                    </Button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {newVocabulary.map((vocab, index) => (
                                        <Card key={index} className="bg-white border border-success-200/50">
                                            <CardBody className="p-3">
                                                <div className="flex gap-2 items-center">
                                                    <Input
                                                        placeholder="Word"
                                                        value={vocab.word}
                                                        label="Từ"
                                                        onValueChange={(value) =>
                                                            handleUpdateNewVocab(index, "word", value)
                                                        }
                                                        size="sm"
                                                    />
                                                    <Input
                                                        placeholder="Translation"
                                                        value={vocab.translation}
                                                        label="Ý nghĩa"
                                                        onValueChange={(value) =>
                                                            handleUpdateNewVocab(index, "translation", value)
                                                        }
                                                        size="sm"
                                                    />
                                                    <Select
                                                        label="Loại từ"
                                                        placeholder="Type"
                                                        selectedKeys={vocab.type ? [vocab.type] : []}
                                                        onSelectionChange={(keys) => {
                                                            const selected = Array.from(keys)[0] as string;
                                                            handleUpdateNewVocab(
                                                                index,
                                                                "type",
                                                                selected || ""
                                                            );
                                                        }}
                                                        size="sm"
                                                    >
                                                        {WORD_TYPES.map((type) => (
                                                            <SelectItem key={type}>
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </Select>
                                                    <Button
                                                        size="sm"
                                                        color="danger"
                                                        variant="light"
                                                        isIconOnly
                                                        onPress={() => handleRemoveNewVocab(index)}
                                                    >
                                                        ×
                                                    </Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>

                                {/* Section: Review Vocabulary Editor */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-5 bg-warning-500 rounded-full" />
                                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                            🔄 Review Vocabulary ({reviewVocabulary.length})
                                        </h3>
                                    </div>
                                    <Button
                                        size="sm"
                                        color="warning"
                                        variant="flat"
                                        onPress={handleAddReviewVocab}
                                    >
                                        + Thêm từ
                                    </Button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {reviewVocabulary.map((word, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                placeholder="Review word"
                                                value={word}
                                                onValueChange={(value) =>
                                                    handleUpdateReviewVocab(index, value)
                                                }
                                                size="sm"
                                                className="flex-1"
                                            />
                                            <Button
                                                size="sm"
                                                color="danger"
                                                variant="light"
                                                isIconOnly
                                                onPress={() => handleRemoveReviewVocab(index)}
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Section: Translation Content */}
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 bg-secondary-500 rounded-full" />
                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                        Translation Content
                                    </h3>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {/* Sentence to Translate */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-foreground">
                                            Sentence to Translate
                                        </label>
                                        <textarea
                                            className="w-full min-h-[80px] px-3 py-2 text-sm bg-white border border-default-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent resize-y"
                                            placeholder="Câu cần dịch"
                                            value={formData.sentenceToTranslate}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    sentenceToTranslate: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <Divider />

                                    {/* Sample Translation */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-foreground">
                                            Sample Translation
                                        </label>
                                        {!showSampleTranslation ? (
                                            <Card
                                                className="bg-default-100 border border-default-200 cursor-pointer hover:bg-default-200 transition-colors"
                                                isPressable
                                                onPress={() => setShowSampleTranslation(true)}
                                            >
                                                <CardBody className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <svg
                                                                width="20"
                                                                height="20"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                className="text-default-500"
                                                            >
                                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                                <circle cx="12" cy="12" r="3" />
                                                            </svg>
                                                            <span className="text-sm text-default-600">
                                                                Nhấn để xem/chỉnh sửa bản dịch mẫu
                                                            </span>
                                                        </div>
                                                        <svg
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            className="text-default-500"
                                                        >
                                                            <path d="M9 18l6-6-6-6" />
                                                        </svg>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ) : (
                                            <>
                                                <textarea
                                                    className="w-full min-h-[80px] px-3 py-2 text-sm bg-white border border-default-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent resize-y"
                                                    placeholder="Bản dịch mẫu"
                                                    value={formData.sampleTranslation}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            sampleTranslation: e.target.value,
                                                        }))
                                                    }
                                                />
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-default-500">
                                                        Sẽ được ẩn bằng spoiler markdown (||text||)
                                                    </p>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        color="default"
                                                        onPress={() => setShowSampleTranslation(false)}
                                                    >
                                                        Ẩn đi
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Error Alert */}
                                {error && (
                                    <Alert color="danger" variant="flat" title="Lỗi">
                                        {error}
                                    </Alert>
                                )}

                                {/* Success Alert */}
                                {success && (
                                    <Alert color="success" variant="flat" title="Thành công">
                                        Đã gửi challenge đến Discord thành công!
                                    </Alert>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Hủy
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleSend}
                                    isLoading={isLoading}
                                    isDisabled={!webhookUrl.trim() || isLoading}
                                >
                                    {isLoading ? "Đang gửi..." : "Gửi đến Discord"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
