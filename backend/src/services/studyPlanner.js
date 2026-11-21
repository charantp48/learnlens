/**
 * Pure JavaScript Adaptive Study Planner (Deterministic Logic, NOT AI)
 * 
 * Rules:
 * 1. Output short sessions strictly sized to 25 or 30 minutes (prevents mental fatigue).
 * 2. Prerequisite topics scheduled FIRST before target weak topics.
 * 3. Weaker topics receive more sessions (lower accuracy = more practice).
 * 4. Closer exam dates accelerate session density (tighter daily packing).
 * 5. Runs 100% offline with zero external AI or network calls.
 */

export const PLANNER_CONFIG = {
  defaultSessionDuration: 25, // 25 minutes (Pomodoro interval)
  maxSessionDuration: 30,     // 30 minutes max
  minSessionDuration: 20,
};

/**
 * Generates an adaptive, prerequisite-first study schedule.
 * 
 * @param {Object} params
 * @param {Array} params.learningGaps - [{ topicId, topicName, accuracy, rootPrerequisiteId, rootPrerequisiteName }]
 * @param {Number} [params.dailyFreeMinutes=60] - Student free time per day in minutes
 * @param {String|Date} [params.examDate=null] - Optional upcoming exam date
 * @param {Date} [params.startDate=new Date()] - Start date for the schedule
 * @param {Number} [params.sessionDuration=25] - Duration per session (25 to 30 mins)
 * @returns {Object} { totalSessions, totalMinutes, sessions, isExamUrgent }
 */
export function generateStudyPlan({
  learningGaps = [],
  dailyFreeMinutes = 60,
  examDate = null,
  startDate = new Date(),
  sessionDuration = PLANNER_CONFIG.defaultSessionDuration,
  teacherClarification = null,
} = {}) {
  // Normalize session duration to 25-30 minutes
  const validDuration = Math.min(
    PLANNER_CONFIG.maxSessionDuration,
    Math.max(PLANNER_CONFIG.defaultSessionDuration, Number(sessionDuration) || 25)
  );

  // Calculate exam proximity
  let daysUntilExam = null;
  let isExamUrgent = false;

  if (examDate) {
    const target = new Date(examDate);
    const start = new Date(startDate);
    const diffTime = target.getTime() - start.getTime();
    daysUntilExam = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    isExamUrgent = daysUntilExam <= 7;
  }

  // Determine daily session capacity based on student free time
  // E.g. 60 mins free / 25 mins = 2 sessions per day
  const sessionsPerDay = Math.max(1, Math.floor(dailyFreeMinutes / validDuration));

  // If exam is very close, maximize capacity
  const effectiveSessionsPerDay = isExamUrgent ? Math.min(3, sessionsPerDay + 1) : sessionsPerDay;

  // Step 1: Incorporate Teacher Recommended Focus Topics into Learning Gaps
  const effectiveGaps = [...learningGaps];
  const teacherTopics = teacherClarification?.topics || [];

  if (teacherClarification && teacherTopics.length > 0) {
    teacherTopics.forEach((teacherTopicName, idx) => {
      const existing = effectiveGaps.find(
        (g) => (g.topicName || '').toLowerCase() === teacherTopicName.toLowerCase()
      );
      if (existing) {
        existing.isTeacherRecommended = true;
        existing.teacherStatus = teacherClarification.status;
        existing.teacherComment = teacherClarification.comment;
      } else {
        effectiveGaps.unshift({
          topicId: `teacher-focus-${idx + 1}`,
          topicName: teacherTopicName,
          accuracy: teacherClarification.status === 'needs_extra_help' ? 30 : 45,
          isTeacherRecommended: true,
          teacherStatus: teacherClarification.status,
          teacherComment: teacherClarification.comment,
        });
      }
    });
  }

  // Step 2: Build Priority Topics Queue
  // Rule 2: Root prerequisite topics MUST be placed before target weak topics
  // Teacher priority topics are scheduled at highest priority after prerequisites
  const sessionQueue = [];

  effectiveGaps.forEach((gap) => {
    // Determine session count based on accuracy (Rule 3)
    let sessionsNeeded = 2;
    if (gap.accuracy < 35 || gap.isTeacherRecommended) sessionsNeeded = 3;
    else if (gap.accuracy < 60) sessionsNeeded = 2;
    else sessionsNeeded = 1;

    // A. If gap has a foundational prerequisite, schedule prerequisite sessions FIRST
    if (gap.rootPrerequisiteId && gap.rootPrerequisiteName) {
      // Allocate foundational sessions
      const prereqSessions = Math.max(1, Math.ceil(sessionsNeeded * 0.6));
      for (let i = 1; i <= prereqSessions; i++) {
        sessionQueue.push({
          topicId: gap.rootPrerequisiteId,
          topicName: gap.rootPrerequisiteName,
          isPrerequisiteRoot: true,
          isTeacherPriority: false,
          targetTopicName: gap.topicName,
          sessionIndex: i,
          totalForTopic: prereqSessions,
          focusNotes: `Foundational Root Fix (${i}/${prereqSessions}): Master core rules of ${gap.rootPrerequisiteName} before studying ${gap.topicName}.`,
        });
      }
    }

    // B. Target topic sessions come AFTER prerequisite sessions
    for (let i = 1; i <= sessionsNeeded; i++) {
      const note = gap.isTeacherRecommended
        ? `Teacher Priority Focus (${i}/${sessionsNeeded}): ${gap.teacherComment || `Focus on ${gap.topicName} as recommended by your teacher.`}`
        : `Target Topic Practice (${i}/${sessionsNeeded}): Apply mastered concepts to solve ${gap.topicName} problems.`;

      sessionQueue.push({
        topicId: gap.topicId,
        topicName: gap.topicName,
        isPrerequisiteRoot: false,
        isTeacherPriority: !!gap.isTeacherRecommended,
        targetTopicName: gap.topicName,
        sessionIndex: i,
        totalForTopic: sessionsNeeded,
        focusNotes: note,
      });
    }
  });

  // Step 3: Allocate Sessions across Calendar Days
  const scheduledSessions = [];
  const startObj = new Date(startDate);
  startObj.setHours(17, 0, 0, 0); // Default study time: 5:00 PM

  let currentDayOffset = 0;
  let dailyCount = 0;

  sessionQueue.forEach((item, index) => {
    // If daily capacity reached, roll over to the next day
    if (dailyCount >= effectiveSessionsPerDay) {
      currentDayOffset += 1;
      dailyCount = 0;
    }

    const sessionDate = new Date(startObj);
    sessionDate.setDate(sessionDate.getDate() + currentDayOffset);

    // Calculate start time: 5:00 PM, 5:35 PM, etc.
    const startMinutes = 17 * 60 + dailyCount * (validDuration + 5);
    const startHour = Math.floor(startMinutes / 60);
    const startMin = startMinutes % 60;
    const timeString = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}:00`;
    const dateString = sessionDate.toISOString().split('T')[0];

    scheduledSessions.push({
      id: `plan-${index + 1}-${Date.now().toString().slice(-6)}`,
      topicId: item.topicId,
      topicName: item.topicName,
      isPrerequisite: item.isPrerequisiteRoot,
      isPrerequisiteRoot: item.isPrerequisiteRoot,
      isTeacherPriority: !!item.isTeacherPriority,
      targetTopicName: item.targetTopicName,
      scheduledDate: dateString,
      startTime: timeString,
      duration: validDuration,
      durationMinutes: validDuration,
      status: 'planned',
      description: item.focusNotes,
      focusNotes: item.focusNotes,
      day: currentDayOffset + 1,
      dayNumber: currentDayOffset + 1,
      sessionNumber: dailyCount + 1,
    });

    dailyCount += 1;
  });

  return {
    totalSessions: scheduledSessions.length,
    totalMinutes: scheduledSessions.length * validDuration,
    sessionDuration: validDuration,
    dailyFreeMinutes,
    examDate: examDate || null,
    daysUntilExam,
    isExamUrgent,
    sessions: scheduledSessions,
    teacherRecommendation: teacherClarification
      ? {
          status: teacherClarification.status,
          topics: teacherClarification.topics,
          comment: teacherClarification.comment,
          teacherName: teacherClarification.teacher_name || 'Teacher',
        }
      : null,
    prerequisiteSessionsCount: scheduledSessions.filter((s) => s.isPrerequisite).length,
    teacherPrioritySessionsCount: scheduledSessions.filter((s) => s.isTeacherPriority).length,
  };
}
