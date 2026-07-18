import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import {
  Sparkles,
  Download,
  RotateCcw,
  Filter as FilterIcon,
  X,
} from "lucide-react";
import {
  aggregate,
  formatNumber,
  formatValue,
  generateInsights,
  histogram,
  kindLabel,
  recommend,
  timeSeries,
  type ChartRecommendation,
  type ColumnStats,
  type Dataset,
} from "@/lib/analyzer";

const PALETTE = [
  "var(--color-accent)",
  "#0e7490",
  "#67e8f9",
  "#155e75",
  "#22d3ee",
  "#164e63",
  "#a5f3fc",
  "#0891b2",
];

interface Props {
  dataset: Dataset;
  onReset: () => void;
}

type FilterState = Record<string, string[]>;

export function Dashboard({ dataset, onReset }: Props) {
  const [filters, setFilters] = useState<FilterState>({});
  const [openFilters, setOpenFilters] = useState(false);

  const filteredRows = useMemo(() => {
    const active = Object.entries(filters).filter(([, v]) => v.length);
    if (!active.length) return dataset.rows;
    return dataset.rows.filter((r) =>
      active.every(([col, vals]) => vals.includes(String(r[col] ?? ""))),
    );
  }, [dataset.rows, filters]);

  const recs = useMemo(() => recommend(dataset), [dataset]);
  const insights = useMemo(
    () => generateInsights({ ...dataset, rows: filteredRows }),
    [dataset, filteredRows],
  );

  const numericCols = dataset.columns.filter((c) =>
    ["number", "integer", "currency", "percentage"].includes(c.kind),
  );
  const catCols = dataset.columns.filter(
    (c) =>
      ["category", "state", "city", "boolean"].includes(c.kind) &&
      c.uniques <= 50,
  );

  const kpiRecs = recs.filter((r) => r.type === "kpi");
  const chartRecs = recs.filter((r) => r.type !== "kpi" && r.type !== "table");

  return (
    <div className="min-h-screen bg-panel">
      {/* Toolbar */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-3">
          <div className="flex min-w-0 items-center gap-4">
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <RotateCcw className="size-3.5" /> Novo arquivo
            </button>
            <div className="h-4 w-px bg-border" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {dataset.fileName}
              </p>
              <p className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {dataset.rows.length.toLocaleString("pt-BR")} registros ·{" "}
                {dataset.columns.length} campos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpenFilters((v) => !v)}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                openFilters
                  ? "border-accent bg-brand-soft text-accent"
                  : "border-border hover:bg-muted"
              }`}
            >
              <FilterIcon className="size-3.5" />
              Filtros{" "}
              {Object.values(filters).flat().length > 0 && (
                <span className="ml-1 rounded bg-accent px-1 font-mono text-[10px] text-accent-foreground">
                  {Object.values(filters).flat().length}
                </span>
              )}
            </button>
            <ExportButton dataset={dataset} rows={filteredRows} />
            <div className="flex h-7 items-center gap-1.5 rounded-full bg-muted px-3">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                IA Ativa
              </span>
            </div>
          </div>
        </div>

        {openFilters && catCols.length > 0 && (
          <div className="border-t border-border bg-panel px-6 py-4">
            <div className="mx-auto flex max-w-[1400px] flex-wrap gap-3">
              {catCols.slice(0, 6).map((c) => (
                <FilterChip
                  key={c.name}
                  column={c}
                  selected={filters[c.name] || []}
                  onChange={(vals) =>
                    setFilters((f) => ({ ...f, [c.name]: vals }))
                  }
                />
              ))}
              {Object.values(filters).some((v) => v.length) && (
                <button
                  onClick={() => setFilters({})}
                  className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" /> Limpar filtros
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              Dashboard Gerado pela IA
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              Análise automática de {dataset.fileName.replace(/\.[^.]+$/, "")}
            </h2>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {filteredRows.length.toLocaleString("pt-BR")} de{" "}
            {dataset.rows.length.toLocaleString("pt-BR")} registros
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-6">
            {/* KPIs */}
            {kpiRecs.length > 0 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {kpiRecs.map((r, i) => {
                  const col = dataset.columns.find((c) => c.name === r.value);
                  if (!col) return null;
                  const values = filteredRows
                    .map((row) => Number(row[col.name]))
                    .filter((n) => Number.isFinite(n));
                  const sum = values.reduce((a, b) => a + b, 0);
                  const avg = values.length ? sum / values.length : 0;
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-xl border border-border bg-background p-5"
                    >
                      <p className="mb-2 truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {col.name}
                      </p>
                      <p className="text-2xl font-bold tracking-tight">
                        {formatValue(sum, col.kind)}
                      </p>
                      <p className="mt-2 font-mono text-[10px] tracking-wide text-muted-foreground">
                        média {formatValue(avg, col.kind)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {chartRecs.map((r, i) => (
                <ChartCard
                  key={r.id}
                  rec={r}
                  rows={filteredRows}
                  columns={dataset.columns}
                  className={
                    r.type === "line" || r.type === "area"
                      ? "md:col-span-2"
                      : ""
                  }
                  delay={i * 0.08}
                />
              ))}
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <div className="rounded-xl border border-border bg-background p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="size-4 text-accent" />
                  <h3 className="font-semibold">Insights automáticos</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {insights.map((ins, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border bg-panel p-4"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                        Insight {String(i + 1).padStart(2, "0")}
                      </p>
                      <p className="mt-2 text-sm font-semibold">{ins.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {ins.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data preview */}
            <DataTable rows={filteredRows} columns={dataset.columns} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="sticky top-32 space-y-4">
              <div className="rounded-2xl bg-foreground p-6 text-background shadow-xl">
                <div className="mb-6 flex items-center gap-2">
                  <span className="size-2 animate-pulse rounded-full bg-accent" />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-widest">
                    Recomendações da IA
                  </h3>
                </div>
                <div className="space-y-6">
                  {recs.slice(0, 5).map((r, i) => (
                    <div key={r.id} className="space-y-1.5">
                      <p className="font-mono text-[10px] text-accent">
                        LOGIC_{String(i + 1).padStart(2, "0")}
                      </p>
                      <p className="text-sm font-semibold">{r.title}</p>
                      <p className="text-xs leading-relaxed text-background/70">
                        {r.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-border p-4">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Resumo dos Dados
                </p>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex justify-between">
                    <span>Registros</span>
                    <span className="font-mono">
                      {dataset.rows.length.toLocaleString("pt-BR")}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Campos</span>
                    <span className="font-mono">{dataset.columns.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Numéricos</span>
                    <span className="font-mono">{numericCols.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Categóricos</span>
                    <span className="font-mono">{catCols.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Nulos</span>
                    <span className="font-mono text-accent">
                      {(
                        (dataset.columns.reduce((a, c) => a + c.nulls, 0) /
                          (dataset.rows.length * dataset.columns.length || 1)) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </li>
                </ul>

                <p className="mt-4 mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Tipos detectados
                </p>
                <ul className="max-h-64 space-y-1 overflow-y-auto pr-1 text-xs">
                  {dataset.columns.map((c) => (
                    <li
                      key={c.name}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate" title={c.name}>
                        {c.name}
                      </span>
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] uppercase text-muted-foreground">
                        {kindLabel(c.kind)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  column,
  selected,
  onChange,
}: {
  column: ColumnStats;
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const values = column.topValues?.map((v) => v.value) || [];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          selected.length
            ? "border-accent bg-brand-soft text-accent"
            : "border-border bg-background hover:bg-muted"
        }`}
      >
        <span>{column.name}</span>
        {selected.length > 0 && (
          <span className="font-mono">({selected.length})</span>
        )}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-72 w-56 overflow-y-auto rounded-lg border border-border bg-background p-2 shadow-lg">
          {values.map((v) => {
            const active = selected.includes(v);
            return (
              <button
                key={v}
                onClick={() =>
                  onChange(
                    active ? selected.filter((x) => x !== v) : [...selected, v],
                  )
                }
                className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs ${
                  active ? "bg-brand-soft text-accent" : "hover:bg-muted"
                }`}
              >
                <span className="truncate">{v}</span>
                {active && <span className="font-mono text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChartCard({
  rec,
  rows,
  columns,
  className = "",
  delay = 0,
}: {
  rec: ChartRecommendation;
  rows: Record<string, unknown>[];
  columns: ColumnStats[];
  className?: string;
  delay?: number;
}) {
  const valueCol = columns.find((c) => c.name === rec.value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`min-w-0 rounded-xl border border-border bg-background p-6 ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{rec.title}</h3>
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {rec.reason}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {rec.type}
        </span>
      </div>
      <div className="h-64 w-full">
        <ChartInner rec={rec} rows={rows} valueCol={valueCol} />
      </div>
    </motion.div>
  );
}

function ChartInner({
  rec,
  rows,
  valueCol,
}: {
  rec: ChartRecommendation;
  rows: Record<string, unknown>[];
  valueCol?: ColumnStats;
}) {
  const tooltipFmt = (v: number) =>
    valueCol ? formatValue(v, valueCol.kind) : formatNumber(v);

  if ((rec.type === "line" || rec.type === "area") && rec.date && rec.value) {
    const data = timeSeries(rows, rec.date, rec.value);
    if (!data.length) return <Empty />;
    if (rec.type === "line") {
      return (
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="var(--color-muted-foreground)"
              fontSize={11}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickFormatter={(v) => formatNumber(v)}
            />
            <Tooltip
              formatter={(v: number) => tooltipFmt(v)}
              contentStyle={tooltipStyle}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-accent)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-accent)" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`grad-${rec.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-accent)"
                stopOpacity={0.4}
              />
              <stop
                offset="100%"
                stopColor="var(--color-accent)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="var(--color-muted-foreground)"
            fontSize={11}
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            fontSize={11}
            tickFormatter={(v) => formatNumber(v)}
          />
          <Tooltip
            formatter={(v: number) => tooltipFmt(v)}
            contentStyle={tooltipStyle}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-accent)"
            strokeWidth={2}
            fill={`url(#grad-${rec.id})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (
    (rec.type === "bar" || rec.type === "topRank") &&
    rec.category &&
    rec.value
  ) {
    let data = aggregate(rows, rec.category, rec.value, "sum");
    if (rec.type === "topRank") data = data.slice(0, 10);
    else data = data.slice(0, 12);
    if (!data.length) return <Empty />;
    const horizontal = rec.type === "topRank";
    return (
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 12, left: horizontal ? 80 : 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            horizontal={!horizontal}
            vertical={horizontal}
          />
          {horizontal ? (
            <>
              <XAxis
                type="number"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickFormatter={(v) => formatNumber(v)}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                width={80}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickFormatter={(v) => formatNumber(v)}
              />
            </>
          )}
          <Tooltip
            formatter={(v: number) => tooltipFmt(v)}
            contentStyle={tooltipStyle}
          />
          <Bar
            dataKey="value"
            fill="var(--color-accent)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (
    (rec.type === "pie" || rec.type === "donut") &&
    rec.category &&
    rec.value
  ) {
    const data = aggregate(rows, rec.category, rec.value, "sum").slice(0, 8);
    if (!data.length) return <Empty />;
    return (
      <ResponsiveContainer>
        <PieChart>
          <Tooltip
            formatter={(v: number) => tooltipFmt(v)}
            contentStyle={tooltipStyle}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={rec.type === "donut" ? 50 : 0}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (rec.type === "distribution" && rec.value) {
    const data = histogram(rows, rec.value, 12);
    if (!data.length) return <Empty />;
    return (
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="var(--color-muted-foreground)"
            fontSize={10}
          />
          <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar
            dataKey="value"
            fill="var(--color-accent)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return <Empty />;
}

const tooltipStyle: React.CSSProperties = {
  background: "var(--color-background)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
};

function Empty() {
  return (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
      Sem dados suficientes
    </div>
  );
}

function DataTable({
  rows,
  columns,
}: {
  rows: Record<string, unknown>[];
  columns: ColumnStats[];
}) {
  const [page, setPage] = useState(0);
  const perPage = 20;
  const paged = rows.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(rows.length / perPage);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-sm font-semibold">Tabela de dados</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded px-2 py-1 hover:bg-muted disabled:opacity-30"
          >
            ←
          </button>
          <span className="font-mono">
            {page + 1} / {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded px-2 py-1 hover:bg-muted disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>
      <div className="max-h-96 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-panel">
            <tr className="border-b border-border text-muted-foreground">
              {columns.map((c) => (
                <th
                  key={c.name}
                  className="whitespace-nowrap px-4 py-2 font-medium"
                >
                  {c.name}
                  <span className="ml-1 font-mono text-[9px] uppercase text-muted-foreground/60">
                    {kindLabel(c.kind)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paged.map((r, i) => (
              <tr key={i} className="hover:bg-muted/40">
                {columns.map((c) => (
                  <td key={c.name} className="whitespace-nowrap px-4 py-2">
                    {String(r[c.name] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExportButton({
  dataset,
  rows,
}: {
  dataset: Dataset;
  rows: Record<string, unknown>[];
}) {
  const [open, setOpen] = useState(false);

  const exportCSV = () => {
    const cols = dataset.columns.map((c) => c.name);
    const header = cols.join(",");
    const body = rows
      .map((r) =>
        cols
          .map((c) => {
            const v = String(r[c] ?? "");
            return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
          })
          .join(","),
      )
      .join("\n");
    download(`${dataset.fileName}.csv`, `${header}\n${body}`, "text/csv");
    setOpen(false);
  };

  const exportJSON = () => {
    download(
      `${dataset.fileName}.json`,
      JSON.stringify(rows, null, 2),
      "application/json",
    );
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
      >
        <Download className="size-3.5" /> Exportar
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-border bg-background p-1 shadow-lg">
          <button
            onClick={exportCSV}
            className="w-full rounded px-3 py-1.5 text-left text-xs hover:bg-muted"
          >
            Exportar CSV
          </button>
          <button
            onClick={exportJSON}
            className="w-full rounded px-3 py-1.5 text-left text-xs hover:bg-muted"
          >
            Exportar JSON
          </button>
          <button
            onClick={() => {
              window.print();
              setOpen(false);
            }}
            className="w-full rounded px-3 py-1.5 text-left text-xs hover:bg-muted"
          >
            Imprimir / PDF
          </button>
        </div>
      )}
    </div>
  );
}

function download(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
