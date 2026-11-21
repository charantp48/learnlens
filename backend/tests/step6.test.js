import assert from 'assert';

async function runStep6Tests() {
  console.log('Testing Student & Parent Teacher Note Views, Rank, and Study Planner Feed (Step 6)...');

  const teacherA_id = '00000000-0000-0000-0000-000000000002'; // Mr. Rajesh Rao (Class 11-A)
  const studentA_id = '00000000-0000-0000-0000-000000000001'; // Priya Sharma (Class 11-A)
  const studentB_id = '00000000-0000-0000-0000-000000000006'; // Ananya Sen (Class 11-A)
  const studentC_id = '00000000-0000-0000-0000-000000000007'; // Arjun Sharma (Class 9-B)
  const parentSunita_id = '00000000-0000-0000-0000-000000000003'; // Sunita Sharma (Parent of Priya & Arjun)
  const parentAmit_id = '00000000-0000-0000-0000-000000000008'; // Amit Verma (Parent of Rahul Verma)

  // -------------------------------------------------------------
  // 1. Teacher Sets Clarification for Student B (Ananya Sen)
  // -------------------------------------------------------------
  const clarPayload = {
    studentId: studentB_id,
    teacherId: teacherA_id,
    teacherName: 'Mr. Rajesh Rao',
    status: 'needs_extra_help',
    topics: ['Recursion & Stack Frames', 'Algebraic Identities & Factoring'],
    comment: 'Ananya needs targeted practice on stack frames and algebraic factorization this week.',
  };

  const clarRes = await fetch('http://localhost:5000/api/teacher/clarifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'teacher',
      'x-user-id': teacherA_id,
      'x-user-email': 'rajesh.rao@learnlens.edu',
    },
    body: JSON.stringify(clarPayload),
  });

  assert.strictEqual(clarRes.status, 200);
  const clarData = await clarRes.json();
  assert.strictEqual(clarData.status, 'ok');
  assert.strictEqual(clarData.clarification.status, 'needs_extra_help');
  console.log('✔ Teacher successfully saved clarification for Ananya Sen');

  // -------------------------------------------------------------
  // 2. Student Views Own Teacher Clarification Note
  // -------------------------------------------------------------
  const studentOwnRes = await fetch(`http://localhost:5000/api/teacher/clarifications/student/${studentB_id}`, {
    headers: {
      'x-user-role': 'student',
      'x-user-id': studentB_id,
      'x-user-email': 'ananya.sen@learnlens.edu',
    },
  });

  assert.strictEqual(studentOwnRes.status, 200);
  const studentOwnData = await studentOwnRes.json();
  assert(studentOwnData.clarification, 'Clarification must exist for student');
  assert.strictEqual(studentOwnData.clarification.status, 'needs_extra_help');
  assert.strictEqual(studentOwnData.clarification.comment, clarPayload.comment);
  assert.deepStrictEqual(studentOwnData.clarification.topics, clarPayload.topics);
  console.log('✔ Student Ananya successfully viewed her own teacher guidance note');

  // -------------------------------------------------------------
  // 3. RLS: Student CANNOT view another student\'s teacher note
  // -------------------------------------------------------------
  const studentUnauthorizedRes = await fetch(`http://localhost:5000/api/teacher/clarifications/student/${studentB_id}`, {
    headers: {
      'x-user-role': 'student',
      'x-user-id': studentA_id,
      'x-user-email': 'priya.sharma@learnlens.edu',
    },
  });

  assert.strictEqual(studentUnauthorizedRes.status, 403);
  console.log('✔ RLS Verified: Student Priya forbidden (403) from viewing Ananya\'s teacher note');

  // -------------------------------------------------------------
  // 4. Parent Views Linked Child Clarification and Rank
  // -------------------------------------------------------------
  const parentChildrenRes = await fetch('http://localhost:5000/api/parent/children', {
    headers: {
      'x-user-role': 'parent',
      'x-user-id': parentSunita_id,
      'x-user-email': 'sunita.sharma@learnlens.edu',
    },
  });

  assert.strictEqual(parentChildrenRes.status, 200);
  const parentChildrenData = await parentChildrenRes.json();
  assert(Array.isArray(parentChildrenData.children), 'Parent children must be array');
  assert(parentChildrenData.children.length >= 2, 'Sunita Sharma must have at least 2 linked children');

  const priya = parentChildrenData.children.find((c) => c.name === 'Priya Sharma');
  assert(priya, 'Priya Sharma must be in Sunita\'s children list');
  assert(priya.rank, 'Child must have rank snapshot');
  assert(priya.rank.class_rank, 'Class rank must be present');
  console.log(`✔ Parent Sunita viewed linked child Priya (Rank ${priya.rank.class_rank} of ${priya.rank.class_total_students})`);

  // -------------------------------------------------------------
  // 5. Parent Views Linked Child Teacher Note
  // -------------------------------------------------------------
  const parentPriyaNoteRes = await fetch(`http://localhost:5000/api/teacher/clarifications/student/${studentA_id}`, {
    headers: {
      'x-user-role': 'parent',
      'x-user-id': parentSunita_id,
      'x-user-email': 'sunita.sharma@learnlens.edu',
    },
  });

  assert.strictEqual(parentPriyaNoteRes.status, 200);
  console.log('✔ Parent Sunita successfully retrieved teacher note for linked child Priya');

  // -------------------------------------------------------------
  // 6. RLS: Parent CANNOT view unlinked student\'s teacher note or rank
  // -------------------------------------------------------------
  const parentUnlinkedRankRes = await fetch(`http://localhost:5000/api/quiz/ranks/student/${studentB_id}`, {
    headers: {
      'x-user-role': 'parent',
      'x-user-id': parentSunita_id,
      'x-user-email': 'sunita.sharma@learnlens.edu',
    },
  });

  assert.strictEqual(parentUnlinkedRankRes.status, 403);
  console.log('✔ RLS Verified: Parent Sunita forbidden (403) from viewing unlinked student Ananya\'s rank');

  const parentUnlinkedClarRes = await fetch(`http://localhost:5000/api/teacher/clarifications/student/${studentB_id}`, {
    headers: {
      'x-user-role': 'parent',
      'x-user-id': parentSunita_id,
      'x-user-email': 'sunita.sharma@learnlens.edu',
    },
  });

  assert.strictEqual(parentUnlinkedClarRes.status, 403);
  console.log('✔ RLS Verified: Parent Sunita forbidden (403) from viewing unlinked student Ananya\'s teacher note');

  // -------------------------------------------------------------
  // 7. Study Planner Feeds Teacher Clarification Topics
  // -------------------------------------------------------------
  const plannerRes = await fetch(`http://localhost:5000/api/planner/${studentB_id}`, {
    headers: {
      'x-user-role': 'student',
      'x-user-id': studentB_id,
      'x-user-email': 'ananya.sen@learnlens.edu',
    },
  });

  assert.strictEqual(plannerRes.status, 200);
  const plannerData = await plannerRes.json();
  assert.strictEqual(plannerData.status, 'ok');
  assert(plannerData.teacherClarification, 'Teacher clarification must be attached to study plan');
  assert(plannerData.teacherPrioritySessionsCount > 0, 'Plan must schedule teacher priority sessions');

  const teacherSessions = plannerData.sessions.filter((s) => s.isTeacherPriority);
  assert(teacherSessions.length > 0, 'At least one session must be flagged as teacher priority');
  console.log(`✔ Study planner fed teacher note into schedule (${teacherSessions.length} teacher priority sessions scheduled)`);

  // Verify custom generation endpoint also incorporates teacher clarification
  const customPlanRes = await fetch('http://localhost:5000/api/planner/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: studentB_id,
      dailyFreeMinutes: 60,
      sessionDuration: 25,
    }),
  });

  assert.strictEqual(customPlanRes.status, 200);
  const customPlanData = await customPlanRes.json();
  assert(customPlanData.teacherPrioritySessionsCount > 0, 'Custom plan generation must include teacher priority sessions');
  console.log('✔ Adaptive plan generation with studentId auto-detected and scheduled teacher clarification');

  console.log('\n--- ALL STEP 6 TESTS PASSED SUCCESSFULLY! ---');
}

runStep6Tests().catch((err) => {
  console.error('\n❌ STEP 6 TEST FAILED:', err);
  process.exit(1);
});
