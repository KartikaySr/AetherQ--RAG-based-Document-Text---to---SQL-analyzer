import { type ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";

export const metadata = {
  title: "Workspace | AetherQ",
};

import { GlobalCopilot } from "@/components/ui/GlobalCopilot";
import { ConciergeWelcome } from "@/components/ui/ConciergeWelcome";

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#020F08] via-black to-[#051F11] animate-gradient-shift">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-transparent relative">
        {children}
      </main>
      <GlobalCopilot />
      <ConciergeWelcome />
    </div>
  );
}
