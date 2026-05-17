import { NavbarClient } from "./NavbarClient";
import { getUserWithProfile } from "@/lib/auth/server";

/**
 * Server-side Navbar wrapper — fetches current user once on the server,
 * then passes to client component for interactivity.
 */
export async function Navbar() {
  const { user, profile } = await getUserWithProfile();

  const initialUser = user
    ? {
        id: user.id,
        email: user.email ?? "",
        display_name: profile?.display_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
      }
    : null;

  return <NavbarClient initialUser={initialUser} />;
}