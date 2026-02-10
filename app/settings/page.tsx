import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-b-border">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-2 py-2 px-5">
          <Link href="/topics" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ArrowLeft size={16} />
          </Link>
          <h1 className="font-medium">Einstellungen</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-5 py-8">
        <SettingsClient />
      </main>
    </div>
  );
}
