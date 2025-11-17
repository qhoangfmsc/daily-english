export interface ContentTemplate {
  label: string;
  content: string;
}

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    label: "Grammar Checker",
    content:
      "A big round of applause for everyone who joined today's challenge. Thanks for giving it your best — let's keep pushing forward!\n\nTo make your writings even better, giving them one more review with [**Zobite - Grammar Checker**](https://zobite.com/grammar-checker). It gives more accurate corrections and can help you improve quickly. Thank you!",
  },
  {
    label: "Thank You",
    content:
      "Thank you for participating in today's challenge! Keep up the great work! 💪",
  },
  {
    label: "Reminder",
    content:
      "Don't forget to complete today's challenge! Stay consistent and practice every day! ⏰",
  },
  {
    label: "Encouragement",
    content: "You're doing great! Keep pushing forward and don't give up! 🌟",
  },
  {
    label: "Congratulations",
    content:
      "Congratulations on completing the challenge! Keep maintaining your learning habit! 🎉",
  },
];
