"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

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

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 rounded bg-ink-200 dark:bg-ink-700" />
        <div className="h-64 rounded bg-ink-200 dark:bg-ink-700" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">User 管理</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          管理所有註冊用戶及 admin 權限
        </p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 p-12 text-center dark:border-ink-700">
          <p className="text-ink-500 dark:text-ink-400">暫時沒有任何用戶</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-ink-200 dark:border-ink-800">
          <table className="w-full">
            <thead className="border-b border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  創建時間
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  上次登入
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Admin
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-ink-50 dark:hover:bg-ink-900/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-900 dark:text-ink-50">
                      {user.email}
                    </div>
                    <div className="text-xs text-ink-500">{user.id}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-400">
                    {new Date(user.created_at).toLocaleDateString("zh-HK", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-400">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString("zh-HK", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.is_admin
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"
                      }`}
                    >
                      {user.is_admin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleAdmin(user)}
                        disabled={updatingId === user.id}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-100 disabled:opacity-50 dark:text-ink-300 dark:hover:bg-ink-800"
                        title={user.is_admin ? "移除 Admin 權限" : "授予 Admin 權限"}
                      >
                        {updatingId === user.id
                          ? "更新中..."
                          : user.is_admin
                          ? "移除 Admin"
                          : "設為 Admin"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}