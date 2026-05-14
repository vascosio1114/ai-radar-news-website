"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function NewThreadModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-white shadow-lg transition hover:bg-accent-700 hover:shadow-xl md:static md:ml-auto md:h-auto md:w-auto md:rounded-lg md:px-4 md:py-2 md:shadow-none"
      >
        <span className="hidden md:inline">+ 新帖文</span>
        <span className="md:hidden">+</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 dark:bg-ink-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-100">
                新帖文
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="py-12 text-center">
              <p className="text-ink-500 dark:text-ink-400">即將推出</p>
              <p className="mt-2 text-sm text-ink-400">功能開發中，敬請期待！</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}