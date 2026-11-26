import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_TEMPLATES } from '@/lib/storage';
import {
  createSubmissionService,
  fetchSubmissionsService,
  updateSubmissionReviewService,
} from '@/lib/supabase-service';

test('createSubmissionService attaches indicatorSnapshots and updateSubmissionReviewService returns computed totals', async () => {
  const template = {
    ...INITIAL_TEMPLATES['pos-3'],
    activePeriod: `Test Snapshot ${Date.now()}`,
  };

  const created = await createSubmissionService(
    'Tester Snapshot',
    template,
    { 'ind-1': 80, 'ind-2': 90, 'ind-3': 70, 'ind-4': 100 },
    'Catatan test'
  );

  assert.equal(created.indicatorSnapshots?.length, 4);
  assert.equal(created.indicatorSnapshots?.[0].title, 'Ketepatan Waktu & Kehadiran');
  assert.equal(created.indicatorSnapshots?.[1].weight, 35);

  const reviewResult = await updateSubmissionReviewService(
    created.id,
    { 'ind-1': 0, 'ind-2': 0, 'ind-3': 0, 'ind-4': 0 },
    template.indicators,
    'Review nol',
    'approved',
    'Atasan Test'
  );

  assert.equal(reviewResult.supervisorTotalScore, 0);
  assert.equal(reviewResult.finalTotalScore, 0);
  assert.equal(reviewResult.finalGrade, 'D');
  assert.equal(reviewResult.reviewedBy, 'Atasan Test');

  const fetched = await fetchSubmissionsService({ employeeName: 'Tester Snapshot' });
  const matched = fetched.find((s) => s.id === created.id);
  assert.ok(matched);
  assert.equal(matched?.supervisorTotalScore, 0);
  assert.equal(matched?.finalTotalScore, 0);
  assert.equal(matched?.indicatorSnapshots?.length, 4);
});
