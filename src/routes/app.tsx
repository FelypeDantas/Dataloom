import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import { Dashboard } from "@/components/dataloom/Dashboard";
import { SiteNav } from "@/components/dataloom/Chrome";
import { UploadPanel } from "@/components/dataloom/UploadPanel";
import type { Dataset } from "@/lib/analyzer";

const APP_DESCRIPTION =
  "Envie sua planilha e receba um dashboard inteligente gerado pela IA.";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "App · Dataloom" },
      {
        name: "description",
        content: APP_DESCRIPTION,
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: AppPage,
});

function AppPage() {
  const [dataset, setDataset] = useState<Dataset | null>(null);

  const handleReset = useCallback(() => {
    setDataset(null);
  }, []);

  if (dataset) {
    return (
      <Dashboard
        dataset={dataset}
        onReset={handleReset}
      />
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <SiteNav />

      <UploadPanel onLoaded={setDataset} />
    </main>
  );
}
