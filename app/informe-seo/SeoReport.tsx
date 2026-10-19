"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { presentReport } from "@/services/seo-audit/report-copy.mjs";
import type { DiscoveryReport } from "@/services/seo-audit/report-copy.mjs";
import styles from "../diagnostico-seo/diagnosis.module.css";

type Report = {
  clinic: string; country: string; city: string; passedChecks: number; totalChecks: number; analyzedAt: string;
  website: string; title: string | null; description: string | null; h1Count: number | null;
  words: number | null; priorities: { key: string; action: string }[]; issues: { key: string; action: string }[];
  source: string; scope: string; limitation: string; images: number; missingAlt: number;
  checks: { key: string; label: string; passed: boolean }[];
  discovery?: DiscoveryReport;
  lighthouse: null | {
    performance: number | null; seo: number | null; accessibility: number | null; bestPractices: number | null;
    lcpMs: number | null; cls: number | null; tbtMs: number | null; fcpMs: number | null; speedIndexMs: number | null;
    opportunities: { title: string; displayValue: string; savingsMs: number | null }[];
  };
};
export function SeoReport() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
    async function load() {
      try {
        if (!/^[a-f0-9]{64}$/.test(token)) throw new Error("Abre el enlace completo que recibiste por email.");
        const response = await fetch(`/api/seo-report?token=${token}`, { signal: controller.signal });
        if (!response.ok) throw new Error(response.status === 404 ? "Este informe no está disponible o su enlace expiró." : "No pudimos cargar el informe. Inténtalo de nuevo más tarde.");
        const data = await response.json() as { report: Report };
        setReport(data.report);
      } catch (failure) { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "No pudimos cargar el informe."); }
    }
    void load();
    return () => controller.abort();
  }, []);
  const copy = report ? presentReport(report) : null;
  return <main className={styles.page}>
    <article className={styles.report}>
      {error ? <><h1>No pudimos abrir tu diagnóstico.</h1><p role="alert">{error}</p><Link href="/diagnostico-seo">Solicitar un diagnóstico nuevo ↗</Link></> : !report || !copy ? <p role="status">Cargando tu diagnóstico…</p> : <>
        <p className={styles.eyebrow}>{[report.city, report.country].filter(Boolean).join(", ")}</p>
        <h1>El diagnóstico de {report.clinic}.</h1>
        <p>{report.website}</p>
        <p className={styles.score}>{report.passedChecks}/{report.totalChecks}</p>
        <p>Comprobaciones básicas correctas en la página revisada</p>
        <p>{copy.summary}</p>
        <h2>Cómo funciona tu página en el celular</h2>
        {report.lighthouse ? <>
          <div className={styles.metrics}>
            <div><strong>{report.lighthouse.performance ?? "—"}</strong><span>Velocidad al cargar</span></div>
            <div><strong>{report.lighthouse.seo ?? "—"}</strong><span>Preparación básica para buscadores</span></div>
            <div><strong>{report.lighthouse.accessibility ?? "—"}</strong><span>Facilidad de uso para más personas</span></div>
            <div><strong>{report.lighthouse.bestPractices ?? "—"}</strong><span>Funcionamiento general</span></div>
          </div>
          <p className={styles.note}>Cada resultado va de 0 a 100: cuanto más alto, mejor. Un buen resultado en buscadores indica que se cumplen ajustes básicos; no significa que tu clínica aparezca entre los primeros resultados de Google.</p>
          <dl>
            <dt>Tiempo hasta que aparece la parte principal de la página</dt><dd>{report.lighthouse.lcpMs == null ? "No pudimos medirlo" : `${(report.lighthouse.lcpMs / 1000).toFixed(1)} segundos`}</dd>
            <dt>Estabilidad del contenido mientras carga</dt><dd>{report.lighthouse.cls == null ? "No pudimos medirla" : report.lighthouse.cls === 0 ? "Los elementos se mantuvieron en su lugar durante la prueba." : "Detectamos movimientos de los elementos durante la carga. Conviene revisar que no dificulten leer o tocar los botones."}</dd>
            <dt>Tiempo en que la página está ocupada y puede tardar en responder</dt><dd>{report.lighthouse.tbtMs == null ? "No pudimos medirlo" : `${(report.lighthouse.tbtMs / 1000).toFixed(1)} segundos durante la carga`}</dd>
            <dt>Tiempo hasta que aparece el primer contenido</dt><dd>{report.lighthouse.fcpMs == null ? "No pudimos medirlo" : `${(report.lighthouse.fcpMs / 1000).toFixed(1)} segundos`}</dd>
          </dl>
          {copy.opportunities.length > 0 && <><h3>Qué puede acelerar tu página</h3><ul>{copy.opportunities.map((action) => <li key={action}>{action}</li>)}</ul></>}
        </> : <p>No pudimos medir la carga en celular durante esta visita. Las comprobaciones básicas de la página siguen disponibles.</p>}
        <h2>Lo que ya está bien y lo que conviene revisar</h2>
        <ul>{copy.checks.map((check) => <li key={check.key}>{check.passed ? "Correcto" : "Revisar"}: {check.label}</li>)}</ul>
        <section className={styles.clarity} aria-labelledby="clarity-title">
          <p className={styles.eyebrow}>INFORMACIÓN QUE SE PUEDE ENTENDER Y CONTRASTAR</p>
          <h2 id="clarity-title">Claridad de tu clínica para buscadores e IA</h2>
          {copy.discovery ? <>
            <p>Observaciones de la página recibida. «No detectado» significa que no identificamos esa señal con esta comprobación; puede existir en otro formato o página. «Requiere revisión» necesita una comprobación humana.</p>
            <div className={styles.findings}>{copy.discovery.findings.map(finding => <article key={finding.key} className={styles.finding}>
              <div className={styles.findingHeading}><h3>{finding.label}</h3><span className={styles.findingStatus} data-status={finding.status}>{finding.statusLabel}</span></div>
              <p><strong>Evidencia:</strong> {finding.evidence}</p>
              <p><strong>Siguiente paso:</strong> {finding.action}</p>
            </article>)}</div>
            <p className={styles.note}>{copy.discovery.limitation}</p>
          </> : <p>Este informe se preparó antes de incorporar esta sección. No contiene observaciones de claridad para buscadores e IA. Puedes solicitar un nuevo diagnóstico cuando esté disponible una nueva solicitud para tu página.</p>}
        </section>
        <h2>Por dónde empezar</h2>
        {copy.priorities.length ? <ol>{copy.priorities.map((issue) => <li key={issue.key}>{issue.action}</li>)}</ol> : <p>Las comprobaciones básicas están bien. El siguiente paso es revisar si las páginas de tratamientos explican tus servicios, tu ubicación y cómo pedir una cita.</p>}
        <h2>Lo que encontramos</h2>
        <dl><dt>Título de la página</dt><dd>{report.title || "No disponible"}</dd><dt>Descripción</dt><dd>{report.description || "No disponible"}</dd><dt>Títulos principales en el contenido</dt><dd>{report.h1Count ?? "No disponible"}</dd><dt>Palabras en el contenido</dt><dd>{report.words ?? "No disponible"}</dd><dt>Imágenes sin una descripción configurada</dt><dd>{report.missingAlt} de {report.images} imágenes</dd></dl>
        {report.issues.length > 3 && <details><summary>Ver todos los hallazgos ({report.issues.length})</summary><ul>{report.issues.map((issue) => <li key={issue.key}>{presentReport({ issues: [issue] }).priorities[0]?.action}</li>)}</ul></details>}
        <h2>Qué cubre este diagnóstico</h2><p>{copy.scope}</p><p className={styles.note}>{copy.limitation}</p>
        <p className={styles.note}>Preparado por Elevator Dental. Revisado el {new Date(report.analyzedAt).toLocaleDateString("es")}. El enlace está disponible durante 30 días desde la solicitud.</p>
        <h2>Convierte los hallazgos en un plan.</h2><p>Podemos ayudarte a revisar las prioridades para tu clínica.</p><Link href="/#contacto">Hablar con Elevator →</Link>
      </>}
    </article>
  </main>;
}
