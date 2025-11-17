import { NextResponse } from "next/server";

import { createChallenge } from "./service";

export async function POST() {
  try {
    const challenge = await createChallenge();

    return NextResponse.json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating lesson:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi tạo bài học",
      },
      { status: 500 },
    );
  }
}
