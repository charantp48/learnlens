import assert from 'assert';

async function runStep8EndToEndTests() {
  console.log('==============================================================');
  console.log('🚀 Running Complete End-to-End Real Cohort Verification (Step 8)');
  console.log('==============================================================\n');

  const timestamp = Date.now();
  const className = `Class 10-A`;
  const teacherEmail = `vikram.${timestamp}@realcohort.edu`;
  const student1Email = `kavya.${timestamp}@realcohort.edu`;
  const student2Email = `rohan.${timestamp}@realcohort.edu`;
  const parent1Email = `suresh.${timestamp}@realcohort.edu`;

  // -------------------------------------------------------------------------
  // PHASE 1: Admin Creates Class Cohort
  // -------------------------------------------------------------------------
  console.log('--- Phase 1: Admin Creates New Academic Cohort ---');
  const createClassRes = await fetch('http://localhost:5000/api/admin/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: className,
      section: 'A',
      subject: 'Mathematics & Science',
      teacher: 'Mr. Vikram Sarabhai',
    }),
  });

  assert.strictEqual(createClassRes.status, 201);
  const classData = await createClassRes.json();
  assert.strictEqual(classData.status, 'ok');
  assert(classData.class.id, 'Class ID must be returned');
  const classId = classData.class.id;
  console.log(`✔ Created Cohort: ${className} (ID: ${classId})`);

  // -------------------------------------------------------------------------
  // PHASE 2: Admin Creates Real Teacher Account
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 2: Admin Creates Real Teacher with Temp Password ---');
  const createTeacherRes = await fetch('http://localhost:5000/api/admin/users/create-single', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Mr. Vikram Sarabhai',
      email: teacherEmail,
      role: 'teacher',
      className: className,
      subject: 'Mathematics',
    }),
  });

  assert.strictEqual(createTeacherRes.status, 201);
  const teacherData = await createTeacherRes.json();
  assert(teacherData.user.id, 'Teacher ID must exist');
  assert(teacherData.temporaryPassword.startsWith('Lens#'), 'Temporary password must follow Lens# pattern');
  assert.strictEqual(teacherData.user.must_change_password, true);
  assert.strictEqual(teacherData.user.is_demo, false);
  const teacherId = teacherData.user.id;
  const teacherTempPassword = teacherData.temporaryPassword;
  console.log(`✔ Created Teacher: Mr. Vikram Sarabhai (${teacherEmail}), Temp Password: ${teacherTempPassword}`);

  // -------------------------------------------------------------------------
  // PHASE 3: Admin Batch-Onboards Real Students & Parents via CSV
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 3: Admin Batch-Onboards Students & Parents via CSV ---');
  const csvRows = [
    { role: 'student', full_name: 'Kavya Nair', email: student1Email, class_name: className },
    { role: 'student', full_name: 'Rohan Gupta', email: student2Email, class_name: className },
    { role: 'parent', full_name: 'Suresh Nair', email: parent1Email, class_name: '', linked_student_email: student1Email },
  ];

  // 3a. CSV Pre-validation
  const csvPreviewRes = await fetch('http://localhost:5000/api/admin/users/csv-preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows: csvRows }),
  });

  assert.strictEqual(csvPreviewRes.status, 200);
  const previewData = await csvPreviewRes.json();
  assert.strictEqual(previewData.totalRows, 3);
  assert.strictEqual(previewData.validCount, 3);
  assert.strictEqual(previewData.errorCount, 0);
  console.log(`✔ CSV Preview Validated: 3/3 rows valid, 0 errors`);

  // 3b. CSV Import
  const csvImportRes = await fetch('http://localhost:5000/api/admin/users/csv-import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ validRows: previewData.previewRows }),
  });

  assert.strictEqual(csvImportRes.status, 201);
  const importData = await csvImportRes.json();
  assert.strictEqual(importData.importedCount, 3);
  assert.strictEqual(importData.credentials.length, 3);

  const kavyaCred = importData.credentials.find((c) => c.email === student1Email);
  const rohanCred = importData.credentials.find((c) => c.email === student2Email);
  const sureshCred = importData.credentials.find((c) => c.email === parent1Email);

  assert(kavyaCred && kavyaCred.temporaryPassword, 'Kavya temp password must exist');
  assert(rohanCred && rohanCred.temporaryPassword, 'Rohan temp password must exist');
  assert(sureshCred && sureshCred.temporaryPassword, 'Suresh temp password must exist');
  console.log(`✔ CSV Batch Imported: Kavya (${kavyaCred.temporaryPassword}), Rohan (${rohanCred.temporaryPassword}), Suresh (${sureshCred.temporaryPassword})`);

  // -------------------------------------------------------------------------
  // PHASE 4: First Login & Forced Password Change
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 4: First Login & Forced Password Change ---');
  // 4a. Kavya logs in with temp password
  const kavyaLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: student1Email, password: kavyaCred.temporaryPassword }),
  });

  assert.strictEqual(kavyaLoginRes.status, 200);
  const kavyaLoginData = await kavyaLoginRes.json();
  assert.strictEqual(kavyaLoginData.user.must_change_password, true, 'User must be flagged must_change_password');
  const kavyaId = kavyaLoginData.user.id;
  console.log(`✔ Kavya logged in with temp password: must_change_password = true`);

  // 4b. Kavya changes to permanent password
  const permanentPassword = 'Kavya#Permanent2026';
  const changePwRes = await fetch('http://localhost:5000/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: student1Email,
      currentPassword: kavyaCred.temporaryPassword,
      newPassword: permanentPassword,
    }),
  });

  assert.strictEqual(changePwRes.status, 200);
  const changePwData = await changePwRes.json();
  assert.strictEqual(changePwData.status, 'ok');
  assert.strictEqual(changePwData.user.must_change_password, false);
  console.log(`✔ Kavya permanently changed password`);

  // 4c. Verify login with permanent password succeeds
  const kavyaPermLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: student1Email, password: permanentPassword }),
  });
  assert.strictEqual(kavyaPermLoginRes.status, 200);
  const kavyaPermLoginData = await kavyaPermLoginRes.json();
  assert.strictEqual(kavyaPermLoginData.user.must_change_password, false);
  console.log(`✔ Kavya logged in with permanent password: must_change_password = false`);

  // Also get Rohan and Suresh user IDs
  const usersRes = await fetch('http://localhost:5000/api/admin/metrics');
  const metricsData = await usersRes.json();
  const rohanUser = metricsData.users.find((u) => u.email === student2Email);
  const sureshUser = metricsData.users.find((u) => u.email === parent1Email);
  const rohanId = rohanUser.id;
  const sureshId = sureshUser.id;

  // -------------------------------------------------------------------------
  // PHASE 5: Server-Side Quiz Grading & Automatic Report Generation
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 5: Server-Side Quiz Grading (Level-Based Marks) ---');
  // 5a. Kavya submits test (Level 1, Level 2, Level 3 answers all correct)
  // Expected: L1=1m, L2=2m, L3=3m => total = 6/6 marks (100%), Level 3
  const kavyaAttemptId = `att-kavya-${timestamp}`;
  const kavyaSubmitRes = await fetch('http://localhost:5000/api/quiz/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attemptId: kavyaAttemptId,
      studentId: kavyaId,
      studentName: 'Kavya Nair',
      studentEmail: student1Email,
      className: className,
      subject: 'Mathematics',
      answers: [
        { questionId: 'math-01', selectedOption: 'C', confidence: 'sure' }, // L1 = 1m (correct: C)
        { questionId: 'math-02', selectedOption: 'B', confidence: 'sure' }, // L2 = 2m (correct: B)
        { questionId: 'math-03', selectedOption: 'B', confidence: 'guessing' }, // L3 = 3m (correct: B, guessing gives full mark)
      ],
    }),
  });

  assert.strictEqual(kavyaSubmitRes.status, 200);
  const kavyaReport = await kavyaSubmitRes.json();
  assert.strictEqual(kavyaReport.marks_earned, 6);
  assert.strictEqual(kavyaReport.marks_possible, 6);
  assert.strictEqual(kavyaReport.percentage, 100.0);
  assert.strictEqual(kavyaReport.level_achieved, 'Level 3: Advanced Mastery');
  console.log(`✔ Kavya scored 6/6 (100%) - Level 3: Advanced Mastery`);

  // 5b. Rohan submits test (L1 correct, L2 wrong, L3 wrong)
  // Expected: L1=1m, L2=0m, L3=0m => total = 1/6 marks (16.7%), Level 1
  const rohanAttemptId = `att-rohan-${timestamp}`;
  const rohanSubmitRes = await fetch('http://localhost:5000/api/quiz/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attemptId: rohanAttemptId,
      studentId: rohanId,
      studentName: 'Rohan Gupta',
      studentEmail: student2Email,
      className: className,
      subject: 'Mathematics',
      answers: [
        { questionId: 'math-01', selectedOption: 'C', confidence: 'sure' }, // L1 = 1m (correct: C)
        { questionId: 'math-02', selectedOption: 'D', confidence: 'sure' }, // L2 = 0m (wrong)
        { questionId: 'math-03', selectedOption: 'A', confidence: 'sure' }, // L3 = 0m (wrong)
      ],
    }),
  });

  assert.strictEqual(rohanSubmitRes.status, 200);
  const rohanReport = await rohanSubmitRes.json();
  assert.strictEqual(rohanReport.marks_earned, 1);
  assert.strictEqual(rohanReport.marks_possible, 6);
  assert.strictEqual(rohanReport.level_achieved, 'Level 1: Foundational Review');
  console.log(`✔ Rohan scored 1/6 (16.7%) - Level 1: Foundational Review`);

  // 5c. Duplicate attempt protection
  const duplicateRes = await fetch('http://localhost:5000/api/quiz/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attemptId: kavyaAttemptId,
      studentId: kavyaId,
      answers: [{ questionId: 'math-01', selectedOption: 'C', confidence: 'sure' }],
    }),
  });
  assert.strictEqual(duplicateRes.status, 409);
  console.log(`✔ Duplicate submission protection verified: returned 409 Conflict`);

  // -------------------------------------------------------------------------
  // PHASE 6: Ranks Calculation & Access Control (RLS)
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 6: Real Rankings & Access Control (RLS) ---');
  // 6a. Kavya views own rank
  const kavyaRankRes = await fetch(`http://localhost:5000/api/quiz/ranks/student/${kavyaId}`, {
    headers: {
      'x-user-role': 'student',
      'x-user-id': kavyaId,
      'x-user-email': student1Email,
    },
  });

  assert.strictEqual(kavyaRankRes.status, 200);
  const kavyaRankData = await kavyaRankRes.json();
  assert.strictEqual(kavyaRankData.rank.class_rank, 1);
  console.log(`✔ Kavya is Rank 1 of ${kavyaRankData.rank.class_total_students} in ${className}`);

  // 6b. Kavya tries to view Rohan's rank (Strictly Forbidden - 403)
  const kavyaSpyRes = await fetch(`http://localhost:5000/api/quiz/ranks/student/${rohanId}`, {
    headers: {
      'x-user-role': 'student',
      'x-user-id': kavyaId,
      'x-user-email': student1Email,
    },
  });
  assert.strictEqual(kavyaSpyRes.status, 403);
  console.log(`✔ Student Privacy RLS: Kavya forbidden (403) from viewing Rohan's rank`);

  // -------------------------------------------------------------------------
  // PHASE 7: Teacher Review & Clarification Workflow
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 7: Teacher Review & Clarification ---');
  // 7a. Teacher Vikram checks incoming reports queue
  const incomingRes = await fetch('http://localhost:5000/api/teacher/reports/incoming', {
    headers: {
      'x-user-role': 'teacher',
      'x-user-id': teacherId,
      'x-user-email': teacherEmail,
    },
  });

  assert.strictEqual(incomingRes.status, 200);
  const incomingData = await incomingRes.json();
  const rohanIncoming = incomingData.submissions.find((s) => s.studentId === rohanId);
  assert(rohanIncoming, 'Rohan report must appear in Vikram Sarabhai incoming feed');
  assert.strictEqual(rohanIncoming.isNew, true, 'Report must be flagged as isNew for New badge');
  console.log(`✔ Teacher received incoming report: Rohan Gupta (${rohanIncoming.score}), New Badge = true`);

  // 7b. Teacher Vikram writes clarification for Rohan
  const teacherClarRes = await fetch('http://localhost:5000/api/teacher/clarifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'teacher',
      'x-user-id': teacherId,
      'x-user-email': teacherEmail,
    },
    body: JSON.stringify({
      reportId: rohanReport.reportId,
      studentId: rohanId,
      status: 'needs_extra_help',
      topics: ['Quadratic Equations', 'Algebraic Identities & Factoring'],
      comment: 'Rohan needs extra practice on algebraic factoring and quadratics before progressing.',
    }),
  });

  assert.strictEqual(teacherClarRes.status, 200);
  const teacherClarData = await teacherClarRes.json();
  assert.strictEqual(teacherClarData.status, 'ok');
  assert.strictEqual(teacherClarData.clarification.status, 'needs_extra_help');
  console.log(`✔ Teacher saved clarification for Rohan: status = 'needs_extra_help'`);

  // -------------------------------------------------------------------------
  // PHASE 8: Student & Parent See Teacher Note & Study Planner Feeds Note
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 8: Student & Parent Note Views and Planner Feed ---');
  // 8a. Rohan views own teacher note on dashboard
  const rohanNoteRes = await fetch(`http://localhost:5000/api/teacher/clarifications/student/${rohanId}`, {
    headers: {
      'x-user-role': 'student',
      'x-user-id': rohanId,
      'x-user-email': student2Email,
    },
  });
  assert.strictEqual(rohanNoteRes.status, 200);
  const rohanNoteData = await rohanNoteRes.json();
  assert.strictEqual(rohanNoteData.clarification.status, 'needs_extra_help');
  console.log(`✔ Student Rohan viewed teacher guidance note: "${rohanNoteData.clarification.comment}"`);

  // 8b. Parent Suresh views linked child Kavya's rank and notes
  const parentChildrenRes = await fetch('http://localhost:5000/api/parent/children', {
    headers: {
      'x-user-role': 'parent',
      'x-user-id': sureshId,
      'x-user-email': parent1Email,
    },
  });
  assert.strictEqual(parentChildrenRes.status, 200);
  const parentChildrenData = await parentChildrenRes.json();
  const kavyaChild = parentChildrenData.children.find((c) => c.id === kavyaId);
  assert(kavyaChild, 'Kavya must appear in Suresh children list');
  assert.strictEqual(kavyaChild.rank.class_rank, 1);
  console.log(`✔ Parent Suresh viewed linked child Kavya: Rank ${kavyaChild.rank.class_rank} in ${className}`);

  // 8c. Parent Suresh tries to access Rohan's rank (Strictly Forbidden - 403)
  const parentSpyRes = await fetch(`http://localhost:5000/api/quiz/ranks/student/${rohanId}`, {
    headers: {
      'x-user-role': 'parent',
      'x-user-id': sureshId,
      'x-user-email': parent1Email,
    },
  });
  assert.strictEqual(parentSpyRes.status, 403);
  console.log(`✔ Parent Isolation RLS: Suresh forbidden (403) from viewing unlinked student Rohan's rank`);

  // 8d. Study Planner incorporates teacher clarification topics for Rohan
  const rohanPlannerRes = await fetch(`http://localhost:5000/api/planner/${rohanId}`, {
    headers: {
      'x-user-role': 'student',
      'x-user-id': rohanId,
      'x-user-email': student2Email,
    },
  });
  assert.strictEqual(rohanPlannerRes.status, 200);
  const rohanPlannerData = await rohanPlannerRes.json();
  assert(rohanPlannerData.teacherPrioritySessionsCount > 0, 'Planner must schedule teacher priority sessions');
  const prioritySessions = rohanPlannerData.sessions.filter((s) => s.isTeacherPriority);
  assert(prioritySessions.length > 0, 'Teacher priority session must exist in schedule');
  console.log(`✔ Study Planner scheduled ${prioritySessions.length} teacher-priority sessions for Rohan`);

  // -------------------------------------------------------------------------
  // PHASE 9: Admin School-Wide Monitoring
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 9: Admin Monitoring (Single Page) ---');
  const adminMetricsRes = await fetch('http://localhost:5000/api/admin/metrics');
  assert.strictEqual(adminMetricsRes.status, 200);
  const finalMetrics = await adminMetricsRes.json();

  console.log('✔ Updated Real School Totals:');
  console.log(`   - Students: ${finalMetrics.counts.real.students}`);
  console.log(`   - Teachers: ${finalMetrics.counts.real.teachers}`);
  console.log(`   - Parents:  ${finalMetrics.counts.real.parents}`);
  console.log(`   - Classes:  ${finalMetrics.counts.real.classes}`);
  console.log(`   - Reports:  ${finalMetrics.counts.real.reportsSubmitted}`);

  // Query class filtered reports
  const classReportsRes = await fetch(`http://localhost:5000/api/admin/reports-and-ranks?class=${encodeURIComponent(className)}`);
  assert.strictEqual(classReportsRes.status, 200);
  const classReportsData = await classReportsRes.json();
  assert(classReportsData.reportsAndRanks.length >= 2, 'Class 10-A must have Kavya and Rohan');
  console.log(`✔ Admin filtered reports for '${className}': found ${classReportsData.reportsAndRanks.length} student entries`);

  console.log('\n==============================================================');
  console.log('🎉 ALL END-TO-END ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY! 🎉');
  console.log('==============================================================\n');
}

runStep8EndToEndTests().catch((err) => {
  console.error('\n❌ STEP 8 E2E TEST FAILED:', err);
  process.exit(1);
});
