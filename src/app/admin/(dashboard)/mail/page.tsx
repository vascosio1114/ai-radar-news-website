"use client";

import { useEffect, useState } from "react";
import {
  Mail, Send, Settings2, Users, Clock, FileText,
  CheckCircle, XCircle, AlertCircle, Loader2,
  ChevronRight, Globe, Timer, UserCheck
} from "lucide-react";
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
}

const TIMEZONES = [
  "Asia/Hong_Kong", "Asia/Shanghai", "Asia/Singapore",
  "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Paris",
];

const DEFAULT_SETTINGS: MailSettings = {
  smtp_host: "", smtp_port: 587, smtp_user: "", smtp_pass: "",
  smtp_from_address: "", smtp_from_name: "",
  daily_enabled: false, daily_hour: 9, daily_timezone: "Asia/Hong_Kong",
  email_subject_template: "", email_header_html: "", email_footer_html: "",
};

type Tab = "smtp" | "schedule" | "template" | "subscribers" | "send-article" | "weekly-summary";

interface ArticleSearchResult {
  id: string;
  title: string;
  slug: string;
}

export default function AdminMailPage() {
  const [settings, setSettings] = useState<MailSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<Tab>("smtp");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sendingDigest, setSendingDigest] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  // Article send state
  const [selectedArticle, setSelectedArticle] = useState<ArticleSearchResult | null>(null);
  const [articleSearch, setArticleSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ArticleSearchResult[]>([]);
  const [sendingArticle, setSendingArticle] = useState(false);

  // Weekly summary state
  const [weeklyArticles, setWeeklyArticles] = useState<ArticleSearchResult[]>([]);
  const [weeklySearch, setWeeklySearch] = useState("");
  const [weeklySearchResults, setWeeklySearchResults] = useState<ArticleSearchResult[]>([]);
  const [sendingWeekly, setSendingWeekly] = useState(false);

  useEffect(() => {
    fetch("/api/admin/mail/settings")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.settings) {
          const s = data.settings;
          setSettings({
            smtp_host: s.smtp_host ?? "",
            smtp_port: s.smtp_port ?? 587,
            smtp_user: s.smtp_user ?? "",
            smtp_pass: "",
            smtp_from_address: s.smtp_from_address ?? "",
            smtp_from_name: s.smtp_from_name ?? "",
            daily_enabled: s.daily_enabled ?? false,
            daily_hour: s.daily_hour ?? 9,
            daily_timezone: s.daily_timezone ?? "Asia/Hong_Kong",
            email_subject_template: s.email_subject_template ?? "",
            email_header_html: s.email_header_html ?? "",
            email_footer_html: s.email_footer_html ?? "",
          });
        }
      });

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
        setStatusMsg({ type: "success", text: "儲存成功" });
        setSettings((p) => ({ ...p, smtp_pass: "" }));
      } else {
        setStatusMsg({ type: "error", text: data.error || "儲存失敗" });
      }
    } catch {
      setStatusMsg({ type: "error", text: "網絡錯誤" });
    }
    setSaving(false);
  };

  const handleTestEmail = async () => {
    setTesting(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/admin/mail/send-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_preview: true }),
      });
      const previewData = await res.json();
      if (previewData.html) {
        setPreviewHtml(previewData.html);
        setShowPreview(true);
      }
    } catch {
      setStatusMsg({ type: "error", text: "網絡錯誤" });
    }
    setTesting(false);
  };

  const handleSendDigest = async () => {
    if (!confirm("確定要發送每日精選到所有確認訂閱者？")) return;
    setSendingDigest(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/admin/mail/send-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: "success", text: `已發送給 ${data.sent}/${data.total} 位訂閱者` });
      } else {
        setStatusMsg({ type: "error", text: data.error || "發送失敗" });
      }
    } catch {
      setStatusMsg({ type: "error", text: "網絡錯誤" });
    }
    setSendingDigest(false);
  };

  const handleArticleSearch = async (query: string) => {
    setArticleSearch(query);
    if (query.length < 2) { setSearchResults([]); return; }
    const res = await fetch(`/api/admin/articles?search=${encodeURIComponent(query)}&limit=5`);
    const data = await res.json();
    setSearchResults(data.articles ?? []);
  };

  const handleSendArticle = async () => {
    if (!selectedArticle) return;
    if (!confirm(`確定發送「${selectedArticle.title}」給所有訂閱者？`)) return;
    setSendingArticle(true);
    setStatusMsg(null);
    const res = await fetch("/api/admin/mail/send-article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_id: selectedArticle.id }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatusMsg({ type: "success", text: `已發送給 ${data.sent}/${data.total} 位訂閱者` });
    } else {
      setStatusMsg({ type: "error", text: data.error || "發送失敗" });
    }
    setSendingArticle(false);
  };

  const handleWeeklySearch = async (query: string) => {
    setWeeklySearch(query);
    if (query.length < 2) { setWeeklySearchResults([]); return; }
    const res = await fetch(`/api/admin/articles?search=${encodeURIComponent(query)}&limit=5`);
    const data = await res.json();
    setWeeklySearchResults(data.articles ?? []);
  };

  const addToWeekly = (article: ArticleSearchResult) => {
    if (weeklyArticles.find((a) => a.id === article.id)) return;
    setWeeklyArticles((prev) => [...prev, article]);
  };

  const removeFromWeekly = (id: string) => {
    setWeeklyArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSendWeeklySummary = async () => {
    if (weeklyArticles.length === 0) return;
    if (!confirm(`確定發送 ${weeklyArticles.length} 篇文章給所有訂閱者？`)) return;
    setSendingWeekly(true);
    setStatusMsg(null);
    const res = await fetch("/api/admin/mail/send-digest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_ids: weeklyArticles.map((a) => a.id) }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatusMsg({ type: "success", text: `已發送給 ${data.sent}/${data.total} 位訂閱者` });
    } else {
      setStatusMsg({ type: "error", text: data.error || "發送失敗" });
    }
    setSendingWeekly(false);
  };

  const NAV_TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "smtp", label: "SMTP 設定", icon: Globe },
    { id: "schedule", label: "發送時間", icon: Clock },
    { id: "template", label: "郵件範本", icon: FileText },
    { id: "subscribers", label: "訂閱者", icon: Users },
    { id: "send-article", label: "發送文章", icon: Mail },
    { id: "weekly-summary", label: "每週總結", icon: Send },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Email 管理</h1>
            <p className="text-sm text-ink-400">SMTP、發送排程、訂閱者一次搞定</p>
          </div>
        </div>
        {subscriberCount !== null && (
          <div className="flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-2 ring-1 ring-ink-800">
            <Users className="h-4 w-4 text-ink-400" />
            <span className="text-sm font-semibold text-ink-200">{subscriberCount}</span>
            <span className="text-sm text-ink-500">位訂閱者</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 rounded-2xl bg-ink-900 p-1 ring-1 ring-ink-800">
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-blue-500 text-white shadow-blue-500/25 shadow-lg"
                : "text-ink-400 hover:text-ink-100 hover:bg-ink-800"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* SMTP Tab */}
      {activeTab === "smtp" && (
        <form onSubmit={handleSave} className="space-y-5">
          <SectionCard
            title="SMTP 伺服器"
            description="連接你的郵件發送服務"
            icon={<Globe className="h-4 w-4" />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="主機" htmlFor="smtp_host" required>
                <input
                  id="smtp_host"
                  type="text"
                  value={settings.smtp_host}
                  onChange={(e) => setSettings((p) => ({ ...p, smtp_host: e.target.value }))}
                  placeholder="smtp.gmail.com"
                  className="input-field"
                />
              </Field>
              <Field label="連接埠" htmlFor="smtp_port" required>
                <input
                  id="smtp_port"
                  type="number"
                  value={settings.smtp_port}
                  onChange={(e) => setSettings((p) => ({ ...p, smtp_port: parseInt(e.target.value) || 587 }))}
                  placeholder="587"
                  className="input-field"
                />
              </Field>
              <Field label="使用者名稱" htmlFor="smtp_user" required>
                <input
                  id="smtp_user"
                  type="text"
                  value={settings.smtp_user}
                  onChange={(e) => setSettings((p) => ({ ...p, smtp_user: e.target.value }))}
                  placeholder="your@email.com"
                  className="input-field"
                />
              </Field>
              <Field label="密碼" htmlFor="smtp_pass">
                <input
                  id="smtp_pass"
                  type="password"
                  value={settings.smtp_pass}
                  onChange={(e) => setSettings((p) => ({ ...p, smtp_pass: e.target.value }))}
                  placeholder="留空以保持現有密碼"
                  className="input-field"
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            title="發件人資訊"
            description="訂閱者看到的寄件者名稱和地址"
            icon={<UserCheck className="h-4 w-4" />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="發件地址" htmlFor="smtp_from_address" required>
                <input
                  id="smtp_from_address"
                  type="email"
                  value={settings.smtp_from_address}
                  onChange={(e) => setSettings((p) => ({ ...p, smtp_from_address: e.target.value }))}
                  placeholder="newsletter@yourdomain.com"
                  className="input-field"
                />
                <Field.Hint>訂閱者會看到的寄件人地址</Field.Hint>
              </Field>
              <Field label="發件人名稱" htmlFor="smtp_from_name" required>
                <input
                  id="smtp_from_name"
                  type="text"
                  value={settings.smtp_from_name}
                  onChange={(e) => setSettings((p) => ({ ...p, smtp_from_name: e.target.value }))}
                  placeholder="AI Radar 每日精選"
                  className="input-field"
                />
                <Field.Hint>訂閱者會看到的寄件人名稱</Field.Hint>
              </Field>
            </div>
          </SectionCard>

          <SaveBar statusMsg={statusMsg} saving={saving} onSave={handleSave} />
        </form>
      )}

      {/* Schedule Tab */}
      {activeTab === "schedule" && (
        <form onSubmit={handleSave} className="space-y-5">
          <SectionCard
            title="自動發送設定"
            description="設定每日自動發送精選的時間"
            icon={<Clock className="h-4 w-4" />}
          >
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.daily_enabled}
                    onChange={(e) => setSettings((p) => ({ ...p, daily_enabled: e.target.checked }))}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-ink-700 transition peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-500/50" />
                  <div className="peer-checked:translate-x-5 absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                  <span className="text-sm font-medium text-ink-300">
                    {settings.daily_enabled ? "已啟用" : "已停用"}
                  </span>
                </label>
              </div>
              <Field label="發送時間" htmlFor="daily_hour">
                <div className="flex items-center gap-2">
                  <input
                    id="daily_hour"
                    type="number"
                    min={0}
                    max={23}
                    value={settings.daily_hour}
                    onChange={(e) => setSettings((p) => ({ ...p, daily_hour: parseInt(e.target.value) || 0 }))}
                    className="input-field w-20"
                  />
                  <span className="text-sm text-ink-500">:00</span>
                </div>
              </Field>
              <Field label="時區" htmlFor="daily_timezone">
                <select
                  id="daily_timezone"
                  value={settings.daily_timezone}
                  onChange={(e) => setSettings((p) => ({ ...p, daily_timezone: e.target.value }))}
                  className="input-field min-w-[180px]"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </Field>
            </div>
          </SectionCard>

          <SaveBar statusMsg={statusMsg} saving={saving} onSave={handleSave} />
        </form>
      )}

      {/* Template Tab */}
      {activeTab === "template" && (
        <form onSubmit={handleSave} className="space-y-5">
          <SectionCard
            title="郵件範本"
            description="自訂郵件抬頭、頁尾和主旨"
            icon={<FileText className="h-4 w-4" />}
          >
            <div className="space-y-4">
              <Field label="主旨範本" htmlFor="email_subject_template">
                <input
                  id="email_subject_template"
                  type="text"
                  value={settings.email_subject_template}
                  onChange={(e) => setSettings((p) => ({ ...p, email_subject_template: e.target.value }))}
                  placeholder="AI Radar 每日精選 — {{date}}"
                  className="input-field"
                />
                <Field.Hint>可用 &#123;&#123;date&#125;&#125; 插入日期</Field.Hint>
              </Field>
              <Field label="抬頭 HTML" htmlFor="email_header_html">
                <textarea
                  id="email_header_html"
                  value={settings.email_header_html}
                  onChange={(e) => setSettings((p) => ({ ...p, email_header_html: e.target.value }))}
                  rows={4}
                  placeholder="<h1>Welcome to AI Radar</h1>"
                  className="input-field font-mono text-xs"
                />
              </Field>
              <Field label="頁尾 HTML" htmlFor="email_footer_html">
                <textarea
                  id="email_footer_html"
                  value={settings.email_footer_html}
                  onChange={(e) => setSettings((p) => ({ ...p, email_footer_html: e.target.value }))}
                  rows={4}
                  placeholder="<p><a href='{{unsubscribe_url}}'>取消訂閱</a></p>"
                  className="input-field font-mono text-xs"
                />
                <Field.Hint>可用 &#123;&#123;unsubscribe_url&#125;&#125; 插入取消訂閱連結</Field.Hint>
              </Field>

              <button
                type="button"
                onClick={() => {
                  const html = buildDigestHtml({
                    headerHtml: settings.email_header_html,
                    footerHtml: settings.email_footer_html,
                    articles: [{
                      title: "測試文章標題",
                      excerpt: "這是一篇測試文章，用於預覽郵件範本的效果。",
                      url: "#",
                      published_at: new Date().toISOString(),
                    }],
                  });
                  setPreviewHtml(html);
                  setShowPreview(true);
                }}
                className="flex items-center gap-2 rounded-xl border border-ink-700 px-4 py-2 text-sm text-ink-300 hover:bg-ink-800 transition"
              >
                <FileText className="h-4 w-4" />
                預覽郵件
              </button>
            </div>
          </SectionCard>

          <SaveBar statusMsg={statusMsg} saving={saving} onSave={handleSave} />
        </form>
      )}

      {/* Subscribers Tab */}
      {activeTab === "subscribers" && <MailSubscribers />}

      {/* Send Article Tab */}
      {activeTab === "send-article" && (
        <SectionCard
          title="發送單篇文章"
          description="選擇一篇文章發送給所有訂閱者"
          icon={<Mail className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <Field label="搜尋文章" htmlFor="article-search">
              <input
                id="article-search"
                type="text"
                value={articleSearch}
                onChange={(e) => handleArticleSearch(e.target.value)}
                placeholder="輸入文章標題搜尋..."
                className="input-field"
              />
            </Field>
            {searchResults.length > 0 && (
              <ul className="rounded-xl border border-ink-700 divide-y divide-ink-700 overflow-hidden">
                {searchResults.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => { setSelectedArticle(a); setSearchResults([]); setArticleSearch(""); }}
                      className="w-full text-left px-4 py-3 text-sm text-ink-200 hover:bg-ink-800 transition"
                    >
                      {a.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedArticle && (
              <div className="flex items-center justify-between rounded-xl bg-ink-800 px-4 py-3">
                <span className="text-sm font-medium text-ink-100">{selectedArticle.title}</span>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="text-xs text-ink-400 hover:text-red-400"
                >
                  移除
                </button>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={async () => {
                  if (!selectedArticle) return;
                  const res = await fetch("/api/admin/mail/send-article", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ article_id: selectedArticle.id, is_preview: true }),
                  });
                  const data = await res.json();
                  if (data.html) { setPreviewHtml(data.html); setShowPreview(true); }
                }}
                disabled={!selectedArticle}
                className="flex items-center gap-2 rounded-xl border border-ink-700 px-4 py-2 text-sm text-ink-300 hover:bg-ink-800 disabled:opacity-50"
              >
                <FileText className="h-4 w-4" /> 預覽
              </button>
              <button
                type="button"
                onClick={handleSendArticle}
                disabled={!selectedArticle || sendingArticle}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {sendingArticle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                發送給所有訂閱者
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Weekly Summary Tab */}
      {activeTab === "weekly-summary" && (
        <SectionCard
          title="每週總結"
          description="選擇多篇文章作為每週總結發送"
          icon={<Send className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <Field label="搜尋文章" htmlFor="weekly-search">
              <input
                id="weekly-search"
                type="text"
                value={weeklySearch}
                onChange={(e) => handleWeeklySearch(e.target.value)}
                placeholder="輸入文章標題搜尋..."
                className="input-field"
              />
            </Field>
            {weeklySearchResults.length > 0 && (
              <ul className="rounded-xl border border-ink-700 divide-y divide-ink-700 overflow-hidden">
                {weeklySearchResults.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => { addToWeekly(a); setWeeklySearchResults([]); setWeeklySearch(""); }}
                      className="w-full text-left px-4 py-3 text-sm text-ink-200 hover:bg-ink-800 transition"
                    >
                      + {a.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {weeklyArticles.length > 0 && (
              <div className="space-y-2">
                {weeklyArticles.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl bg-ink-800 px-4 py-2">
                    <span className="text-sm text-ink-200">{a.title}</span>
                    <button
                      type="button"
                      onClick={() => removeFromWeekly(a.id)}
                      className="text-xs text-ink-400 hover:text-red-400"
                    >
                      移除
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSendWeeklySummary}
                disabled={weeklyArticles.length === 0 || sendingWeekly}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {sendingWeekly ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                發送 {weeklyArticles.length} 篇文章給所有訂閱者
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Action Footer */}
      <div className="rounded-2xl border border-ink-800 bg-ink-900/50 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Send className="h-4 w-4 text-ink-400" />
          <h3 className="text-sm font-semibold text-ink-200">手動發送</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleTestEmail}
            disabled={testing}
            className="flex items-center gap-2 rounded-xl border border-ink-700 px-5 py-2.5 text-sm font-medium text-ink-200 hover:bg-ink-800 disabled:opacity-50 transition"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            預覽郵件
          </button>
          <button
            type="button"
            onClick={handleSendDigest}
            disabled={sendingDigest}
            className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 transition shadow-blue-500/25"
          >
            {sendingDigest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            立即發送給所有訂閱者
          </button>
          <span className="text-xs text-ink-500">
            發送最新 5 篇文章到所有已確認訂閱者的郵箱
          </span>
        </div>
        {statusMsg && (
          <div className={`mt-3 flex items-center gap-2 text-sm ${
            statusMsg.type === "success" ? "text-green-400" : "text-red-400"
          }`}>
            {statusMsg.type === "success"
              ? <CheckCircle className="h-4 w-4" />
              : <XCircle className="h-4 w-4" />}
            {statusMsg.text}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-ink-900 mt-10 mb-10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink-200 dark:border-ink-800 px-6 py-4">
              <h3 className="font-semibold text-ink-900 dark:text-ink-100">郵件預覽</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <iframe
              srcDoc={previewHtml}
              className="w-full rounded-b-2xl border-0"
              style={{ height: "600px" }}
              title="Email preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function SectionCard({
  title, description, icon, children,
}: {
  title: string; description: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/50 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-ink-800 bg-ink-900 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ink-100">{title}</h2>
          <p className="text-xs text-ink-500">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({
  label, htmlFor, required, children,
}: {
  label: string; htmlFor: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-300">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

Field.Hint = function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-ink-500">{children}</p>;
};

function SaveBar({
  statusMsg, saving, onSave,
}: {
  statusMsg: { type: "success" | "error"; text: string } | null;
  saving: boolean;
  onSave: (e: React.FormEvent) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="submit"
        disabled={saving}
        onClick={onSave}
        className="flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 transition shadow-blue-500/25"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
        儲存設定
      </button>
      {statusMsg && (
        <span className={`text-sm ${statusMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {statusMsg.type === "success" ? <CheckCircle className="inline h-4 w-4 mr-1" /> : <XCircle className="inline h-4 w-4 mr-1" />}
          {statusMsg.text}
        </span>
      )}
    </div>
  );
}