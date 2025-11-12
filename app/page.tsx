"use client";

import { useState } from "react";
import ChallengeList from "./component/ChallengeList";
import ExportButton from "./component/ExportButton";
import MockupData from "./component/MockupData";
import ShareButton from "./component/ShareButton";

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

interface ChallengeData {
  success: boolean;
  data: {
    days: DayChallenge[];
  };
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleCreateSchedule = async () => {
    setLoading(true);
    setChallengeData(null);
    setError(null);

    try {
      const response = await fetch("/api/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setChallengeData(data);
      } else {
        setError(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex h-full w-full max-w-3xl flex-col items-center justify-between bg-white dark:bg-black sm:items-start gap-8">
        <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left w-full">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            15 Ngày Dịch Thuật 
          </h1>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Thử thách dịch từ tiếng Việt sang tiếng Anh trong 15 ngày
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full">
          {!challengeData && (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={handleCreateSchedule}
                disabled={loading}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang tạo..." : "Tạo thử thách 15 ngày"}
              </button>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border-2 border-foreground px-5 text-foreground transition-colors hover:bg-foreground hover:text-background dark:border-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-400 dark:hover:text-black"
              >
                Tạo thử thách đơn
              </button>
            </div>
          )}

          {error && (
            <>
              <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
              <MockupData />
            </>
          )}

          {challengeData && challengeData.data?.days && (
            <>
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCreateSchedule}
                  disabled={loading}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang tạo..." : "Tạo thử thách mới"}
                </button>
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border-2 border-foreground px-5 text-foreground transition-colors hover:bg-foreground hover:text-background dark:border-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-400 dark:hover:text-black"
                >
                  Tạo thử thách đơn
                </button>
                <ExportButton days={challengeData.data.days} />
              </div>
              <ChallengeList days={challengeData.data.days} />
            </>
          )}

          {/* Share Modal for creating single challenge */}
          <ShareButton
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            defaultDay={{
              day: 1,
              tense: "",
              vietnameseText: "",
              englishText: "",
              newVocabulary: [],
              reviewVocabulary: [],
            }}
          />
        </div>
      </main>
    </div>
  );
}
