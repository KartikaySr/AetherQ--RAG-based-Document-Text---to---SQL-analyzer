import { type ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";

export const metadata = {
  title: "Workspace | AetherQ",
};

import { GlobalCopilot } from "@/components/ui/GlobalCopilot";

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-transparent relative">
        {children}
      </main>
      <GlobalCopilot />
    </div>
  );
}
