import { Nav } from "../../components/ui/nav";
import { ChatProvider } from "../../components/chat/chat-provider";
import { ChatSidebar } from "../../components/chat/chat-sidebar";
import { StatusBar } from "../../components/ui/status-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <div className="flex min-h-screen">
        <Nav />
        <main className="flex-1 overflow-auto pb-8">{children}</main>
        <ChatSidebar />
      </div>
      <StatusBar />
    </ChatProvider>
  );
}
