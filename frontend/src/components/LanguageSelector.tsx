"use client";

import { LANGUAGES } from "@/lib/constants";
import type { LanguageSelectorProps } from "@/lib/types";

export default function LanguageSelector({
  value,
  onChange,
}: LanguageSelectorProps) {
  return (
    <div className="lang-selector" role="group" aria-label="Select language">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          className={`lang-btn ${value === lang.code ? "lang-active" : ""}`}
          onClick={() => onChange(lang.code)}
          title={lang.label}
          aria-pressed={value === lang.code}
        >
          {lang.native}
        </button>
      ))}
    </div>
  );
}
