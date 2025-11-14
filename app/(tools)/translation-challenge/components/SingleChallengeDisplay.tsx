"use client";

import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Lesson } from "../common/type";
import { DiscordSendButton } from "./DiscordSendButton";

interface SingleChallengeDisplayProps {
  lesson: Lesson;
}

export const SingleChallengeDisplay = ({ lesson }: SingleChallengeDisplayProps) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            📚
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-2xl font-bold text-foreground">Bài học dịch thuật</div>
            <Chip
              color="primary"
              variant="flat"
              size="lg"
              className="font-semibold"
            >
              {lesson.tense}
            </Chip>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DiscordSendButton
            dayData={{
              day: 1,
              goal: lesson.goal,
              tense: lesson.tense,
              vietnameseText: lesson.vietnameseText,
              englishText: lesson.englishText,
              newVocabulary: lesson.newVocabulary,
              reviewVocabulary: lesson.reviewVocabulary,
            }}
          />
        </div>
      </div>

      {/* Vietnamese Text Section */}
      <div className="flex gap-4">
        <div className="w-1 bg-gradient-to-b from-primary-500 via-primary-400 to-secondary-500 rounded-full flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Đoạn văn tiếng Việt
          </h3>
          <div className="bg-default-100 p-5 rounded-lg">
            <p className="text-base leading-relaxed text-default-700">
              {lesson.vietnameseText}
            </p>
          </div>
        </div>
      </div>

      {/* English Text Section */}
      <div className="flex gap-4">
        <div className="w-1 bg-gradient-to-b from-primary-500 via-primary-400 to-secondary-500 rounded-full flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Đoạn văn tiếng Anh
          </h3>
          <div className="bg-gradient-to-br from-primary-50/50 to-secondary-50/50 p-5 rounded-lg border border-primary-200/50">
            <p className="text-base leading-relaxed text-default-700">
              {lesson.englishText}
            </p>
          </div>
        </div>
      </div>

      {/* New Vocabulary Section */}
      <div className="flex gap-4">
        <div className="w-1 bg-gradient-to-b from-success-500 to-success-400 rounded-full flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Từ vựng mới
            </h3>
            <Chip size="sm" variant="flat" color="success" className="font-semibold">
              {lesson.newVocabulary.length} từ
            </Chip>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {lesson.newVocabulary.map((vocab, index) => (
              <Card
                key={index}
                className="bg-default-100 border border-default-200"
              >
                <CardBody className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg text-default-600">
                        {vocab.word}
                      </span>
                      <Chip
                        size="sm"
                        variant="flat"
                        color="secondary"
                        className="font-semibold"
                      >
                        {vocab.type}
                      </Chip>
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      {vocab.translation}
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Review Vocabulary Section */}
      {lesson.reviewVocabulary && lesson.reviewVocabulary.length > 0 && (
        <div className="flex gap-4">
          <div className="w-1 bg-gradient-to-b from-warning-500 to-warning-400 rounded-full flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Từ vựng ôn tập
              </h3>
              <Chip size="sm" variant="flat" color="warning" className="font-semibold">
                {lesson.reviewVocabulary.length} từ
              </Chip>
            </div>
            <div className="flex flex-wrap gap-2">
              {lesson.reviewVocabulary.map((word, index) => (
                <Chip
                  key={index}
                  variant="bordered"
                  size="sm"
                  className="font-medium"
                >
                  {word}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

