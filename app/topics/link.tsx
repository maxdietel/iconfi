"use client";

import { FC, useEffect, useState } from "react";
import { Topic, TopicSRStats } from "@/lib/supabase/types";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getNumberLeftToLearnTodayByTopic, getStatsByTopic } from "@/lib/supabase/utils";
import { createClient } from "@/lib/supabase/client";

interface TopicLinkProps {
  topic: Topic;
}
export const TopicLink: FC<TopicLinkProps> = ({ topic }) => {
  const [stats, setStats] = useState<TopicSRStats | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error fetching user:", userError);
        throw userError;
      }

      const numLeftToLearn = await getNumberLeftToLearnTodayByTopic(supabase, user, topic.id);
      const stats = await getStatsByTopic(supabase, user, topic.id, numLeftToLearn);
      setStats(stats);
    })();
  }, [topic.id]);

  return (
    <Link key={topic.id} href={`/topics/${topic.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle>{topic.topic}</CardTitle>
          <CardDescription>
            {stats ? `${stats.totalDue} Karten zum Lernen (${stats.total} insgesamt)` : "Lade Kartenübersicht..."}            
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
