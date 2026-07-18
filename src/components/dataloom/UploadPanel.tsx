import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileSpreadsheet, Loader2 } from "lucide-react";
import { parseFile, type Dataset } from "@/lib/analyzer";

interface Props {
  onLoaded: (ds: Dataset) => void;
}

const ACCEPTED = ".csv,.tsv,.txt,.xlsx,.xls";

export function UploadPanel({ onLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<{ name: string; size: number } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);

  const handle = useCallback(
    async (file: File) => {
      setError(null);
      setBusy(true);
      setCurrent({ name: file.name, size: file.size });
      let pct = 5;
      setProgress(pct);
      const timer = setInterval(() => {
        pct = Math.min(90, pct + Math.random() * 12);
        setProgress(pct);
      }, 200);
      try {
        const ds = await parseFile(file);
        clearInterval(timer);
        setProgress(100);
        setTimeout(() => onLoaded(ds), 200);
      } catch (e) {
        clearInterval(timer);
        setError((e as Error).message || "Não foi possível ler o arquivo.");
        setBusy(false);
      }
    },
    [onLoaded],
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Passo 1 · Upload
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          Envie sua planilha
        </h1>
        <p className="mt-3 text-muted-foreground">
          Suportamos CSV, TSV, XLSX e XLS. O processamento acontece no seu
          navegador.
        </p>
      </motion.div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handle(f);
        }}
        onClick={() => !busy && inputRef.current?.click()}
        className={`mt-10 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 transition-all ${
          dragging
            ? "border-accent bg-brand-soft"
            : "border-border bg-panel hover:border-accent/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
          }}
        />
        {busy ? (
          <>
            <Loader2 className="size-10 animate-spin text-accent" />
            <p className="mt-4 font-semibold">Analisando planilha…</p>
            {current && (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {current.name} · {(current.size / 1024).toFixed(1)} KB
              </p>
            )}
            <div className="mt-6 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <UploadCloud className="size-10 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">
              Arraste um arquivo aqui ou clique para escolher
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              .csv · .tsv · .xlsx · .xls
            </p>
            <div className="mt-6 rounded-lg bg-foreground px-6 py-2.5 text-sm font-semibold text-background">
              Escolher arquivo
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-panel p-4">
        <FileSpreadsheet className="mt-0.5 size-5 shrink-0 text-accent" />
        <p className="text-sm text-muted-foreground">
          Sem dados para testar? Baixe um exemplo de{" "}
          <a
            className="font-medium text-foreground underline"
            href="https://raw.githubusercontent.com/plotly/datasets/master/tips.csv"
            target="_blank"
            rel="noreferrer"
          >
            planilha de gorjetas
          </a>{" "}
          ou{" "}
          <a
            className="font-medium text-foreground underline"
            href="https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
            target="_blank"
            rel="noreferrer"
          >
            Titanic
          </a>
          .
        </p>
      </div>
    </div>
  );
}
