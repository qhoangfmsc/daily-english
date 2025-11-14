// Discord webhook configuration and types

export interface WebhookConfig {
  name: string;
  url: string;
}

export const WEBHOOK_CONFIGS: WebhookConfig[] = [
  {
    name: "Test Ori",
    url: "https://discord.com/api/webhooks/1402137172483768332/8irZRAm0m8XwI-QZ5JyqhsAYs5xA9uju5nVFclfYah1M2vJJpajrtgnJdxwpsIsSDYIe",
  },
  {
    name: "Test Ori 2",
    url: "https://discord.com/api/webhooks/1420310534406017056/roWASFuVz_NCi1lXQq0J3jKSCrFqhrrov65o2b4sA-YqGVWtlPghosbtPOUox9MhG1y4",
  },
  {
    name: "Vietnix Learning English",
    url: "https://discord.com/api/webhooks/1438019727283851304/88kA1Hiv_Hg6v8pjWOsvRMHSUNHJG3mzTSfm18muySTpLndF8sSVW8XsCdiDVr4Q4Kzx",
  },
];

export interface DiscordField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields: DiscordField[];
  footer: {
    text: string;
  };
}

export interface DiscordMessage {
  content: string;
  embeds: DiscordEmbed[];
}

