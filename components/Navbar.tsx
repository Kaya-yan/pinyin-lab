"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import SearchIcon from "./SearchIcon";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { t } = useI18n();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/lab?word=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface border-b border-border h-14 flex items-center px-4 sm:px-6">
      <Link
        href="/lab"
        className="font-serif text-xl sm:text-2xl font-semibold text-text mr-auto hover:text-primary transition-colors duration-150"
      >
        PinyinLab
      </Link>

      <div className="flex items-center gap-3 sm:gap-4">
        <form onSubmit={handleSearch} className="relative hidden sm:block">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("nav.searchPlaceholder")}
            maxLength={20}
            className="w-56 lg:w-70 h-10 px-4 pr-9 border border-border rounded-sm text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-150"
            aria-label={t("nav.searchAriaLabel")}
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors duration-150"
            aria-label={t("nav.searchButton")}
          >
            <SearchIcon size={16} />
          </button>
        </form>

        <div className="flex items-center gap-1">
          <Link
            href="/lab"
            className={`px-3 py-3 text-sm font-medium rounded-sm transition-colors duration-150 ${
              pathname === "/lab"
                ? "text-primary bg-highlight"
                : "text-text-muted hover:text-primary"
            }`}
          >
            {t("nav.lab")}
          </Link>
          <Link
            href="/clips"
            className={`px-3 py-3 text-sm font-medium rounded-sm transition-colors duration-150 ${
              pathname === "/clips"
                ? "text-primary bg-highlight"
                : "text-text-muted hover:text-primary"
            }`}
          >
            {t("nav.clips")}
          </Link>
        </div>

        <LanguageSwitcher />
      </div>
    </nav>
  );
}
