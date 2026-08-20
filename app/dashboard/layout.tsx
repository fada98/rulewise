import { DashboardShell } from "../../components/dashboard-shell";
import { redirect } from "next/navigation";
import { getAccount } from "../../lib/account";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
export const metadata = { title: "Workspace", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) { const user = await requireChatGPTUser("/dashboard"); const account = await getAccount(user.userId); if (!account) redirect("/signin"); return <DashboardShell account={account} signOutPath={chatGPTSignOutPath("/")}>{children}</DashboardShell>; }
