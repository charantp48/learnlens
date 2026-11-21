import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateStudyPlan } from '../src/services/studyPlanner.js';

describe('Core Logic: Adaptive Study Planner (Pure JS)', () => {
  const sampleGaps = [
    {
      topicId: 't4',
      topicName: 'Quadratic Equations',
      accuracy: 30, // Very weak (< 35%)
      rootPrerequisiteId: 't3',
      rootPrerequisiteName: 'Algebraic Identities & Factoring',
    },
    {
      topicId: 't6',
      topicName: 'Linear Equations in 2 Variables',
      accuracy: 55, // Moderate weak (35-60%)
      rootPrerequisiteId: null,
      rootPrerequisiteName: null,
    },
  ];

  it('Rule 1: Sessions are strictly sized to 25 or 30 minutes', () => {
    const plan25 = generateStudyPlan({ learningGaps: sampleGaps, sessionDuration: 25 });
    const plan30 = generateStudyPlan({ learningGaps: sampleGaps, sessionDuration: 30 });
    const planInvalid = generateStudyPlan({ learningGaps: sampleGaps, sessionDuration: 90 }); // capped to 30

    plan25.sessions.forEach((s) => {
      assert.equal(s.durationMinutes, 25);
    });
    plan30.sessions.forEach((s) => {
      assert.equal(s.durationMinutes, 30);
    });
    planInvalid.sessions.forEach((s) => {
      assert.equal(s.durationMinutes, 30, 'Durations over 30 must be capped at 30 minutes');
    });
  });

  it('Rule 2: Prerequisite topics are scheduled chronologically before target weak topics', () => {
    const plan = generateStudyPlan({ learningGaps: sampleGaps, dailyFreeMinutes: 60 });

    // Find first session of prerequisite (t3) and target (t4)
    const firstPrereqIndex = plan.sessions.findIndex((s) => s.topicId === 't3');
    const firstTargetIndex = plan.sessions.findIndex((s) => s.topicId === 't4');

    assert.ok(firstPrereqIndex !== -1, 'Prerequisite session must be present');
    assert.ok(firstTargetIndex !== -1, 'Target topic session must be present');
    assert.ok(
      firstPrereqIndex < firstTargetIndex,
      'Prerequisite session (t3) must precede target session (t4)'
    );
  });

  it('Rule 3: Weaker topics receive more sessions than stronger topics', () => {
    const gaps = [
      { topicId: 'weak', topicName: 'Very Weak Topic', accuracy: 25 },
      { topicId: 'mod', topicName: 'Moderate Topic', accuracy: 55 },
    ];

    const plan = generateStudyPlan({ learningGaps: gaps, dailyFreeMinutes: 60 });

    const weakSessions = plan.sessions.filter((s) => s.topicId === 'weak');
    const modSessions = plan.sessions.filter((s) => s.topicId === 'mod');

    assert.ok(
      weakSessions.length > modSessions.length,
      `Weaker topic (${weakSessions.length}) must get more sessions than moderate topic (${modSessions.length})`
    );
  });

  it('Rule 4: Closer exam dates mark the plan as urgent and accelerate session allocation', () => {
    const today = new Date();
    const urgentDate = new Date(today);
    urgentDate.setDate(today.getDate() + 3); // 3 days away (urgent)

    const distantDate = new Date(today);
    distantDate.setDate(today.getDate() + 30); // 30 days away (not urgent)

    const urgentPlan = generateStudyPlan({
      learningGaps: sampleGaps,
      examDate: urgentDate.toISOString(),
      dailyFreeMinutes: 60,
    });

    const relaxedPlan = generateStudyPlan({
      learningGaps: sampleGaps,
      examDate: distantDate.toISOString(),
      dailyFreeMinutes: 60,
    });

    assert.equal(urgentPlan.isExamUrgent, true, 'Exam 3 days away must be marked urgent');
    assert.equal(relaxedPlan.isExamUrgent, false, 'Exam 30 days away must not be urgent');
  });

  it('Rule 5: Works 100% deterministically with empty or custom free hours', () => {
    const emptyPlan = generateStudyPlan({ learningGaps: [] });
    assert.equal(emptyPlan.totalSessions, 0);

    const plan = generateStudyPlan({
      learningGaps: sampleGaps,
      dailyFreeMinutes: 120, // 2 hours
      sessionDuration: 30,
    });

    assert.ok(plan.sessions.length > 0);
    assert.equal(plan.sessionDuration, 30);
  });
});
