"use client";

import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Schedule } from "../common/type";
import { DiscordSendButton } from "./DiscordSendButton";
import clsx from "clsx";

interface Challenge15DaysDisplayProps {
    schedule: Schedule;
}

export const Challenge15DaysDisplay = ({ schedule }: Challenge15DaysDisplayProps) => {
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const selectedDayData = selectedDay
        ? schedule.days.find((day) => day.day === selectedDay)
        : null;

    return (
        <div className="flex flex-col gap-6">
            {/* Day Selection */}
            <div className="flex flex-wrap gap-2">
                {schedule.days.map((day) => {
                    const isSelected = selectedDay === day.day;
                    return (
                        <Button
                            key={day.day}
                            variant={isSelected ? "solid" : "bordered"}
                            color={isSelected ? "primary" : "default"}
                            size="sm"
                            className={clsx(
                                "min-w-[60px]",
                                isSelected && "font-semibold"
                            )}
                            onPress={() => setSelectedDay(day.day)}
                        >
                            Ngày {day.day}
                        </Button>
                    );
                })}
            </div>

            {/* Selected Day Details */}
            {selectedDayData && (
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {selectedDayData.day}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="text-2xl font-bold text-foreground">Ngày {selectedDayData.day}</div>
                                <Chip
                                    color="primary"
                                    variant="flat"
                                    size="lg"
                                    className="font-semibold"
                                >
                                    {selectedDayData.tense}
                                </Chip>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <DiscordSendButton dayData={selectedDayData} />
                        </div>
                    </div>

                    {/* Vietnamese Text Section */}
                    <div className="flex gap-4">
                        <div className="w-1 bg-gradient-to-b from-primary-500 via-primary-400 to-secondary-500 rounded-full flex-shrink-0" />
                        <div className="flex-1 flex flex-col gap-3">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                Đoạn văn tiếng Việt
                            </h3>
                            <div className="bg-default-100 dark:bg-default-50 p-5 rounded-lg">
                                <p className="text-base leading-relaxed text-default-700 dark:text-default-300">
                                    {selectedDayData.vietnameseText}
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
                            <div className="bg-gradient-to-br from-primary-50/50 to-secondary-50/50 dark:from-primary-950/50 dark:to-secondary-950/50 p-5 rounded-lg border border-primary-200/50 dark:border-primary-800/50">
                                <p className="text-base leading-relaxed text-default-700 dark:text-default-300">
                                    {selectedDayData.englishText}
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
                                    {selectedDayData.newVocabulary.length} từ
                                </Chip>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {selectedDayData.newVocabulary.map((vocab, index) => (
                                    <Card
                                        key={index}
                                        className="bg-default-100 dark:bg-default-50 border border-default-200 dark:border-default-700"
                                    >
                                        <CardBody className="p-4">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-lg text-default-600 dark:text-default-400">
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
                    {selectedDayData.reviewVocabulary &&
                        selectedDayData.reviewVocabulary.length > 0 && (
                            <div className="flex gap-4">
                                <div className="w-1 bg-gradient-to-b from-warning-500 to-warning-400 rounded-full flex-shrink-0" />
                                <div className="flex-1 flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                            Từ vựng ôn tập
                                        </h3>
                                        <Chip size="sm" variant="flat" color="warning" className="font-semibold">
                                            {selectedDayData.reviewVocabulary.length} từ
                                        </Chip>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDayData.reviewVocabulary.map((word, index) => (
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
            )}

            {/* Empty State */}
            {!selectedDayData && (
                <div className="flex items-center justify-center py-12 border-2 border-dashed border-default-300 dark:border-default-700 rounded-lg">
                    <p className="text-default-500">Chọn một ngày để xem chi tiết bài học</p>
                </div>
            )}
        </div>
    );
};

