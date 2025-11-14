"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Alert } from "@heroui/alert";
import { title } from "@/components/primitives";
import { SingleChallengeDisplay } from "./components/SingleChallengeDisplay";
import { Challenge15DaysDisplay } from "./components/Challenge15DaysDisplay";
import type { Lesson, Schedule, ApiResponse } from "./common/type";

type ViewState = "selection" | "loading" | "single" | "schedule" | "error";

export default function TranslationChallenge() {
  const [viewState, setViewState] = useState<ViewState>("selection");
  const [isLoading, setIsLoading] = useState(false);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate15DaysChallenge = async () => {
    setIsLoading(true);
    setViewState("loading");
    setError(null);

    try {
      const response = await fetch("/api/translation-challenge/create15days", {
        method: "POST",
      });

      const result: ApiResponse<Schedule> = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Có lỗi xảy ra khi tạo thử thách 15 ngày");
      }

      setSchedule(result.data);
      setViewState("schedule");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo thử thách 15 ngày";
      setError(errorMessage);
      setViewState("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSingleChallenge = async () => {
    setIsLoading(true);
    setViewState("loading");
    setError(null);

    try {
      const response = await fetch("/api/translation-challenge/create", {
        method: "POST",
      });

      const result: ApiResponse<Lesson> = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Có lỗi xảy ra khi tạo thử thách đơn");
      }

      setLesson(result.data);
      setViewState("single");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo thử thách đơn";
      setError(errorMessage);
      setViewState("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSelection = () => {
    setViewState("selection");
    setLesson(null);
    setSchedule(null);
    setError(null);
  };

  if (viewState === "loading") {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className={title({ size: "sm" })}>Thử thách dịch thuật</h1>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500">Đang tạo thử thách...</p>
        </div>
      </div>
    );
  }

  if (viewState === "error") {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className={title({ size: "sm" })}>Thử thách dịch thuật</h1>
        </div>
        <Alert color="danger" variant="flat">
          {error || "Có lỗi xảy ra"}
        </Alert>
        <Button className="w-fit" color="primary" onPress={handleBackToSelection}>
          Quay lại
        </Button>
      </div>
    );
  }

  if (viewState === "single" && lesson) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className={title({ size: "lg" })}>Thử thách dịch thuật</h1>
          <Button color="default" variant="bordered" onPress={handleBackToSelection}>
            Tạo mới
          </Button>
        </div>
        <SingleChallengeDisplay lesson={lesson} />
      </div>
    );
  }

  if (viewState === "schedule" && schedule) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className={title({ size: "lg" })}>Thử thách dịch thuật</h1>
          <Button color="default" variant="bordered" onPress={handleBackToSelection}>
            Tạo mới
          </Button>
        </div>
        <Challenge15DaysDisplay schedule={schedule} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className={title({ size: "lg" })}>Thử thách dịch thuật</h1>
        <p className="text-default-500 mt-2 text-sm">
          Chọn loại thử thách bạn muốn tạo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <Card className="hover:scale-[1.02] transition-transform">
          <CardBody className="p-6">
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Thử thách 15 ngày</h3>
              <p className="text-sm text-default-500">
                Tạo một chuỗi thử thách dịch thuật kéo dài 15 ngày liên tiếp
              </p>
              <Button
                color="primary"
                size="sm"
                className="w-full mt-2"
                onPress={handleCreate15DaysChallenge}
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                Tạo thử thách
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform">
          <CardBody className="p-6">
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Thử thách đơn</h3>
              <p className="text-sm text-default-500">
                Tạo một thử thách dịch thuật đơn lẻ để luyện tập
              </p>
              <Button
                color="secondary"
                size="sm"
                className="w-full mt-2"
                onPress={handleCreateSingleChallenge}
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                Tạo thử thách
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

