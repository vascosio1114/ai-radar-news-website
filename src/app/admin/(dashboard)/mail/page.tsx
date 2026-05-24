"use client";

import { useEffect, useState } from "react";
import { Mail, Send, Loader2, Mailbox } from "lucide-react";
import { buildDigestHtml } from "@/lib/digest-html";
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
  email_body_template: string;
  skip_empty_digest: boolean;
}

interface DigestPreset {
  id: string;
  name: string;
  description: string | null;
  mode: "manual" | "criteria";
  article_ids: string[];
  criteria: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
}

interface ArticleOption {
  id: string;
  slug: string;
  title: string;
  published_at: string;
  category: string;
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
  email_body_template: "",
  skip_empty_digest: true,
};

export default function AdminMailPage() {
  const [settings, setSettings] = useState<MailSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sendingDigest, setSendingDigest] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "subscribers" | "presets">("settings");

  // Presets state
  const [presets, setPresets] = useState<DigestPreset[]>([]);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<DigestPreset | null>(null);
  const [presetForm, setPresetForm] = useState({ name: "", description: "", mode: "criteria" as "manual" | "criteria", article_ids: [] as string[], criteria: { date_range: "last_7days", limit: 5 }, is_default: false });
  const [allArticles, setAllArticles] = useState<ArticleOption[]>([]);
  const [presetSaving, setPresetSaving] = useState(false);

  // Test send modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testPresetId, setTestPresetId] = useState<string>("");
  const [testArticleIds, setTestArticleIds] = useState<string[]>([]);
  const [testSending, setTestSending] = useState(false);

  useEffect(() => {
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
            email_body_template: data.settings.email_body_template ?? "",
            skip_empty_digest: data.settings.skip_empty_digest ?? true,
          }));
        }
      });
  }, []);

  // Load presets
  useEffect(() => {
    if (activeTab !== "presets") return;
    fetch("/api/admin/mail/presets")
      .then((r) => r.ok ? r.json() : [])
      .then(setPresets);
  }, [activeTab]);

  // Load all articles for preset picker
  useEffect(() => {
    if (activeTab !== "presets") return;
    fetch("/api/admin/articles")
      .then((r) => r.ok ? r.json() : [])
      .then((data: ArticleOption[]) => setAllArticles(data));
  }, [activeTab]);

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

  const handleSendDigest = async () => {
    if (!confirm("Send digest to ALL confirmed subscribers?")) return;
    setSendingDigest(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/admin/mail/send-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: "success", text: `Digest sent to ${data.sent}/${data.total} subscribers.` });
      } else {
        setStatusMsg({ type: "error", text: data.error || data.message || "Failed to send digest." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Network error." });
    }
    setSendingDigest(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Email Admin
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            SMTP 設定、訂閱者管理、每日 Digest 排程
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 border-b border-ink-200 dark:border-ink-700">
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 pb-3 text-sm font-medium ${activeTab === "settings" ? "border-b-2 border-primary-600 text-primary-600" : "text-ink-500 hover:text-ink-700"}`}
        >
          <Mailbox className="h-4 w-4" />
          Settings
        </button>
        <button
          onClick={() => setActiveTab("presets")}
          className={`flex items-center gap-2 pb-3 text-sm font-medium ${activeTab === "presets" ? "border-b-2 border-primary-600 text-primary-600" : "text-ink-500 hover:text-ink-700"}`}
        >
          <Send className="h-4 w-4" />
          Presets
        </button>
        <button
          onClick={() => setActiveTab("subscribers")}
          className={`flex items-center gap-2 pb-3 text-sm font-medium ${activeTab === "subscribers" ? "border-b-2 border-primary-600 text-primary-600" : "text-ink-500 hover:text-ink-700"}`}
        >
          <Send className="h-4 w-4" />
          Subscribers
        </button>
      </div>

      {activeTab === "settings" && (
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
                  From Address
                </label>
                <input
                  type="email"
                  value={settings.smtp_from_address}
                  onChange={(e) => setSettings((p) => ({ ...p, smtp_from_address: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50"
                />
                <p className="mt-1 text-xs text-ink-400">Sender address shown in outgoing emails</p>
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
                type="button"
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
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">
                  Full Email Body Template <span className="text-xs text-ink-400">(optional — overrides default layout)</span>
                </label>
                <textarea
                  value={settings.email_body_template}
                  onChange={(e) => setSettings((p) => ({ ...p, email_body_template: e.target.value }))}
                  rows={6}
                  placeholder={`<!DOCTYPE html>
<html><body>
{{header}}
{{articles}}
{{footer}}
</body></html>`}
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50 font-mono"
                />
                <p className="mt-1 text-xs text-ink-400">
                  Placeholders: {"{{header}}"} {"{{footer}}"} {"{{articles}}"} {"{{date}}"} {"{{unsubscribe_url}}"}
                </p>
              </div>
            </div>
          </div>

          {statusMsg && (
            <p className={`text-sm ${statusMsg.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {statusMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Save Settings
          </button>
        </form>
      )}

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-ink-200/70 bg-white p-6 dark:border-ink-800/70 dark:bg-ink-900">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Send Emails</h3>
          <p className="mt-0.5 text-xs text-ink-500">Test sends to your From address. Digest sends latest articles to all confirmed subscribers.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTestModal(true)}
          disabled={testing}
          className="flex items-center gap-2 rounded-xl border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
        >
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send Test Email
        </button>
        <button
          type="button"
          onClick={handleSendDigest}
          disabled={sendingDigest}
          className="flex items-center gap-2 rounded-xl border border-green-600 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30"
        >
          {sendingDigest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send Digest Now
        </button>
      </div>

      {activeTab === "presets" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Digest Presets</h2>
              <p className="text-sm text-ink-500">Define how articles are selected for each digest send.</p>
            </div>
            <button
              onClick={() => {
                setEditingPreset(null);
                setPresetForm({ name: "", description: "", mode: "criteria", article_ids: [], criteria: { date_range: "last_7days", limit: 5 }, is_default: false });
                setShowPresetModal(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              + Create Preset
            </button>
          </div>

          {presets.length === 0 ? (
            <div className="rounded-2xl border border-ink-200/70 bg-white p-8 text-center text-sm text-ink-500 dark:border-ink-800/70 dark:bg-ink-900">
              No presets yet. Create one to control which articles go into each digest.
            </div>
          ) : (
            <div className="rounded-2xl border border-ink-200/70 bg-white dark:border-ink-800/70 dark:bg-ink-900 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-200 dark:border-ink-700">
                    <th className="px-4 py-3 text-left font-semibold text-ink-500">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-500">Mode</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-500">Config</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-500">Default</th>
                    <th className="px-4 py-3 text-right font-semibold text-ink-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {presets.map((p) => (
                    <tr key={p.id} className="border-b border-ink-100 dark:border-ink-800 last:border-0">
                      <td className="px-4 py-3 font-medium text-ink-700 dark:text-ink-200">{p.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.mode === "manual" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400"}`}>
                          {p.mode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-500">
                        {p.mode === "manual" ? `${p.article_ids.length} articles` : JSON.stringify(p.criteria)}
                      </td>
                      <td className="px-4 py-3">{p.is_default && <span className="text-yellow-500">★</span>}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setEditingPreset(p); setPresetForm({ name: p.name, description: p.description ?? "", mode: p.mode, article_ids: p.article_ids ?? [], criteria: { date_range: (p.criteria?.date_range as string) ?? "last_7days", limit: (p.criteria?.limit as number) ?? 5 }, is_default: p.is_default }); setShowPresetModal(true); }} className="text-xs text-primary-600 hover:text-primary-700">Edit</button>
                          {!p.is_default && <button onClick={() => fetch(`/api/admin/mail/presets/${p.id}`, { method: "POST" }).then(() => fetch("/api/admin/mail/presets").then(r => r.ok ? r.json() : []).then(setPresets))} className="text-xs text-ink-500 hover:text-ink-700">Set default</button>}
                          <button onClick={() => { if (!confirm("Delete this preset?")) return; fetch(`/api/admin/mail/presets/${p.id}`, { method: "DELETE" }).then(() => fetch("/api/admin/mail/presets").then(r => r.ok ? r.json() : []).then(setPresets)); }} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "subscribers" && <MailSubscribers />}

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

      {/* Preset Editor Modal */}
      {showPresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-ink-900 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">{editingPreset ? "Edit Preset" : "Create Preset"}</h3>
              <button onClick={() => setShowPresetModal(false)} className="text-ink-500 hover:text-ink-700">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">Name</label>
                <input type="text" value={presetForm.name} onChange={(e) => setPresetForm((p) => ({ ...p, name: e.target.value }))} placeholder="Weekly AI Digest" className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">Description</label>
                <textarea value={presetForm.description} onChange={(e) => setPresetForm((p) => ({ ...p, description: e.target.value }))} rows={2} placeholder="Optional description..." className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">Mode</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={presetForm.mode === "criteria"} onChange={() => setPresetForm((p) => ({ ...p, mode: "criteria" }))} className="text-primary-600" />
                    Criteria
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={presetForm.mode === "manual"} onChange={() => setPresetForm((p) => ({ ...p, mode: "manual" }))} className="text-primary-600" />
                    Manual Pick
                  </label>
                </div>
              </div>

              {presetForm.mode === "manual" ? (
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">Select Articles</label>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-ink-200 bg-white p-2 dark:border-ink-700 dark:bg-ink-950">
                    {allArticles.length === 0 ? (
                      <p className="p-2 text-xs text-ink-400">Loading articles...</p>
                    ) : allArticles.map((a) => (
                      <label key={a.id} className="flex items-center gap-2 p-1.5 text-sm hover:bg-ink-50 dark:hover:bg-ink-800">
                        <input type="checkbox" checked={presetForm.article_ids.includes(a.id)} onChange={(e) => setPresetForm((p) => ({ ...p, article_ids: e.target.checked ? [...p.article_ids, a.id] : p.article_ids.filter((id) => id !== a.id) }))} className="text-primary-600" />
                        <span className="truncate text-ink-700 dark:text-ink-200">{a.title}</span>
                        <span className="ml-auto text-xs text-ink-400">{new Date(a.published_at).toLocaleDateString()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">Date Range</label>
                    <select value={(presetForm.criteria.date_range as string) ?? "last_7days"} onChange={(e) => setPresetForm((p) => ({ ...p, criteria: { ...p.criteria, date_range: e.target.value } }))} className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50">
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="last_7days">Last 7 days</option>
                      <option value="last_30days">Last 30 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">Max Articles</label>
                    <input type="number" min={1} max={20} value={(presetForm.criteria.limit as number) ?? 5} onChange={(e) => setPresetForm((p) => ({ ...p, criteria: { ...p.criteria, limit: parseInt(e.target.value) || 5 } }))} className="w-24 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50" />
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={presetForm.is_default} onChange={(e) => setPresetForm((p) => ({ ...p, is_default: e.target.checked }))} className="text-primary-600" />
                Set as default preset
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowPresetModal(false)} className="rounded-xl border border-ink-300 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800">Cancel</button>
                <button
                  onClick={async () => {
                    setPresetSaving(true);
                    const url = editingPreset ? `/api/admin/mail/presets/${editingPreset.id}` : "/api/admin/mail/presets";
                    const method = editingPreset ? "PUT" : "POST";
                    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(presetForm) });
                    if (res.ok) {
                      const updated = await fetch("/api/admin/mail/presets").then(r => r.ok ? r.json() : []);
                      setPresets(updated);
                      setShowPresetModal(false);
                    }
                    setPresetSaving(false);
                  }}
                  disabled={presetSaving || !presetForm.name}
                  className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {presetSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editingPreset ? "Update Preset" : "Create Preset"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Send Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-ink-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Send Test Email</h3>
              <button onClick={() => setShowTestModal(false)} className="text-ink-500 hover:text-ink-700">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">Recipient Email</label>
                <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="test@example.com" className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">Preset</label>
                <select value={testPresetId} onChange={(e) => setTestPresetId(e.target.value)} className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-50">
                  <option value="">Default preset</option>
                  {presets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700 dark:text-ink-300">Or select specific articles</label>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-ink-200 bg-white p-2 dark:border-ink-700 dark:bg-ink-950">
                  {allArticles.length === 0 ? (
                    <p className="p-2 text-xs text-ink-400">Loading...</p>
                  ) : allArticles.slice(0, 10).map((a) => (
                    <label key={a.id} className="flex items-center gap-2 p-1.5 text-sm hover:bg-ink-50 dark:hover:bg-ink-800">
                      <input type="checkbox" checked={testArticleIds.includes(a.id)} onChange={(e) => setTestArticleIds(e.target.checked ? [...testArticleIds, a.id] : testArticleIds.filter((id) => id !== a.id))} className="text-primary-600" />
                      <span className="truncate text-ink-700 dark:text-ink-200">{a.title}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowTestModal(false)} className="rounded-xl border border-ink-300 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800">Cancel</button>
                <button
                  onClick={async () => {
                    setTestSending(true);
                    const res = await fetch("/api/admin/mail/send-digest", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        to: testEmail,
                        preset_id: testPresetId || undefined,
                        article_ids: testArticleIds.length > 0 ? testArticleIds : undefined,
                      }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setStatusMsg({ type: "success", text: `Test email sent to ${testEmail}` });
                      setShowTestModal(false);
                    } else {
                      setStatusMsg({ type: "error", text: data.error || "Failed to send" });
                    }
                    setTestSending(false);
                  }}
                  disabled={testSending || !testEmail}
                  className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {testSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}