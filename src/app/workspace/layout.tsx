import { type ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";

export const metadata = {
  title: "Workspace | AetherQ",
};

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
