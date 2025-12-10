import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { TopicLink } from "./link";

export default async function TopicsPage() {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getClaims();
  if (authError || !authData?.claims) {
    redirect("/auth/login");
  }

  const { data: topics, error } = await supabase
    .from("topic")
    .select("*");

  if (error) {
    console.error("Error fetching topics:", error);
  }

  return (
    <div className="flex flex-col gap-4">
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
    </div>
  );
}
