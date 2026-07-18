import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteNav, SiteFooter } from "@/components/dataloom/Chrome";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="mb-6 inline-block rounded-full border border-accent/20 bg-brand-soft px-3 py-1 font-mono text-xs font-medium uppercase tracking-widest text-accent">
            Inteligência Analítica
          </span>
          <h1 className="mb-8 text-5xl font-extrabold tracking-tighter text-balance md:text-7xl">
            Transforme planilhas em{" "}
            <span className="text-accent">dashboards</span> em segundos.
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-light leading-relaxed text-muted-foreground text-pretty md:text-xl">
            Nossa IA analisa a estrutura dos seus dados e constrói visualizações
            profissionais automaticamente. Sem fórmulas, sem complexidade.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/app"
              className="flex items-center gap-2 rounded-xl bg-foreground px-8 py-4 text-lg font-semibold text-background transition-all hover:shadow-xl hover:shadow-foreground/10"
            >
              Importar Planilha
              <span className="font-mono text-sm uppercase text-background/40">
                .csv .xlsx
              </span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-panel p-4 shadow-sm">
            <HeroDemo />
          </div>
        </motion.div>
      </section>

      <section className="border-y border-border bg-panel py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              Como funciona
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Do arquivo bruto ao insight em três passos.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Faça upload da planilha",
                d: "Arraste um CSV ou XLSX. Processamos tudo no seu navegador — nenhum dado sai do seu computador.",
              },
              {
                n: "02",
                t: "A IA entende seus dados",
                d: "Detectamos tipos, moedas, datas, categorias e outliers. Cada coluna recebe uma classificação semântica.",
              },
              {
                n: "03",
                t: "Receba um dashboard pronto",
                d: "KPIs, gráficos, filtros e ranking gerados automaticamente com justificativas claras.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-border bg-background p-6"
              >
                <p className="font-mono text-sm font-bold text-accent">{s.n}</p>
                <h3 className="mt-4 text-xl font-bold tracking-tight">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              Recursos
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Um assistente de BI que pensa junto com você.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Para analistas, gestores e qualquer pessoa que trabalha com Excel.
              Sem curva de aprendizado.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              "Detecção automática de moedas, datas, CPF, CNPJ, CEP, estados e cidades",
              "Sugestões de gráfico com justificativa em linguagem natural",
              "KPIs, tabelas, rankings e distribuições gerados sem configuração",
              "Filtros globais que atualizam todos os gráficos ao mesmo tempo",
              "Insights automáticos: destaques, tendências, anomalias e outliers",
            ].map((f) => (
              <li key={f} className="flex gap-3 text-sm">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-foreground py-20 text-background">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Pronto para deixar sua planilha falar?
          </h2>
          <p className="mt-3 text-background/60">
            Comece agora. Nenhum cadastro necessário para testar.
          </p>
          <Link
            to="/app"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-accent-foreground transition-all hover:brightness-110"
          >
            Importar Planilha
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function HeroDemo() {
  const bars = [45, 78, 62, 90, 55, 82, 70];
  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl bg-background p-6 md:grid-cols-2">
      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Planilha
        </p>
        <div className="overflow-hidden rounded-lg border border-border font-mono text-[11px]">
          <div className="grid grid-cols-3 border-b border-border bg-panel px-3 py-2 font-semibold">
            <span>mês</span>
            <span>categoria</span>
            <span className="text-right">receita</span>
          </div>
          {[
            ["2024-01", "SaaS", "R$ 42.800"],
            ["2024-02", "SaaS", "R$ 51.200"],
            ["2024-03", "API", "R$ 38.400"],
            ["2024-04", "SaaS", "R$ 66.900"],
            ["2024-05", "Apps", "R$ 44.100"],
            ["2024-06", "API", "R$ 71.000"],
            ["2024-07", "SaaS", "R$ 82.400"],
          ].map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-3 border-b border-border px-3 py-1.5 last:border-0"
            >
              <span>{r[0]}</span>
              <span>{r[1]}</span>
              <span className="text-right">{r[2]}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-accent">
          → Dashboard
        </p>
        <div className="rounded-lg border border-border bg-panel p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-xs font-semibold">Receita mensal</span>
            <span className="font-mono text-xs text-muted-foreground">
              R$ 396.8k
            </span>
          </div>
          <div className="flex h-40 items-end gap-2">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{
                  duration: 0.8,
                  delay: 0.4 + i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex-1 rounded-t-sm border-t-2 border-accent bg-brand-soft"
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground">
            {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
