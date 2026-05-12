"use client";

import { useEffect, useState } from "react";
import { Newspaper, Wrench, GraduationCap, Eye, Mail, Send, Loader2 } from "lucide-react";
import { buildDigestHtml } from "@/lib/mail";
import { MailSubscribers } from "@/components/admin/MailSubscribers";

interface MailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_from_address: string;
  smtp_from_name: string;
  daily_enabled: boolean;
  daily_hour: number;
  daily_timezone: string;
  email_subject_template: string;
  email_header_html: string;
  email_footer_html: string;
}

const TIMEZONES = [
  "Asia/Hong_Kong",
  "Asia/Shanghai",
  "Asia/Singapore",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
];

const DEFAULT_SETTINGS: MailSettings = {
  smtp_host: "",
  smtp_port: 587,
  smtp_user: "",
  smtp_pass: "",
  smtp_from_address: "",
  smtp_from_name: "",
  daily_enabled: false,
  daily_hour: 9,
  daily_timezone: "Asia/Hong_Kong",
  email_subject_template: "",
  email_header_html: "",
  email_footer_html: "",
};

export default function AdminDashboardPage() {
  const [settings, setSettings] = useState<MailSettings>(DEFAULT_SETTINGS);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Fetch mail settings
    fetch("/api/admin/mail/settings")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.settings) {
          setSettings((prev) => ({
            ...prev,
            smtp_host: data.settings.smtp_host ?? "",
            smtp_port: data.settings.smtp_port ?? 587,
            smtp_user: data.settings.smtp_user ?? "",
            smtp_pass: "",
            smtp_from_address: data.settings.smtp_from_address ?? "",
            smtp_from_name: data.settings.smtp_from_name ?? "",
            daily_enabled: data.settings.daily_enabled ?? false,
            daily_hour: data.settings.daily_hour ?? 9,
            daily_timezone: data.settings.daily_timezone ?? "Asia/Hong_Kong",
            email_subject_template: data.settings.email_subject_template ?? "",
            email_header_html: data.settings.email_header_html ?? "",
            email_footer_html: data.settings.email_footer_html ?? "",
          }));
        }
      });

    // Fetch subscriber count
    fetch("/api/admin/mail/subscribers")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.count !== undefined) setSubscriberCount(data.count);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/admin/mail/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: "success", text: "Settings saved." });
        // Clear password field after save
        setSettings((prev) => ({ ...prev, smtp_pass: "" }));
      } else {
        setStatusMsg({ type: "error", text: data.error || "Failed to save." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Network error." });
    }
    setSaving(false);
  };

  const handleTestEmail = async () => {
    setTesting(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/admin/mail/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: settings.smtp_from_address }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: "success", text: `Test email sent to ${data.to}.` });
      } else {
        setStatusMsg({ type: "error", text: data.error || "Failed to send test email." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Network error." });
    }
    setTesting(false);
  };

  const stats = [
    { label: "文章總數", value: "0", icon: Newspaper },
    { label: "工具總數", value: "0", icon: Wrench },
    { label: "教學總數", value: "0", icon: GraduationCap },
    { label: "本月瀏覽", value: "—", icon: Eye },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
        歡迎返嚟。呢度將顯示網站嘅整體狀態。
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800/70 dark:bg-ink-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
                {s.label}
              </span>
              <s.icon className="h-4 w-4 text-ink-400 dark:text-ink-500" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Mail Settings */}
      <div className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-ink-600 dark:text-ink-400" />
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Mail Settings
          </h2>
          {subscriberCount !== null && (
            <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-600 dark:bg-ink-800 dark:text-ink-400">
              {subscriberCount} subscriber{subscriberCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-2xl border border-ink-200/70 bg-white p-6 dark:border-ink-800/70 dark:bg-ink-900">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              SMTP
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">
                  Host
                </label>
                <input
                  type="text"
                  value={settings.smtp_host}
                  onChange={(e) => setSettings((p) => ({ ...p, smtp_host: e.target.value }))}
                  placeholder="smtp.example.com"
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">
                  Port
                </label>
                <input
                  type="number"
                  value={settings.smtp_port}
                  onChange={(e) => setSettings((p) => ({ ...p, smtp_port: parseInt(e.target.value) || 587 }))}
                  placeholder="587"
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">
                  User
                </label>
                <input
                  type="text"
                  value={settings.smtp_user}
                  onChange={(e) => setSettings((p) => ({ ...p, smtp_user: e.target.value }))}
                  placeholder="user@example.com"
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">
                  Password <span className="text-xs text-ink-400">(leave empty to keep existing)</span>
                </label>
                <input
                  type="password"
                  value={settings.smtp_pass}
                  onChange={(e) => setSettings((p) => ({ ...p, smtp_pass: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">
                  To Address
                </label>
                <input
                  type="email"
                  value={settings.smtp_from_address}
                  onChange={(e) => setSettings((p) => ({ ...p, smtp_from_address: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">
                  From Name
                </label>
                <input
                  type="text"
                  value={settings.smtp_from_name}
                  onChange={(e) => setSettings((p) => ({ ...p, smtp_from_name: e.target.value }))}
                  placeholder="AI Radar"
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50"
                />
                <p className="mt-1 text-xs text-ink-400">Name shown in email From header</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-200/70 bg-white p-6 dark:border-ink-800/70 dark:bg-ink-900">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Daily Digest Schedule
            </h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="daily_enabled"
                  checked={settings.daily_enabled}
                  onChange={(e) => setSettings((p) => ({ ...p, daily_enabled: e.target.checked }))}
                  className="h-4 w-4 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="daily_enabled" className="text-sm font-medium text-ink-700 dark:text-ink-300">
                  Enabled
                </label>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">
                  Hour (0–23)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={settings.daily_hour}
                  onChange={(e) => setSettings((p) => ({ ...p, daily_hour: parseInt(e.target.value) || 0 }))}
                  className="w-20 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">
                  Timezone
                </label>
                <select
                  value={settings.daily_timezone}
                  onChange={(e) => setSettings((p) => ({ ...p, daily_timezone: e.target.value }))}
                  className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-200/70 bg-white p-6 dark:border-ink-800/70 dark:bg-ink-900">
            <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Email Template
            </h3>
            <button
              onClick={() => {
                const html = buildDigestHtml({
                  headerHtml: settings.email_header_html,
                  footerHtml: settings.email_footer_html,
                  articles: [{
                    title: "Sample Article",
                    excerpt: "This is a sample article excerpt for preview purposes.",
                    url: "#",
                    published_at: new Date().toISOString(),
                  }],
                });
                setPreviewHtml(html);
                setShowPreview(true);
              }}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Preview
            </button>
          </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">
                  Subject Template
                </label>
                <input
                  type="text"
                  value={settings.email_subject_template}
                  onChange={(e) => setSettings((p) => ({ ...p, email_subject_template: e.target.value }))}
                  placeholder="AI Radar Daily — {{date}}"
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">
                  Header HTML
                </label>
                <textarea
                  value={settings.email_header_html}
                  onChange={(e) => setSettings((p) => ({ ...p, email_header_html: e.target.value }))}
                  rows={4}
                  placeholder="<h1>Welcome to AI Radar</h1>"
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">
                  Footer HTML
                </label>
                <textarea
                  value={settings.email_footer_html}
                  onChange={(e) => setSettings((p) => ({ ...p, email_footer_html: e.target.value }))}
                  rows={4}
                  placeholder="<p><a href='{{unsubscribe_url}}'>Unsubscribe</a></p>"
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50"
                />
              </div>
            </div>
          </div>

          {statusMsg && (
            <p className={`text-sm ${statusMsg.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {statusMsg.text}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Save Settings
            </button>
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testing}
              className="flex items-center gap-2 rounded-xl border border-ink-300 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50 disabled:opacity-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Test Email
            </button>
          </div>
        </form>

        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 dark:bg-ink-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Email Preview</h3>
                <button onClick={() => setShowPreview(false)} className="text-ink-500 hover:text-ink-700">✕</button>
              </div>
              <iframe
                srcDoc={previewHtml}
                className="w-full rounded-xl border border-ink-200"
                style={{ height: "500px" }}
                title="Email preview"
              />
            </div>
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-dashed border-ink-300 p-8 text-center text-sm text-ink-500 dark:border-ink-700 dark:text-ink-400">
        Admin CRUD 介面仲未起，下一步用 Supabase Auth + Row Level Security 加入：
        <br />新增 / 編輯 / 刪除文章 + 上傳封面圖 + 工具管理。
      </div>
    </div>
  );
}
