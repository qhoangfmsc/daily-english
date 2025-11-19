"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import clsx from "clsx";

import { title } from "./primitives";

export const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      label: "Trang chủ",
      href: "/",
      icon: "heroicons:home",
    },
    {
      label: "Thông báo",
      href: "/notification",
      icon: "heroicons:bell",
    },
    {
      label: "Thử thách dịch thuật",
      href: "/translation-challenge",
      icon: "heroicons:academic-cap",
    },
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={clsx(
        "relative h-screen flex flex-col transition-all duration-200",
        isCollapsed ? "w-36" : "w-80",
      )}
    >
      <div
        className={`flex items-center justify-between ${!isCollapsed ? "border-b border-divider p-6 mx-4 " : ""}`}
      >
        {!isCollapsed && (
          <Link
            className="flex items-center gap-2 w-full justify-center"
            href="/"
          >
            <span
              className={title({ color: "violet" })}
              style={{ fontSize: "1.7rem", lineHeight: "1.5" }}
            >
              Daily English
            </span>
          </Link>
        )}
      </div>

      <Button
        isIconOnly
        aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
        className={`absolute bottom-20 -right-5 bg-gradient-to-r from-violet-50 to-white rounded-full border-1 border-divider`}
        size="md"
        variant="solid"
        onClick={toggleCollapse}
      >
        <Icon
          className="w-5 h-5 text-gray-400"
          icon={
            isCollapsed ? "heroicons:chevron-right" : "heroicons:chevron-left"
          }
        />
      </Button>

      <nav className="flex-1 p-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Button
                  as={Link}
                  className={clsx(
                    "w-full",
                    isCollapsed ? "justify-center" : "justify-start",
                    isActive && "font-semibold",
                  )}
                  color={isActive ? "primary" : "default"}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  variant={isActive ? "solid" : "light"}
                >
                  <Icon className="w-5 h-5" icon={item.icon} />
                  {!isCollapsed && <span className="ml-2">{item.label}</span>}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
