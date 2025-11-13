"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { title } from "@/components/primitives";

export default function TranslationChallenge() {
  const handleCreate15DaysChallenge = () => {
    // TODO: Implement logic for creating 15 days challenge
    console.log("Tạo thử thách 15 ngày dịch thuật");
  };

  const handleCreateSingleChallenge = () => {
    // TODO: Implement logic for creating single challenge
    console.log("Tạo thử thách đơn");
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className={title({ size: "lg" })}>Thử thách dịch thuật</h1>
        <p className="text-default-500 mt-2 text-sm">
          Chọn loại thử thách bạn muốn tạo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <Card className="hover:scale-[1.02] transition-transform cursor-pointer" isPressable onPress={handleCreate15DaysChallenge}>
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
                onClick={handleCreate15DaysChallenge}
              >
                Tạo thử thách
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform cursor-pointer" isPressable onPress={handleCreateSingleChallenge}>
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
                onClick={handleCreateSingleChallenge}
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

