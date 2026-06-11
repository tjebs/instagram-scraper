"use client";

import type { CheckOption } from "@/lib/types";

export default function CheckboxGroup({
  options,
  valgte,
  onChange,
}: {
  options: CheckOption[];
  valgte: string[];
  onChange: (valgte: string[]) => void;
}) {
  function toggle(key: string) {
    onChange(
      valgte.includes(key) ? valgte.filter((k) => k !== key) : [...valgte, key],
    );
  }

  return (
    <div className="space-y-1.5">
      {options.map((opt) => {
        const checked = valgte.includes(opt.key);
        return (
          <label
            key={opt.key}
            className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              checked
                ? "border-brand bg-brand-light"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(opt.key)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">
                {opt.label}
              </span>
              {opt.hint && (
                <span className="mt-0.5 block text-xs text-gray-500">
                  {opt.hint}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
