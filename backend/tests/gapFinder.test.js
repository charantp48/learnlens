import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { findLearningGaps } from '../src/services/gapFinder.js';

describe('Core Logic: Prerequisite Gap Finder (Pure JS)', () => {
  // Test topics metadata
  const topics = [
    { id: 't1', name: 'Number Systems', order_index: 1 },
    { id: 't2', name: 'Real Numbers & Radicals', order_index: 2 },
    { id: 't3', name: 'Algebraic Identities & Factoring', order_index: 3 },
    { id: 't4', name: 'Quadratic Equations', order_index: 4 },
  ];

  // Prerequisites graph: t2 requires t1; t4 requires t3
  const prereqGraph = {
    t2: ['t1'],
    t4: ['t3'],
  };

  it('Rule 1: Flags a topic as weak when accuracy is below the 60% threshold', () => {
    const answers = [
      { topicId: 't1', topicName: 'Number Systems', isCorrect: true, confidence: 'sure' },
      { topicId: 't1', topicName: 'Number Systems', isCorrect: true, confidence: 'sure' },
      // t4: 0 correct out of 2 = 0%
      { topicId: 't4', topicName: 'Quadratic Equations', isCorrect: false, confidence: 'not_sure' },
      { topicId: 't4', topicName: 'Quadratic Equations', isCorrect: false, confidence: 'not_sure' },
    ];

    const result = findLearningGaps(answers, prereqGraph, topics, { weakThreshold: 0.60 });

    const t1 = result.topicStats.find((t) => t.topicId === 't1');
    const t4 = result.topicStats.find((t) => t.topicId === 't4');

    assert.equal(t1.isWeak, false, 'Number Systems (100%) should not be weak');
    assert.equal(t4.isWeak, true, 'Quadratic Equations (0%) should be marked weak');
    assert.equal(result.weakTopics.length, 1);
  });

  it('Rule 2: Answers marked "guessing" count as weaker evidence even when correct', () => {
    // 1 question answered correctly, but marked "guessing"
    const answers = [
      { topicId: 't4', topicName: 'Quadratic Equations', isCorrect: true, confidence: 'guessing' },
    ];

    const result = findLearningGaps(answers, prereqGraph, topics, {
      weakThreshold: 0.60,
      weights: { guessing: 0.50, sure: 1.0, not_sure: 0.8 },
    });

    const t4 = result.topicStats.find((t) => t.topicId === 't4');

    assert.equal(t4.rawCorrect, 1, 'Raw score is 1 out of 1');
    assert.equal(t4.rawAccuracy, 1.0, 'Raw accuracy is 100%');
    assert.equal(t4.weightedAccuracy, 0.50, 'Weighted accuracy is down-weighted to 50% due to guessing');
    assert.equal(t4.isWeak, true, 'Topic must be flagged as weak because 50% < 60% threshold');
  });

  it('Rule 3: Prerequisite tracing walks graph and flags earliest weak prerequisite as root cause', () => {
    // Student struggled in Quadratic Equations (t4) AND Algebraic Factoring (t3)
    const answers = [
      { topicId: 't3', topicName: 'Algebraic Identities & Factoring', isCorrect: false, confidence: 'guessing' },
      { topicId: 't4', topicName: 'Quadratic Equations', isCorrect: false, confidence: 'not_sure' },
    ];

    const result = findLearningGaps(answers, prereqGraph, topics);

    const gapT4 = result.learningGaps.find((g) => g.topicId === 't4');

    assert.ok(gapT4, 'A learning gap must be created for Quadratic Equations');
    assert.equal(
      gapT4.rootPrerequisiteId,
      't3',
      'Root cause must be identified as Algebraic Factoring (t3)'
    );
    assert.equal(
      gapT4.rootPrerequisiteName,
      'Algebraic Identities & Factoring'
    );
  });

  it('Rule 4: Stores readable evidence text explaining the diagnosed root cause', () => {
    const answers = [
      { topicId: 't3', topicName: 'Algebraic Identities & Factoring', isCorrect: false, confidence: 'guessing' },
      { topicId: 't4', topicName: 'Quadratic Equations', isCorrect: false, confidence: 'not_sure' },
    ];

    const result = findLearningGaps(answers, prereqGraph, topics);
    const gap = result.learningGaps.find((g) => g.topicId === 't4');

    assert.ok(gap.reason.length > 20, 'Reason evidence text must not be empty');
    assert.ok(gap.reason.includes('Quadratic Equations'), 'Evidence mentions target topic');
    assert.ok(gap.reason.includes('Algebraic Identities & Factoring'), 'Evidence mentions root prerequisite');
    assert.ok(gap.reason.includes('accuracy'), 'Evidence includes diagnostic numbers');
  });

  it('Rule 5: Multi-hop prerequisite DAG traversal finds the earliest foundational ancestor', () => {
    // Extended chain: t3 -> t2 -> t1
    const deepGraph = {
      t4: ['t3'],
      t3: ['t2'],
      t2: ['t1'],
    };

    const answers = [
      { topicId: 't1', topicName: 'Number Systems', isCorrect: false, confidence: 'guessing' },
      { topicId: 't4', topicName: 'Quadratic Equations', isCorrect: false, confidence: 'guessing' },
    ];

    const result = findLearningGaps(answers, deepGraph, topics);
    const gap = result.learningGaps.find((g) => g.topicId === 't4');

    assert.equal(gap.rootPrerequisiteId, 't1', 'Must walk all the way back to Number Systems (t1)');
  });
});
