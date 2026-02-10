"use client";

import { useColorblindMode } from "@/components/colorblind-mode-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsClient() {
  const { isColorblindMode, setColorblindMode, mounted } = useColorblindMode();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Barrierefreiheit</CardTitle>
        <CardDescription>
          Passe die Darstellung von Antwort-Feedback an.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <div className="font-medium">Farbblindmodus</div>
          <div className="text-sm text-muted-foreground">
            Zeigt zusaetzlich Symbole und Text für richtig/falsch an.
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          aria-pressed={isColorblindMode}
          onClick={() => setColorblindMode(!isColorblindMode)}
          disabled={!mounted}
        >
          {isColorblindMode ? "Aktiviert" : "Deaktiviert"}
        </Button>
      </CardContent>
    </Card>
  );
}
