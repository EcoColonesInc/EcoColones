import AdminNavbar from "@/components/admin/admin-navbar";
import React from "react";

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      <main>{children}</main>
    </div>
  );
}
