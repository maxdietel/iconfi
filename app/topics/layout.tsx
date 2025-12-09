import { AuthButton } from "@/components/auth-button";
import Link from "next/link";

export default function TopicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"}>iCoFi</Link>
          </div>
          <AuthButton />
        </div>
      </nav>

      <div className="flex grow flex-col max-w-5xl mx-auto w-full px-5 py-12">
        {children}
      </div>
    </main>
  );
}

