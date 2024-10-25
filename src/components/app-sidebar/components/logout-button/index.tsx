"use client";

import { logout } from "@/actions/auth";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  async function handleLogout() {
    await logout();
  }

  return <span onClick={handleLogout} className="w-full flex items-center gap-2"><LogOut /> Sign out</span>;
}
