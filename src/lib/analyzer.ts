// Client-side spreadsheet parsing + column type inference + chart recommendations.

import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ColumnKind =
  | "number"
  | "integer"
  | "currency"
  | "percentage"
  | "date"
  | "datetime"
  | "category"
  | "text"
  | "boolean"
  | "email"
  | "phone"
  | "cpf"
  | "cnpj"
  | "cep"
  | "state"
  | "city"
  | "id"
  | "latlon"
  | "url"
  | "empty";

export interface ColumnStats {
  name: string;
  kind: ColumnKind;
  nulls: number;
  uniques: number;
  sample: (string | number | null)[];
  min?: number;
  max?: number;
  sum?: number;
  avg?: number;
  // For categorical
  topValues?: { value: string; count: number }[];
}

export interface Dataset {
  fileName: string;
  fileSize: number;
  rows: Record<string, unknown>[];
  columns: ColumnStats[];
}

const BR_STATES = new Set([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);

const CURRENCY_RE = /^\s*(R\$|US\$|\$|€|£)\s?-?[\d.,]+\s*$/;
const PERCENT_RE = /^\s*-?[\d.,]+\s*%\s*$/;
const CPF_RE = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
const CNPJ_RE = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/;
const CEP_RE = /^\d{5}-?\d{3}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d[\d\s().-]{7,}$/;
const URL_RE = /^https?:\/\//i;
const DATE_RE =
  /^(\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?Z?)?|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})$/;

function toNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  let s = v.trim();
  if (!s) return null;
  s = s.replace(/[R$€£US]/gi, "").replace(/\s|%/g, "");
  // brazilian format 1.234,56
  if (/,/.test(s) && /\./.test(s)) s = s.replace(/\./g, "").replace(",", ".");
  else if (/,/.test(s)) s = s.replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function excelSerialToDate(serial: number): Date {
  return new Date((serial - 25569) * 86400 * 1000);
}

function looksLikeExcelDate(
  value: unknown,
  columnName: string,
): value is number {
  if (typeof value !== "number") return false;

  // Datas do Excel ficam aproximadamente nesse intervalo
  if (value < 25000 || value > 80000) return false;

  // Nome da coluna ajuda muito
  return /data|date|dia|mês|mes|per[ií]odo|periodo/i.test(columnName);
}

function normalizeExcelDates(
  rows: Record<string, unknown>[],
): Record<string, unknown>[] {
  return rows.map((row) => {
    const normalized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(row)) {
      if (value instanceof Date) {
        normalized[key] = value;
        continue;
      }

      if (looksLikeExcelDate(value, key)) {
        normalized[key] = excelSerialToDate(value);
        continue;
      }

      normalized[key] = value;
    }

    return normalized;
  });
}

function inferKind(name: string, values: unknown[]): ColumnKind {
  const nonNull = values.filter(
    (v) => v !== null && v !== undefined && v !== "",
  );
  if (nonNull.length === 0) return "empty";

  const lname = name.toLowerCase();
  const sample = nonNull
    .slice(0, 200)
    .map((v) => (v == null ? "" : String(v).trim()));

  const match = (re: RegExp, thresh = 0.8) =>
    sample.filter((s) => re.test(s)).length / sample.length >= thresh;

  if (match(CPF_RE)) return "cpf";
  if (match(CNPJ_RE)) return "cnpj";
  if (match(CEP_RE)) return "cep";
  if (match(EMAIL_RE)) return "email";
  if (match(URL_RE)) return "url";
  if (match(PHONE_RE, 0.9) && /(fone|tel|phone|celular|whats)/i.test(lname))
    return "phone";
  if (match(CURRENCY_RE)) return "currency";
  if (match(PERCENT_RE)) return "percentage";

  // State
  if (/estado|uf/i.test(lname) && match(/^[A-Z]{2}$/)) return "state";
  if (sample.every((s) => BR_STATES.has(s.toUpperCase())) && sample.length > 1)
    return "state";
  if (/cidade|city|munic/i.test(lname)) return "city";
  if (/(^|_)lat|latitude/i.test(lname) || /(^|_)lon|longitude/i.test(lname))
    return "latlon";
  if (/^id$|_id$|código|codigo/i.test(lname)) {
    const uniqueRatio = new Set(sample).size / sample.length;
    if (uniqueRatio > 0.9) return "id";
  }

  // Date
  if (match(DATE_RE, 0.7)) {
    return sample.some((s) => /T\d{2}:\d{2}/.test(s)) ? "datetime" : "date";
  }
  const asDates = sample.map((s) => Date.parse(s));
  if (
    asDates.filter((n) => !Number.isNaN(n)).length / sample.length > 0.85 &&
    /data|date|dia|mês|mes|período|periodo/i.test(lname)
  ) {
    return "date";
  }

  // Boolean
  const boolSet = new Set([
    "true",
    "false",
    "sim",
    "não",
    "nao",
    "yes",
    "no",
    "0",
    "1",
  ]);
  if (sample.every((s) => boolSet.has(s.toLowerCase()))) return "boolean";

  // Number
  const nums = sample.map(toNumber);
  const numericRatio = nums.filter((n) => n !== null).length / sample.length;
  if (numericRatio > 0.9) {
    if (
      /(receita|revenue|valor|preço|preco|price|custo|cost|lucro|profit|salário|salario|total)/i.test(
        lname,
      )
    )
      return "currency";
    const allInt = nums.every((n) => n === null || Number.isInteger(n));
    return allInt ? "integer" : "number";
  }

  // Category vs text
  const uniq = new Set(sample).size;
  const ratio = uniq / sample.length;
  if (uniq <= 50 && ratio < 0.5) return "category";
  return "text";
}

function computeStats(name: string, values: unknown[]): ColumnStats {
  const kind = inferKind(name, values);
  const nulls = values.filter(
    (v) => v === null || v === undefined || v === "",
  ).length;
  const nonNull = values.filter(
    (v) => v !== null && v !== undefined && v !== "",
  );
  const uniques = new Set(nonNull.map((v) => String(v))).size;

  const stats: ColumnStats = {
    name,
    kind,
    nulls,
    uniques,
    sample: nonNull.slice(0, 5).map((v) => v as string | number),
  };

  if (["number", "integer", "currency", "percentage"].includes(kind)) {
    const nums = nonNull.map(toNumber).filter((n): n is number => n !== null);
    if (nums.length) {
      stats.min = Math.min(...nums);
      stats.max = Math.max(...nums);
      stats.sum = nums.reduce((a, b) => a + b, 0);
      stats.avg = stats.sum / nums.length;
    }
  }

  if (["category", "state", "city", "text"].includes(kind)) {
    const counts = new Map<string, number>();
    for (const v of nonNull) {
      const s = String(v);
      counts.set(s, (counts.get(s) || 0) + 1);
    }
    stats.topValues = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, count]) => ({ value, count }));
  }

  return stats;
}

export async function parseFile(file: File): Promise<Dataset> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  let rows: Record<string, unknown>[] = [];

  if (ext === "csv" || ext === "tsv" || ext === "txt") {
    rows = await new Promise((resolve, reject) => {
      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete: (r) => resolve(r.data),
        error: reject,
      });
    });
  } else {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array", cellDates: true, });
    const sheet = wb.Sheets[wb.SheetNames[0]];

    rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true, });
  }

  rows = normalizeExcelDates(rows);
  const columnNames = rows.length ? Object.keys(rows[0]) : [];
  const columns = columnNames.map((name) =>
    computeStats(
      name,
      rows.map((r) => r[name]),
    ),
  );

  // Normalize row values with parsed numbers for numeric cols
  const numericCols = new Set(
    columns
      .filter((c) =>
        ["number", "integer", "currency", "percentage"].includes(c.kind),
      )
      .map((c) => c.name),
  );
  const dateCols = new Set(
    columns
      .filter((c) => c.kind === "date" || c.kind === "datetime")
      .map((c) => c.name),
  );
  const normalizedRows = rows.map((r) => {
    const out: Record<string, unknown> = { ...r };
    for (const c of numericCols) {
      const n = toNumber(r[c]);
      if (n !== null) out[c] = n;
    }
    for (const c of dateCols) {
      const raw = r[c];
      if (raw instanceof Date) out[c] = raw.toISOString();
    }
    return out;
  });

  return {
    fileName: file.name,
    fileSize: file.size,
    rows: normalizedRows,
    columns,
  };
}

// -------------- Chart recommendations --------------

export type ChartType =
  | "kpi"
  | "bar"
  | "line"
  | "area"
  | "pie"
  | "donut"
  | "stackedBar"
  | "table"
  | "topRank"
  | "distribution";

export interface ChartRecommendation {
  id: string;
  type: ChartType;
  title: string;
  reason: string;
  category?: string;
  value?: string;
  date?: string;
}

const isNumeric = (k: ColumnKind) =>
  k === "number" || k === "integer" || k === "currency" || k === "percentage";
const isCategorical = (k: ColumnKind) =>
  k === "category" || k === "state" || k === "city" || k === "boolean";
const isDate = (k: ColumnKind) => k === "date" || k === "datetime";
const isIgnorable = (k: ColumnKind) =>
  k === "cpf" ||
  k === "cnpj" ||
  k === "cep" ||
  k === "email" ||
  k === "phone" ||
  k === "id" ||
  k === "url" ||
  k === "empty" ||
  k === "latlon";

export function recommend(dataset: Dataset): ChartRecommendation[] {
  const { columns } = dataset;
  const recs: ChartRecommendation[] = [];
  const numericCols = columns.filter((c) => isNumeric(c.kind));
  const categoryCols = columns.filter(
    (c) => isCategorical(c.kind) && c.uniques <= 50,
  );
  const dateCols = columns.filter((c) => isDate(c.kind));

  // KPIs from numeric columns (up to 4)
  numericCols.slice(0, 4).forEach((c, i) => {
    recs.push({
      id: `kpi-${i}`,
      type: "kpi",
      title: c.name,
      value: c.name,
      reason: `A coluna "${c.name}" contém valores ${
        c.kind === "currency"
          ? "monetários"
          : c.kind === "percentage"
            ? "percentuais"
            : "numéricos"
      }. Ideal como indicador principal (soma e média).`,
    });
  });

  // Time series: date + numeric
  if (dateCols.length && numericCols.length) {
    const d = dateCols[0];
    const n = numericCols[0];
    recs.push({
      id: "line-time",
      type: "line",
      title: `Evolução de ${n.name} ao longo do tempo`,
      date: d.name,
      value: n.name,
      reason: `A coluna "${d.name}" representa uma série temporal e "${n.name}" contém valores numéricos. Um gráfico de linha comunica melhor a evolução no tempo.`,
    });
    if (numericCols.length > 1) {
      recs.push({
        id: "area-time",
        type: "area",
        title: `Volume de ${numericCols[1].name} por período`,
        date: d.name,
        value: numericCols[1].name,
        reason: `Complementa a análise temporal mostrando volume acumulado de "${numericCols[1].name}".`,
      });
    }
  }

  // Category + numeric → bar
  if (categoryCols.length && numericCols.length) {
    const c = categoryCols[0];
    const n = numericCols[0];
    recs.push({
      id: "bar-cat",
      type: "bar",
      title: `${n.name} por ${c.name}`,
      category: c.name,
      value: n.name,
      reason: `As colunas "${c.name}" (categórica) e "${n.name}" (numérica) formam um par ideal para comparação. Gráfico de barras destaca diferenças entre categorias.`,
    });

    // Donut for small category count
    if (c.uniques <= 8) {
      recs.push({
        id: "donut-cat",
        type: "donut",
        title: `Distribuição de ${n.name} por ${c.name}`,
        category: c.name,
        value: n.name,
        reason: `Com apenas ${c.uniques} categorias em "${c.name}", uma rosca mostra bem a participação de cada uma no total.`,
      });
    }
  }

  // Second category → stacked or second bar
  if (categoryCols.length > 1 && numericCols.length) {
    const c = categoryCols[1];
    const n = numericCols[0];
    recs.push({
      id: "bar-cat-2",
      type: "bar",
      title: `${n.name} por ${c.name}`,
      category: c.name,
      value: n.name,
      reason: `"${c.name}" oferece uma segunda dimensão categórica útil para segmentar "${n.name}".`,
    });
  }

  // Top ranking
  if (categoryCols.length && numericCols.length) {
    const c = categoryCols.find((x) => x.uniques > 5) || categoryCols[0];
    const n = numericCols[0];
    recs.push({
      id: "top-rank",
      type: "topRank",
      title: `Top 10 ${c.name} por ${n.name}`,
      category: c.name,
      value: n.name,
      reason: `Ranking dos 10 maiores valores de "${n.name}" agrupados por "${c.name}".`,
    });
  }

  // Distribution for a numeric col
  if (numericCols.length) {
    const n = numericCols[0];
    recs.push({
      id: "distribution",
      type: "distribution",
      title: `Distribuição de ${n.name}`,
      value: n.name,
      reason: `Histograma que mostra como os valores de "${n.name}" estão distribuídos e ajuda a detectar outliers.`,
    });
  }

  // Detected ignored fields explanation
  const ignored = columns.filter((c) => isIgnorable(c.kind));
  if (ignored.length) {
    recs.push({
      id: "ignored",
      type: "table",
      title: "Campos detectados e ignorados nos gráficos",
      reason: `Detectamos ${ignored.length} coluna(s) como identificadores ou dados pessoais (${ignored
        .map((c) => `${c.name} → ${c.kind.toUpperCase()}`)
        .slice(0, 3)
        .join(
          ", ",
        )}). Elas ficam disponíveis na tabela mas não geram gráficos.`,
    });
  }

  return recs;
}

// -------------- Aggregations --------------

export function aggregate(
  rows: Record<string, unknown>[],
  groupBy: string,
  valueCol: string,
  op: "sum" | "avg" | "count" = "sum",
): { name: string; value: number }[] {
  const acc = new Map<string, { total: number; count: number }>();
  for (const r of rows) {
    const k = String(r[groupBy] ?? "—");
    const v = Number(r[valueCol]);
    const entry = acc.get(k) || { total: 0, count: 0 };
    if (Number.isFinite(v)) {
      entry.total += v;
      entry.count += 1;
    }
    acc.set(k, entry);
  }
  return [...acc.entries()]
    .map(([name, { total, count }]) => ({
      name,
      value:
        op === "avg"
          ? count
            ? total / count
            : 0
          : op === "count"
            ? count
            : total,
    }))
    .sort((a, b) => b.value - a.value);
}

export function timeSeries(
  rows: Record<string, unknown>[],
  dateCol: string,
  valueCol: string,
): { name: string; value: number }[] {
  const acc = new Map<string, number>();
  for (const r of rows) {
    const raw = r[dateCol];
    if (!raw) continue;
    const d = new Date(String(raw));
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const v = Number(r[valueCol]);
    if (Number.isFinite(v)) acc.set(key, (acc.get(key) || 0) + v);
  }
  return [...acc.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name, value }));
}

export function histogram(
  rows: Record<string, unknown>[],
  col: string,
  bins = 10,
): { name: string; value: number }[] {
  const values = rows
    .map((r) => Number(r[col]))
    .filter((n) => Number.isFinite(n));
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return [{ name: String(min), value: values.length }];
  const step = (max - min) / bins;
  const buckets = Array.from({ length: bins }, () => 0);
  for (const v of values) {
    const idx = Math.min(bins - 1, Math.floor((v - min) / step));
    buckets[idx]++;
  }
  return buckets.map((count, i) => ({
    name: formatNumber(min + i * step),
    value: count,
  }));
}

// -------------- Formatting --------------

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return (n / 1_000).toFixed(1) + "k";
  if (Number.isInteger(n)) return n.toLocaleString("pt-BR");
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

export function formatValue(
  n: number | null | undefined,
  kind: ColumnKind,
): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  if (kind === "currency") return "R$ " + formatNumber(n);
  if (kind === "percentage") return formatNumber(n) + "%";
  return formatNumber(n);
}

export function kindLabel(k: ColumnKind): string {
  const map: Record<ColumnKind, string> = {
    number: "Número",
    integer: "Inteiro",
    currency: "Moeda",
    percentage: "Porcentagem",
    date: "Data",
    datetime: "Data/Hora",
    category: "Categoria",
    text: "Texto",
    boolean: "Booleano",
    email: "E-mail",
    phone: "Telefone",
    cpf: "CPF",
    cnpj: "CNPJ",
    cep: "CEP",
    state: "Estado (UF)",
    city: "Cidade",
    id: "Identificador",
    latlon: "Geolocalização",
    url: "URL",
    empty: "Vazio",
  };
  return map[k];
}

// -------------- Insights --------------

export interface Insight {
  title: string;
  body: string;
}

export function generateInsights(dataset: Dataset): Insight[] {
  const insights: Insight[] = [];
  const { columns, rows } = dataset;
  const numericCols = columns.filter((c) => isNumeric(c.kind));
  const categoryCols = columns.filter(
    (c) => isCategorical(c.kind) && c.uniques <= 50,
  );

  if (numericCols.length) {
    const n = numericCols[0];
    insights.push({
      title: `Total de ${n.name}`,
      body: `A soma de "${n.name}" é ${formatValue(n.sum ?? 0, n.kind)} distribuída em ${rows.length.toLocaleString("pt-BR")} registros, com média de ${formatValue(n.avg ?? 0, n.kind)}.`,
    });

    if (categoryCols.length) {
      const c = categoryCols[0];
      const agg = aggregate(rows, c.name, n.name, "sum");
      if (agg.length >= 2) {
        const top = agg[0];
        const total = agg.reduce((a, b) => a + b.value, 0);
        const pct = total ? ((top.value / total) * 100).toFixed(1) : "0";
        insights.push({
          title: `Destaque em ${c.name}`,
          body: `"${top.name}" lidera com ${formatValue(top.value, n.kind)}, representando ${pct}% do total de "${n.name}".`,
        });
        const bottom = agg[agg.length - 1];
        insights.push({
          title: `Menor participação`,
          body: `"${bottom.name}" registra o menor valor: ${formatValue(bottom.value, n.kind)}.`,
        });
      }
    }
  }

  const problems = columns.filter((c) => c.nulls / rows.length > 0.2);
  if (problems.length) {
    insights.push({
      title: `Qualidade dos dados`,
      body: `${problems.length} coluna(s) apresentam mais de 20% de valores ausentes: ${problems
        .map((c) => c.name)
        .slice(0, 3)
        .join(", ")}. Considere tratar antes de análises mais profundas.`,
    });
  }

  return insights;
}
