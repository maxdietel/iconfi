"use client";

import { FC } from "react";
import { useFlashcards } from "./hooks";
import { Card } from "@/components/ui/card";

export const Stats: FC = () => {
  const { flashcardsData } = useFlashcards();
  const { stats } = flashcardsData;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Total</div>
        <div className="text-2xl font-semibold">{stats.total}</div>
      </Card>
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">New</div>
        <div className="text-2xl font-semibold">{stats.new}</div>
      </Card>
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Learning</div>
        <div className="text-2xl font-semibold">{stats.learning}</div>
      </Card>
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Review</div>
        <div className="text-2xl font-semibold">{stats.review}</div>
      </Card>
    </div>
  );
};

