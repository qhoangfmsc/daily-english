"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/button";
import clsx from "clsx";

export const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Trang chủ",
      href: "/",
    },
    {
      label: "Thông báo",
      href: "/notification",
    },
    {
      label: "Thử thách dịch thuật",
      href: "/translation-challenge",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-divider bg-background flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-divider">
        <Link className="flex items-center gap-2" href="/">
          <span className="font-bold text-xl">Daily English</span>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Button
                  as={Link}
                  className={clsx(
                    "w-full justify-start",
                    isActive && "font-semibold",
                  )}
                  color={isActive ? "primary" : "default"}
                  href={item.href}
                  variant={isActive ? "solid" : "light"}
                >
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
