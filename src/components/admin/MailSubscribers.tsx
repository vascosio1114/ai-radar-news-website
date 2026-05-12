"use client";
import { useEffect, useState } from "react";
import { Loader2, Trash2, UserPlus, Mail } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  opted_in: boolean;
  is_confirmed: boolean;
  subscribed_at: string;
}

export function MailSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    setLoading(true);
    const r = await fetch("/api/admin/mail/subscribers");
    if (r.ok) {
      const data = await r.json();
      setSubscribers(data.subscribers || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this subscriber?")) return;
    const r = await fetch(`/api/admin/mail/subscribers/${id}`, { method: "DELETE" });
    if (r.ok) fetchSubscribers();
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.includes("@")) return;
    setAdding(true);
    const r = await fetch("/api/admin/mail/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail }),
    });
    if (r.ok) {
      setNewEmail("");
      setShowAdd(false);
      fetchSubscribers();
    }
    setAdding(false);
  }

  async function handleToggleConfirm(sub: Subscriber) {
    const r = await fetch(`/api/admin/mail/subscribers/${sub.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_confirmed: !sub.is_confirmed }),
    });
    if (r.ok) fetchSubscribers();
  }

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">{subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}</p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          <UserPlus className="h-4 w-4" /> Add
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@example.com"
            className="flex-1 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-950"
          />
          <button type="submit" disabled={adding} className="rounded-xl bg-primary-600 px-4 py-2 text-sm text-white disabled:opacity-50">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </button>
        </form>
      )}

      {subscribers.length === 0 ? (
        <p className="text-sm text-ink-400">No subscribers yet.</p>
      ) : (
        <div className="space-y-2">
          {subscribers.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between rounded-xl border border-ink-200 bg-white px-4 py-3 dark:border-ink-800 dark:bg-ink-900">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{sub.email}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${sub.is_confirmed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {sub.is_confirmed ? "Confirmed" : "Pending"}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${sub.opted_in ? "bg-blue-100 text-blue-700" : "bg-ink-100 text-ink-500"}`}>
                    {sub.opted_in ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleToggleConfirm(sub)}
                  className="text-xs text-ink-500 hover:text-ink-700"
                  title={sub.is_confirmed ? "Revoke confirmation" : "Confirm manually"}
                >
                  <Mail className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(sub.id)}
                  className="text-rose-400 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}