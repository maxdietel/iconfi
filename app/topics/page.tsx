import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { TopicLink } from "./link";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import Image from "next/image";

export default async function TopicsPage() {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getClaims();
  if (authError || !authData?.claims) {
    redirect("/auth/login");
  }

  const { data: topics, error } = await supabase
    .from("topic")
    .select("*")
    .eq("disabled", false);

  if (error) {
    console.error("Error fetching topics:", error);
  }

  return (
    <>
      <header className="border-b border-b-border">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center py-2 px-5">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="iConFi Logo"
              width={64}
              height={64}
              className="object-contain"
              />
          </Link>

          <AuthButton />
        </div>
      </header>

      <main className="flex grow flex-col max-w-5xl mx-auto w-full px-5 py-12 gap-4">
        <div className="flex flex-col">
          <h1 className="font-bold text-3xl mb-2">Alle Themen</h1>
          <p className="text-muted-foreground">
            Wähle zwischen allen verfügbaren Themen für die Prüfungsvorbereitung.
          </p>
        </div>

        {error ? (
          <div className="bg-destructive/10 text-destructive text-sm p-3 px-5 rounded-md">
            Fehler beim Laden der Themen: {error.message}
          </div>
        ) : topics && topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <TopicLink key={topic.id} topic={topic} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Keine Themen gefunden.
          </div>
        )}
      </main>
    </>
  );
}
