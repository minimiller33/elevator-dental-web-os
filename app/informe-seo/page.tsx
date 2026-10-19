import type { Metadata } from "next";
import { SeoReport } from "./SeoReport";

export const metadata: Metadata = { title: "Tu diagnóstico SEO", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function ReportPage() { return <SeoReport />; }
