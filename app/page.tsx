import { title, subtitle } from "@/components/primitives";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
      <div className="text-center max-w-2xl">
        <h1 className={title({ size: "lg" })}>
          Chào mừng đến với{" "}
          <span className={title({ color: "violet", size: "lg" })}>
            Daily English
          </span>
        </h1>
        <p className={subtitle({ class: "mt-4" })}>
          Nền tảng học tiếng Anh hàng ngày hiệu quả và thú vị
        </p>
      </div>
    </div>
  );
}
