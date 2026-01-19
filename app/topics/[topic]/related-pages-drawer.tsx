"use client";

import { FC } from "react";
import { LearningMaterialPage } from "@/lib/supabase/types";
import { Database } from "@/lib/supabase/database.types";
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type ExternalResource = Pick<Database["public"]["Tables"]["learning_material_external_resource"]["Row"], "id" | "description" | "type" | "url">;

type RelatedPage = Pick<LearningMaterialPage, "id" | "key_concepts" | "number" | "title" | "description"> & {
  learning_material_topic: {
    id: string;
    learning_material: {
      id: string;
      url: string;
    };
  };
  learning_material_external_resources: ExternalResource[];
};

interface RelatedPagesDrawerContentProps {
  explanation: string;
  pages: RelatedPage[];
}

export const RelatedPagesDrawerContent: FC<RelatedPagesDrawerContentProps> = ({ explanation, pages }) => {
  if (!pages || pages.length === 0) {
    return (
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Verwandte Seiten</DrawerTitle>
          <DrawerDescription>
            Keine verwandten Seiten verfügbar
          </DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    );
  }

  return (
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Erklärung & Verwandte Seiten</DrawerTitle>
        <DrawerDescription>
          Hier findest du eine kurze Erklärung sowie weitere Informationen zu dieser Frage.
        </DrawerDescription>
      </DrawerHeader>
      <div className="flex flex-col gap-4 p-4 overflow-y-auto max-h-[90vh]">
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold">Erklärung</h3>
          <p className="text-xs text-muted-foreground text-justify">
            {explanation}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold">Verwandte Seiten</h3>
          <div className="flex flex-col gap-2">
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
                      <h4 className="font-semibold text-sm mb-1">{page.title}</h4>
                      {page.description && (
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {page.description}
                        </p>
                      )}
                    </div>
                    {page.learning_material_external_resources && page.learning_material_external_resources.length > 0 && (
                      <div className="mt-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Externe Ressourcen:
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {page.learning_material_external_resources.map((resource) => (
                            resource.url ? (
                              <button
                                key={resource.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(resource.url!, "_blank", "noopener,noreferrer");
                                }}
                                className="text-xs text-primary hover:underline flex items-center gap-1.5 text-left"
                              >
                                <span>{resource.description}</span>
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </button>
                            ) : (
                              <div
                                key={resource.id}
                                className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-50"
                              >
                                <span>{resource.description}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </DrawerContent>
  );
};
