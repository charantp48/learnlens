/**
 * Pure JavaScript Gap Finder Service (Deterministic Graph Logic, NOT AI)
 * 
 * Rules:
 * 1. Computes topic accuracy from quiz answers; a topic is "weak" below a threshold (default 60%).
 * 2. Answers marked "guessing" count as weaker evidence even when correct (default 0.5 weight).
 * 3. Prerequisite tracing: for each weak topic, walks the topic_prerequisites DAG backwards
 *    and flags the earliest weak prerequisite as the root cause.
 * 4. Generates human-readable evidence strings.
 * 5. Runs 100% deterministically offline with zero external AI dependencies.
 */

export const DEFAULT_CONFIG = {
  weakThreshold: 0.60,      // 60% accuracy threshold
  weights: {
    sure: 1.0,              // Confident and correct = 100% credit
    not_sure: 0.8,          // Uncertain correct = 80% credit
    guessing: 0.5,          // Lucky guess correct = 50% credit (weaker evidence)
  },
};

/**
 * Evaluates quiz answers and identifies weak topics and root prerequisite gaps.
 * 
 * @param {Array} evaluatedAnswers - [{ topicId, topicName, isCorrect, confidence }]
 * @param {Object} prerequisitesGraph - { [topicId]: [prerequisiteTopicId, ...] }
 * @param {Array} topicsMetadata - [{ id, name, order_index }]
 * @param {Object} customConfig - Optional overrides for threshold or weights
 * @returns {Object} { topicStats, weakTopics, learningGaps }
 */
export function findLearningGaps(
  evaluatedAnswers = [],
  prerequisitesGraph = {},
  topicsMetadata = [],
  customConfig = {}
) {
  const config = { ...DEFAULT_CONFIG, ...customConfig };
  const topicMap = new Map();

  // Create metadata lookup
  topicsMetadata.forEach((t) => {
    topicMap.set(t.id, { id: t.id, name: t.name, orderIndex: t.order_index || 1 });
  });

  // Step 1: Calculate topic-level scores & confidence weighting
  const topicStats = {};

  evaluatedAnswers.forEach((ans) => {
    const { topicId, topicName, isCorrect, confidence = 'not_sure' } = ans;
    if (!topicStats[topicId]) {
      const meta = topicMap.get(topicId);
      topicStats[topicId] = {
        topicId,
        topicName: topicName || (meta ? meta.name : 'Unknown Topic'),
        orderIndex: meta ? meta.orderIndex : 1,
        total: 0,
        rawCorrect: 0,
        weightedScore: 0,
        guessingCount: 0,
        sureCount: 0,
        notSureCount: 0,
      };
    }

    const stat = topicStats[topicId];
    stat.total += 1;

    if (confidence === 'guessing') stat.guessingCount += 1;
    else if (confidence === 'sure') stat.sureCount += 1;
    else stat.notSureCount += 1;

    if (isCorrect) {
      stat.rawCorrect += 1;
      const weight = config.weights[confidence] !== undefined ? config.weights[confidence] : 1.0;
      stat.weightedScore += weight;
    }
  });

  // Compute final accuracies & mark weak topics (< 60%)
  const weakTopics = [];
  Object.values(topicStats).forEach((stat) => {
    stat.rawAccuracy = stat.total > 0 ? stat.rawCorrect / stat.total : 0;
    stat.weightedAccuracy = stat.total > 0 ? stat.weightedScore / stat.total : 0;
    stat.accuracyPercentage = Math.round(stat.weightedAccuracy * 100);
    stat.isWeak = stat.weightedAccuracy < config.weakThreshold;

    if (stat.isWeak) {
      weakTopics.push(stat);
    }
  });

  // Sort weak topics by curriculum order (earlier topics first)
  weakTopics.sort((a, b) => a.orderIndex - b.orderIndex);

  // Step 2: Traverse Prerequisite Graph to find Root Cause
  const learningGaps = [];

  weakTopics.forEach((weakTopic) => {
    const rootPrereq = findEarliestWeakPrerequisite(
      weakTopic.topicId,
      prerequisitesGraph,
      topicStats,
      topicMap
    );

    let reason = '';
    if (rootPrereq && rootPrereq.topicId !== weakTopic.topicId) {
      const rootAcc = Math.round(rootPrereq.weightedAccuracy * 100);
      reason = `Struggle detected in "${weakTopic.topicName}" (${weakTopic.accuracyPercentage}% weighted accuracy). Graph traversal identified foundational gap in prerequisite: "${rootPrereq.topicName}" (${rootAcc}% accuracy). Resolving ${rootPrereq.topicName} is required before advancing in ${weakTopic.topicName}.`;
    } else {
      reason = `Struggle detected in "${weakTopic.topicName}" (${weakTopic.accuracyPercentage}% weighted accuracy). Conceptual practice and review recommended to achieve mastery threshold (60%+).`;
    }

    learningGaps.push({
      topicId: weakTopic.topicId,
      topicName: weakTopic.topicName,
      accuracy: weakTopic.accuracyPercentage,
      rawAccuracy: Math.round(weakTopic.rawAccuracy * 100),
      rootPrerequisiteId: rootPrereq ? rootPrereq.topicId : null,
      rootPrerequisiteName: rootPrereq ? rootPrereq.topicName : null,
      prerequisiteChain: getPrerequisitePath(weakTopic.topicId, prerequisitesGraph, topicMap),
      reason,
      status: 'active',
      diagnosedAt: new Date().toISOString(),
    });
  });

  return {
    thresholdUsed: config.weakThreshold,
    topicStats: Object.values(topicStats),
    weakTopics,
    learningGaps,
  };
}

/**
 * Recursively walks the prerequisite DAG backwards to find the earliest weak prerequisite.
 */
function findEarliestWeakPrerequisite(topicId, graph, topicStats, topicMap, visited = new Set()) {
  if (visited.has(topicId)) return null;
  visited.add(topicId);

  const directPrereqs = graph[topicId] || [];
  if (directPrereqs.length === 0) return null;

  let earliestWeakAncestor = null;

  for (const prereqId of directPrereqs) {
    // 1. Recurse deeper into prerequisite's prerequisites (BFS/DFS ancestor search)
    const deeperAncestor = findEarliestWeakPrerequisite(
      prereqId,
      graph,
      topicStats,
      topicMap,
      visited
    );

    if (deeperAncestor) {
      if (!earliestWeakAncestor || deeperAncestor.orderIndex < earliestWeakAncestor.orderIndex) {
        earliestWeakAncestor = deeperAncestor;
      }
    }

    // 2. Check if this direct prerequisite itself is weak or struggling
    const prereqStat = topicStats[prereqId];
    const isPrereqWeak = prereqStat ? prereqStat.isWeak : false;

    if (isPrereqWeak) {
      const candidate = prereqStat;
      if (!earliestWeakAncestor || candidate.orderIndex < earliestWeakAncestor.orderIndex) {
        earliestWeakAncestor = candidate;
      }
    }
  }

  // 3. If direct prerequisite has no deeper weak ancestor, but direct prereq is known
  if (!earliestWeakAncestor && directPrereqs.length > 0) {
    const firstPrereqId = directPrereqs[0];
    const meta = topicMap.get(firstPrereqId);
    const stat = topicStats[firstPrereqId];
    return stat || (meta ? { topicId: meta.id, topicName: meta.name, weightedAccuracy: 0, orderIndex: meta.orderIndex } : null);
  }

  return earliestWeakAncestor;
}

/**
 * Returns the breadcrumb path from root foundational topic to the target topic.
 */
function getPrerequisitePath(topicId, graph, topicMap) {
  const path = [];
  let current = topicId;

  while (current) {
    const meta = topicMap.get(current);
    path.unshift(meta ? meta.name : current);
    const prereqs = graph[current] || [];
    current = prereqs.length > 0 ? prereqs[0] : null;
  }

  return path;
}
