import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardRedirectPage() {
  redirect("/admin/agent");
}
