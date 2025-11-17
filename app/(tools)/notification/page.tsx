"use client";

import type {
  DiscordMessage,
  DiscordEmbed,
} from "../translation-challenge/common/discord";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Alert } from "@heroui/alert";

import { WEBHOOK_CONFIGS } from "../translation-challenge/common/discord";

import { CONTENT_TEMPLATES } from "./common/config";

import { title } from "@/components/primitives";

export default function Notification() {
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [embedTitle, setEmbedTitle] = useState<string>("🎯 DAILY CHALLENGE");
  const [embedDescription, setEmbedDescription] = useState<string>("");
  const [embedFooter, setEmbedFooter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectWebhook = (url: string) => {
    setWebhookUrl(url);
  };

  const handleSelectTemplate = (content: string) => {
    setEmbedDescription(content);
  };

  const handleSend = async () => {
    if (!webhookUrl.trim()) {
      setErrorMessage("Please enter or select a webhook URL");

      return;
    }

    if (!embedTitle.trim()) {
      setErrorMessage("Please enter a title");

      return;
    }

    if (!embedDescription.trim()) {
      setErrorMessage("Please enter embed content");

      return;
    }

    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const embed: DiscordEmbed = {
        title: embedTitle,
        description: embedDescription,
        color: 0x0c8c5f,
        fields: [],
        footer: {
          text: embedFooter,
        },
      };

      const message: DiscordMessage = {
        content: "",
        embeds: [embed],
      };

      const response = await fetch("/api/discord/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhookUrl: webhookUrl.trim(),
          message,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "An error occurred while sending the message",
        );
      }

      setSuccessMessage("Message sent successfully!");

      // Reset form
      setEmbedTitle("🎯 DAILY CHALLENGE");
      setEmbedDescription("");
      setEmbedFooter("");
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "An error occurred while sending the message";

      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className={title({ size: "lg" })}>Thông báo</h1>
        <p className="text-default-500 mt-2 text-sm">
          Cấu hình và gửi tin nhắn
        </p>
      </div>

      {successMessage && (
        <Alert
          color="success"
          variant="flat"
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert
          color="danger"
          variant="flat"
          onClose={() => setErrorMessage(null)}
        >
          {errorMessage}
        </Alert>
      )}

      <Card className="max-w-lg p-4">
        <CardHeader
          className={`text-lg font-bold ${title({ color: "blue", size: "sm" })}`}
        >
          Discord
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Input
                isRequired
                label="Webhook URL"
                placeholder="Enter webhook URL"
                value={webhookUrl}
                onValueChange={setWebhookUrl}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {WEBHOOK_CONFIGS.map((webhook) => (
                  <Chip
                    key={webhook.url}
                    className="cursor-pointer"
                    color={webhookUrl === webhook.url ? "primary" : "default"}
                    variant={webhookUrl === webhook.url ? "solid" : "flat"}
                    onClick={() => handleSelectWebhook(webhook.url)}
                  >
                    {webhook.name}
                  </Chip>
                ))}
              </div>
            </div>

            <Input
              isRequired
              label="Title"
              placeholder="Enter title"
              value={embedTitle}
              onValueChange={setEmbedTitle}
            />

            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="embed-content"
              >
                Embed Content
              </label>
              <textarea
                className="w-full min-h-[120px] px-3 py-2 text-sm bg-background border border-default-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                id="embed-content"
                placeholder="Enter embed content"
                value={embedDescription}
                onChange={(e) => setEmbedDescription(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {CONTENT_TEMPLATES.map((template, index) => (
                  <Chip
                    key={index}
                    className="cursor-pointer hover:bg-primary-200 transition-all duration-200"
                    color="primary"
                    variant="flat"
                    onClick={() => handleSelectTemplate(template.content)}
                  >
                    {template.label}
                  </Chip>
                ))}
              </div>
            </div>

            <Input
              label="Footer"
              placeholder="Daily English"
              value={embedFooter}
              onValueChange={setEmbedFooter}
            />

            <Button
              className="w-full mt-4"
              color="primary"
              isDisabled={
                isLoading ||
                !webhookUrl.trim() ||
                !embedTitle.trim() ||
                !embedDescription.trim()
              }
              isLoading={isLoading}
              size="lg"
              onPress={handleSend}
            >
              Send Message
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
