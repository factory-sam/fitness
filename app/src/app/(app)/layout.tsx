import { Nav } from "../../components/ui/nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex min-h-screen">
        <Nav />
        <main className="flex-1 overflow-auto pb-8">{children}</main>
      </div>
      <div className="status-bar fixed bottom-0 left-0 right-0 z-50">
        <span>VITRUVIAN v0.1.0</span>
        <span>RECOMP I — Block 1 — Week 1</span>
        <span className="text-gold">●</span>
      </div>
    </>
  );
}
