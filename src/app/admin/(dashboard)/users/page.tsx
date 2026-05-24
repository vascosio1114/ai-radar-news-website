"use client";

import { useEffect, useState } from "react";
import { Shield, ShieldCheck, User, Loader2, Search, Crown } from "lucide-react";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const { users } = await res.json();
      setUsers(users as User[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (user: User) => {
    setUpdatingId(user.id);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_admin: !user.is_admin }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_admin: !user.is_admin } : u
        )
      );
    }
    setUpdatingId(null);
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = users.filter((u) => u.is_admin).length;
  const userCount = users.filter((u) => !u.is_admin).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-accent-500/20 border-t-accent-500 animate-spin" />
            <Loader2 className="absolute inset-0 m-auto h-5 w-5 animate-spin text-accent-500" />
          </div>
          <p className="text-sm text-ink-500 dark:text-ink-400">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-ink-200/50 bg-white/80 dark:border-ink-800/50 dark:bg-ink-950/80 p-8 backdrop-blur-xl">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-primary-600 text-white shadow-lg shadow-accent-500/25">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-ink-950 dark:text-white">
                User 管理
              </h1>
              <p className="text-sm text-ink-500 dark:text-ink-400">
                管理所有註冊用戶及 admin 權限
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent-500" />
              <span className="text-sm text-ink-600 dark:text-ink-400">
                <span className="font-semibold text-ink-950 dark:text-white">{userCount}</span> 位用戶
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary-500" />
              <span className="text-sm text-ink-600 dark:text-ink-400">
                <span className="font-semibold text-ink-950 dark:text-white">{adminCount}</span> 位管理員
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
        <input
          type="text"
          placeholder="搜尋用戶 email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-ink-200/70 bg-white/80 py-3 pl-12 pr-4 text-sm backdrop-blur-xl transition focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-ink-800/70 dark:bg-ink-950/80 dark:text-ink-50 dark:placeholder:text-ink-500"
        />
      </div>

      {/* User Grid */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink-300 py-16 text-center dark:border-ink-700">
          <User className="mx-auto h-12 w-12 text-ink-300 dark:text-ink-600" />
          <p className="mt-4 text-ink-500 dark:text-ink-400">
            {searchQuery ? "找不到符合的用戶" : "暫時沒有任何用戶"}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredUsers.map((user, i) => (
            <div
              key={user.id}
              className="group relative overflow-hidden rounded-2xl border border-ink-200/60 bg-white/70 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-500/30 hover:shadow-lg hover:shadow-accent-500/5 dark:border-ink-800/60 dark:bg-ink-950/70 dark:hover:border-accent-500/40"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center gap-4 p-5">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${
                    user.is_admin
                      ? "bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/25"
                      : "bg-ink-100 dark:bg-ink-800"
                  }`}>
                    {user.is_admin ? (
                      <ShieldCheck className="h-6 w-6 text-white" />
                    ) : (
                      <User className="h-5 w-5 text-ink-500 dark:text-ink-400" />
                    )}
                  </div>
                  {user.is_admin && (
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                      <Crown className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium truncate ${
                      user.is_admin ? "text-ink-950 dark:text-white" : "text-ink-700 dark:text-ink-300"
                    }`}>
                      {user.email}
                    </p>
                    {user.is_admin && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-ink-500 dark:text-ink-400">
                      創建於 {new Date(user.created_at).toLocaleDateString("zh-HK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {user.last_sign_in_at && (
                      <>
                        <span className="text-ink-300 dark:text-ink-600">·</span>
                        <span className="text-xs text-ink-500 dark:text-ink-400">
                          上次登入 {new Date(user.last_sign_in_at).toLocaleDateString("zh-HK", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleToggleAdmin(user)}
                    disabled={updatingId === user.id}
                    className={`relative overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                      user.is_admin
                        ? "bg-ink-100 text-ink-600 hover:bg-red-50 hover:text-red-600 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                        : "bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg`}
                  >
                    {updatingId === user.id ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        處理中...
                      </span>
                    ) : user.is_admin ? (
                      "移除 Admin"
                    ) : (
                      "設為 Admin"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}