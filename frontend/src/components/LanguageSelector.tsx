"use client";

import type { LanguageCode } from "@/lib/types";

const LANGUAGES: { code: LanguageCode; label: string; native: string }[] = [
  { code: "en", label: "English", native: "EN" },
  { code: "ta", label: "Tamil", native: "த" },
  { code: "hi", label: "Hindi", native: "हि" },
  { code: "ml", label: "Malayalam", native: "മ" },
  { code: "kn", label: "Kannada", native: "ಕ" },
  { code: "te", label: "Telugu", native: "తె" },
];

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (code: LanguageCode) => void;
}

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
