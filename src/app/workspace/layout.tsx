import { type ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
export const dynamic = "force-dynamic";
export const metadata = { title: "Workspace" };
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <div className="stack-shell"><Sidebar/><main id="main-content" className="stack-main">{children}</main></div>;
}
