"use client";

import { FC } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LearningMaterialPage } from "@/lib/supabase/types";

type RelatedPage = Pick<LearningMaterialPage, "id" | "key_concepts" | "number" | "title" | "description"> & {
  learning_material_topic: {
    id: string;
    learning_material: {
      id: string;
      url: string;
    };
  };
};

interface RelatedPagesCardProps {
  pages: RelatedPage[];
}

export const RelatedPagesCard: FC<RelatedPagesCardProps> = ({ pages }) => {
  if (!pages || pages.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">
          Verwandte Seiten
        </CardTitle>
        <CardDescription>
          Diese Seiten enthalten relevante Informationen zu dieser Frage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {pages.map((page) => {
            const url = `${page.learning_material_topic.learning_material.url}#page=${page.number}`;
            return (
              <a
                key={page.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg border bg-muted/50 hover:bg-muted transition-colors cursor-pointer block"
              >
                <div className="flex flex-col gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{page.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        Seite {page.number}
                      </Badge>
                    </div>
                    {page.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {page.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {page.key_concepts.split(",").map((concept, index) => (
                      <Badge
                        key={`${page.id}-${index}`}
                        variant="secondary"
                        className="text-xs"
                      >
                        {concept.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

