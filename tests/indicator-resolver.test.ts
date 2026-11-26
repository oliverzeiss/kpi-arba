import test from 'node:test';
import assert from 'node:assert/strict';
import type { KPISubmission, KPITemplate } from '@/types/kpi';
import {
  aggregateIndicatorAnalytics,
  buildIndicatorSnapshots,
  buildTemplateMap,
  resolveSubmissionIndicators,
} from '@/lib/indicator-resolver';

const cleaningTemplate: KPITemplate = {
  id: 'tpl-cs',
  positionId: 'pos-cs',
  positionTitle: 'Cleaning Service',
  divisionName: 'Operasional SPBU',
  evaluationCycle: 'Bulanan',
  activePeriod: 'Oktober 2026',
  activeYear: 2026,
  activeMonth: 10,
  activeQuarter: 'Q4',
  updatedAt: '2026-10-01T00:00:00.000Z',
  indicators: [
    {
      id: 'ind-1',
      title: 'Kebersihan Area SPBU',
      description: 'Area bersih',
      measurementMethod: 'Inspeksi harian',
      weight: 50,
      maxTarget: 100,
      category: 'Operasional',
    },
    {
      id: 'ind-2',
      title: 'Kerapian Petugas',
      description: 'Seragam rapi',
      measurementMethod: 'Checklist supervisor',
      weight: 50,
      maxTarget: 100,
      category: 'Disiplin',
    },
  ],
};

test('resolveSubmissionIndicators prefers indicatorSnapshots over mutable active template', () => {
  const templateMap = buildTemplateMap([cleaningTemplate]);
  const submission: KPISubmission = {
    id: 'sub-1',
    employeeName: 'Rizal Kasim',
    positionId: 'pos-cs',
    positionTitle: 'Cleaning Service',
    divisionName: 'Operasional SPBU',
    period: 'September 2026',
    year: 2026,
    month: 9,
    quarter: 'Q3',
    scores: { 'ind-old': 80, 'ind-2': 90 },
    supervisorScores: { 'ind-old': 85, 'ind-2': 88 },
    indicatorSnapshots: [
      { id: 'ind-old', title: 'Kebersihan Lama', weight: 40, category: 'Legacy' },
      { id: 'ind-2', title: 'Kerapian Petugas', weight: 60, category: 'Disiplin' },
    ],
    totalScore: 86,
    grade: 'A',
    gradeDescription: 'Memuaskan',
    createdAt: '2026-09-28T00:00:00.000Z',
  };

  const resolved = resolveSubmissionIndicators(submission, templateMap);
  assert.equal(resolved.length, 2);
  assert.equal(resolved[0].title, 'Kebersihan Lama');
  assert.equal(resolved[0].weight, 40);
  assert.equal(resolved[0].gap, 5);
  assert.equal(resolved[0].weightedContribution, 34); // 85 * 40 / 100
  assert.equal(resolved[1].gap, -2);
  assert.equal(resolved[1].weightedContribution, 52.8); // 88 * 60 / 100
});

test('resolveSubmissionIndicators preserves zero scores and flags orphan archived keys', () => {
  const templateMap = buildTemplateMap([cleaningTemplate]);
  const submission: KPISubmission = {
    id: 'sub-2',
    employeeName: 'Budi',
    positionId: 'pos-cs',
    positionTitle: 'Cleaning Service',
    divisionName: 'Operasional SPBU',
    period: 'Oktober 2026',
    year: 2026,
    month: 10,
    quarter: 'Q4',
    scores: { 'ind-1': 0, 'ind-removed': 70 },
    supervisorScores: { 'ind-1': 0 },
    totalScore: 0,
    grade: 'D',
    gradeDescription: 'Kurang',
    createdAt: '2026-10-15T00:00:00.000Z',
  };

  const resolved = resolveSubmissionIndicators(submission, templateMap);
  // ind-2 has no score in fallback template so it is skipped; ind-1 and ind-removed are returned
  assert.equal(resolved.length, 2);

  assert.equal(resolved[0].id, 'ind-1');
  assert.equal(resolved[0].selfScore, 0);
  assert.equal(resolved[0].supervisorScore, 0);
  assert.equal(resolved[0].gap, 0);
  assert.equal(resolved[0].weightedContribution, 0);

  assert.equal(resolved[1].id, 'ind-removed');
  assert.equal(resolved[1].isArchived, true);
  assert.equal(resolved[1].title, '[Indikator Terarsip: ind-removed]');
  assert.equal(resolved[1].weight, null);
  assert.equal(resolved[1].selfScore, 70);
  assert.equal(resolved[1].supervisorScore, null);
  assert.equal(resolved[1].weightedContribution, null);
});

test('aggregateIndicatorAnalytics separates positions and sorts bottlenecks ascending', () => {
  const adminTemplate: KPITemplate = {
    ...cleaningTemplate,
    id: 'tpl-admin',
    positionId: 'pos-admin',
    positionTitle: 'Admin IT',
    divisionName: 'IT',
    indicators: [
      {
        id: 'ind-a1',
        title: 'Kerapian Petugas', // same title as CS but different position
        description: 'Kerapian kerja',
        measurementMethod: 'Audit',
        weight: 100,
        maxTarget: 100,
        category: 'Core',
      },
    ],
  };

  const templateMap = buildTemplateMap([cleaningTemplate, adminTemplate]);
  const subs: KPISubmission[] = [
    {
      id: 's1',
      employeeName: 'Ani',
      positionId: 'pos-cs',
      positionTitle: 'Cleaning Service',
      divisionName: 'Operasional SPBU',
      period: 'Oktober 2026',
      year: 2026,
      month: 10,
      quarter: 'Q4',
      scores: { 'ind-1': 90, 'ind-2': 60 },
      supervisorScores: { 'ind-1': 92, 'ind-2': 58 },
      totalScore: 75,
      grade: 'B',
      gradeDescription: 'Baik',
      createdAt: '2026-10-01T00:00:00.000Z',
    },
    {
      id: 's2',
      employeeName: 'Doni',
      positionId: 'pos-admin',
      positionTitle: 'Admin IT',
      divisionName: 'IT',
      period: 'Oktober 2026',
      year: 2026,
      month: 10,
      quarter: 'Q4',
      scores: { 'ind-a1': 85 },
      totalScore: 85,
      grade: 'A',
      gradeDescription: 'Memuaskan',
      createdAt: '2026-10-02T00:00:00.000Z',
    },
  ];

  const rows = aggregateIndicatorAnalytics(subs, templateMap, 75);
  assert.equal(rows.length, 3);
  assert.equal(rows[0].positionId, 'pos-cs');
  assert.equal(rows[0].indicatorTitle, 'Kerapian Petugas');
  assert.equal(rows[0].avgEffective, 58);
  assert.equal(rows[0].meetsTarget, false);

  assert.equal(rows[1].positionId, 'pos-admin');
  assert.equal(rows[1].avgEffective, 85);
  assert.equal(rows[1].reviewedCount, 0);
  assert.equal(rows[1].avgSupervisor, null);
  assert.equal(rows[1].meetsTarget, true);

  assert.equal(rows[2].indicatorTitle, 'Kebersihan Area SPBU');
  assert.equal(rows[2].avgEffective, 92);
});

test('buildIndicatorSnapshots captures clean metadata copy', () => {
  const snaps = buildIndicatorSnapshots(cleaningTemplate.indicators);
  assert.equal(snaps.length, 2);
  assert.deepEqual(snaps[0], {
    id: 'ind-1',
    title: 'Kebersihan Area SPBU',
    weight: 50,
    category: 'Operasional',
    measurementMethod: 'Inspeksi harian',
  });
});
