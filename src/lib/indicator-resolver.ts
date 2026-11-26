import type {
  Indicator,
  IndicatorSnapshot,
  KPISubmission,
  KPITemplate,
} from '@/types/kpi';

export interface ResolvedIndicatorScore {
  id: string;
  title: string;
  weight: number | null;
  category: string;
  measurementMethod: string;
  selfScore: number | null;
  supervisorScore: number | null;
  gap: number | null;
  effectiveScore: number | null;
  weightedContribution: number | null;
  isArchived: boolean;
}

export interface IndicatorAnalyticsRow {
  divisionName: string;
  positionId: string;
  positionTitle: string;
  indicatorTitle: string;
  category: string;
  weight: number | null;
  totalAssessed: number;
  reviewedCount: number;
  avgSelf: number | null;
  avgSupervisor: number | null;
  avgGap: number | null;
  avgEffective: number;
  meetsTarget: boolean;
}

/**
 * Parses a raw score value safely while preserving valid zero scores.
 */
export function toNumericScore(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === '') return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

/**
 * Rounds a number to 2 decimal places.
 */
export function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

/**
 * Builds an O(1) lookup map from positionId to KPITemplate.
 */
export function buildTemplateMap(templates: KPITemplate[] = []): Map<string, KPITemplate> {
  const map = new Map<string, KPITemplate>();
  for (const tpl of templates) {
    if (tpl && tpl.positionId) {
      map.set(tpl.positionId, tpl);
    }
  }
  return map;
}

/**
 * Extracts immutable indicator snapshot metadata from a template indicator array.
 */
export function buildIndicatorSnapshots(indicators: Indicator[] = []): IndicatorSnapshot[] {
  return indicators.map((ind) => ({
    id: ind.id,
    title: ind.title,
    weight: Number(ind.weight) || 0,
    category: ind.category,
    measurementMethod: ind.measurementMethod,
  }));
}

/**
 * Resolves per-indicator Self, Atasan, Gap, and weighted contribution for a submission.
 * Priority: submission.indicatorSnapshots -> active template -> orphan archived fallback.
 */
export function resolveSubmissionIndicators(
  submission: KPISubmission,
  templateMap: Map<string, KPITemplate>
): ResolvedIndicatorScore[] {
  const selfScores = submission.scores || {};
  const supScores = submission.supervisorScores || {};
  const hasSnapshots =
    Array.isArray(submission.indicatorSnapshots) && submission.indicatorSnapshots.length > 0;

  const primaryList: Array<{
    id: string;
    title: string;
    weight: number;
    category?: string;
    measurementMethod?: string;
  }> = hasSnapshots
    ? submission.indicatorSnapshots!
    : templateMap.get(submission.positionId)?.indicators || [];

  const resolved: ResolvedIndicatorScore[] = [];
  const seenIds = new Set<string>();

  for (const ind of primaryList) {
    seenIds.add(ind.id);
    const selfScore = toNumericScore(selfScores[ind.id]);
    const supervisorScore = toNumericScore(supScores[ind.id]);

    // When falling back to the mutable active template, skip indicators added after submission.
    if (!hasSnapshots && selfScore === null && supervisorScore === null) {
      continue;
    }

    const weight = Number.isFinite(Number(ind.weight)) ? Number(ind.weight) : 0;
    const gap =
      selfScore !== null && supervisorScore !== null ? round2(supervisorScore - selfScore) : null;
    const effectiveScore = supervisorScore !== null ? supervisorScore : selfScore;
    const weightedContribution =
      effectiveScore !== null ? round2((effectiveScore * weight) / 100) : null;

    resolved.push({
      id: ind.id,
      title: ind.title || ind.id,
      weight,
      category: ind.category || '-',
      measurementMethod: ind.measurementMethod || '-',
      selfScore,
      supervisorScore,
      gap,
      effectiveScore,
      weightedContribution,
      isArchived: false,
    });
  }

  // Capture any orphan indicator keys stored in scores that no longer exist in template/snapshot.
  const allScoreKeys = Array.from(
    new Set<string>([...Object.keys(selfScores), ...Object.keys(supScores)])
  );

  for (const key of allScoreKeys) {
    if (seenIds.has(key)) continue;
    const selfScore = toNumericScore(selfScores[key]);
    const supervisorScore = toNumericScore(supScores[key]);
    if (selfScore === null && supervisorScore === null) continue;

    const gap =
      selfScore !== null && supervisorScore !== null ? round2(supervisorScore - selfScore) : null;
    const effectiveScore = supervisorScore !== null ? supervisorScore : selfScore;

    resolved.push({
      id: key,
      title: `[Indikator Terarsip: ${key}]`,
      weight: null,
      category: 'Terarsip',
      measurementMethod: '-',
      selfScore,
      supervisorScore,
      gap,
      effectiveScore,
      weightedContribution: null,
      isArchived: true,
    });
  }

  return resolved;
}

/**
 * Aggregates indicator averages across submissions grouped by division, position, and title,
 * sorted ascending by effective average score so bottlenecks surface first.
 */
export function aggregateIndicatorAnalytics(
  submissions: KPISubmission[],
  templateMap: Map<string, KPITemplate>,
  companyKpiTarget: number = 75
): IndicatorAnalyticsRow[] {
  interface Bucket {
    divisionName: string;
    positionId: string;
    positionTitle: string;
    indicatorTitle: string;
    category: string;
    weight: number | null;
    selfSum: number;
    selfCount: number;
    supSum: number;
    supCount: number;
    gapSum: number;
    gapCount: number;
    effSum: number;
    effCount: number;
  }

  const buckets = new Map<string, Bucket>();

  for (const sub of submissions) {
    const resolved = resolveSubmissionIndicators(sub, templateMap);
    for (const item of resolved) {
      if (item.effectiveScore === null) continue;
      const key = `${sub.divisionName}::${sub.positionId}::${item.title.trim().toLowerCase()}`;
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = {
          divisionName: sub.divisionName || '-',
          positionId: sub.positionId,
          positionTitle: sub.positionTitle || '-',
          indicatorTitle: item.title,
          category: item.category,
          weight: item.weight,
          selfSum: 0,
          selfCount: 0,
          supSum: 0,
          supCount: 0,
          gapSum: 0,
          gapCount: 0,
          effSum: 0,
          effCount: 0,
        };
        buckets.set(key, bucket);
      }

      if (item.selfScore !== null) {
        bucket.selfSum += item.selfScore;
        bucket.selfCount += 1;
      }
      if (item.supervisorScore !== null) {
        bucket.supSum += item.supervisorScore;
        bucket.supCount += 1;
      }
      if (item.gap !== null) {
        bucket.gapSum += item.gap;
        bucket.gapCount += 1;
      }
      bucket.effSum += item.effectiveScore;
      bucket.effCount += 1;
    }
  }

  const rows: IndicatorAnalyticsRow[] = [];
  for (const b of Array.from(buckets.values())) {
    const avgEffective = round2(b.effSum / b.effCount);
    rows.push({
      divisionName: b.divisionName,
      positionId: b.positionId,
      positionTitle: b.positionTitle,
      indicatorTitle: b.indicatorTitle,
      category: b.category,
      weight: b.weight,
      totalAssessed: b.effCount,
      reviewedCount: b.supCount,
      avgSelf: b.selfCount > 0 ? round2(b.selfSum / b.selfCount) : null,
      avgSupervisor: b.supCount > 0 ? round2(b.supSum / b.supCount) : null,
      avgGap: b.gapCount > 0 ? round2(b.gapSum / b.gapCount) : null,
      avgEffective,
      meetsTarget: avgEffective >= companyKpiTarget,
    });
  }

  return rows.sort((a, b) => {
    if (a.avgEffective !== b.avgEffective) return a.avgEffective - b.avgEffective;
    if (b.totalAssessed !== a.totalAssessed) return b.totalAssessed - a.totalAssessed;
    return a.indicatorTitle.localeCompare(b.indicatorTitle);
  });
}
