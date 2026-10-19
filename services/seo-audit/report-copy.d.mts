type Finding = { key: string; action: string };
type Check = { key: string; label: string; passed: boolean };
export type DiscoveryFinding = { key: string; label: string; status: 'detected' | 'not_detected' | 'requires_review'; evidence: string; action: string; priority: boolean };
export type DiscoveryReport = { version: number; findings: DiscoveryFinding[]; limitation: string };
export const reportScope: string;
export const reportLimitation: string;
export function presentReport(report: {
  checks?: Check[];
  issues?: Finding[];
  priorities?: Finding[];
  discovery?: DiscoveryReport;
  lighthouse?: null | { performance: number | null; opportunities: { title: string }[] };
}): { checks: Check[]; opportunities: string[]; priorities: Finding[]; discovery: null | (Omit<DiscoveryReport, 'findings'> & { findings: (DiscoveryFinding & { statusLabel: string })[] }); summary: string; scope: string; limitation: string };
