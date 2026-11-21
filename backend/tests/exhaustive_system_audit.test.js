import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

async function runExhaustiveSystemAudit() {
  console.log('==============================================================');
  console.log('🧪 Starting LearnLens Exhaustive Multi-Possibility System Audit');
  console.log('==============================================================\n');

  let testsPassed = 0;
  const pass = (msg) => {
    testsPassed++;
    console.log(`  ✔ [PASS] ${msg}`);
  };

  // -------------------------------------------------------------
  // SECTION 1: Single-Server Health & SPA Routing
  // -------------------------------------------------------------
  console.log('--- 1. Testing Single-Server Health & SPA Static Routing ---');

  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert.strictEqual(healthRes.status, 200);
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'ok');
  pass('Server health check returns 200 OK');

  const dbHealthRes = await fetch(`${BASE_URL}/api/health/db`);
  assert.strictEqual(dbHealthRes.status, 200);
  pass('Database health check returns 200 OK');

  const spaRoutes = ['/', '/login', '/student', '/teacher', '/parent', '/admin', '/quiz', '/gaps', '/planner'];
  for (const route of spaRoutes) {
    const res = await fetch(`${BASE_URL}${route}`);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert(text.includes('<div id="root">'), `SPA root missing on ${route}`);
  }
  pass(`All ${spaRoutes.length} SPA frontend routes return 200 OK and serve index.html`);

  const notFoundRes = await fetch(`${BASE_URL}/api/non-existent-endpoint`);
  assert.strictEqual(notFoundRes.status, 404);
  pass('Unmatched /api/* routes cleanly return 404 JSON error');

  // -------------------------------------------------------------
  // SECTION 2: Authentication Possibilities & Edge Cases
  // -------------------------------------------------------------
  console.log('\n--- 2. Testing Authentication Possibilities & Edge Cases ---');

  // 2.1 Missing email
  const noEmailRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '', password: 'Password@123' }),
  });
  assert.strictEqual(noEmailRes.status, 400);
  pass('Login with empty email returns 400 ValidationError');

  // 2.2 Invalid email format
  const badEmailRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', password: 'Password@123' }),
  });
  assert.strictEqual(badEmailRes.status, 400);
  pass('Login with malformed email returns 400 ValidationError');

  // 2.3 Password shorter than 6 characters
  const shortPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@learnlens.edu', password: '123' }),
  });
  assert.strictEqual(shortPassRes.status, 400);
  pass('Login with password < 6 chars returns 400 ValidationError');

  // 2.4 Unknown account email
  const unknownEmailRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nobody_exists@school.edu', password: 'Password@123' }),
  });
  assert.strictEqual(unknownEmailRes.status, 401);
  pass('Login with unregistered email returns 401 AccountNotFound');

  // 2.5 Wrong password for existing account
  const wrongPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@learnlens.edu', password: 'WrongPassword#999' }),
  });
  assert.strictEqual(wrongPassRes.status, 401);
  pass('Login with wrong password returns 401 InvalidCredentials');

  // 2.6 Valid login with Admin@123
  const loginAdmin1 = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@learnlens.edu', password: 'Admin@123' }),
  });
  assert.strictEqual(loginAdmin1.status, 200);
  const adminData1 = await loginAdmin1.json();
  assert.strictEqual(adminData1.user.role, 'admin');
  pass('Admin login with Admin@123 succeeds (200 OK)');

  // 2.7 Valid login with Admin#12345
  const loginAdmin2 = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@learnlens.edu', password: 'Admin#12345' }),
  });
  assert.strictEqual(loginAdmin2.status, 200);
  pass('Admin login with Admin#12345 succeeds (200 OK)');

  // 2.8 Valid login for Teacher
  const loginTeacher = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rajesh.rao@learnlens.edu', password: 'Teacher@123' }),
  });
  assert.strictEqual(loginTeacher.status, 200);
  pass('Teacher login succeeds (200 OK)');

  // 2.9 Valid login for Parent
  const loginParent = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sunita.sharma@learnlens.edu', password: 'Parent@123' }),
  });
  assert.strictEqual(loginParent.status, 200);
  pass('Parent login succeeds (200 OK)');

  // 2.10 Valid login for Student
  const loginStudent = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya.sharma@learnlens.edu', password: 'Student@123' }),
  });
  assert.strictEqual(loginStudent.status, 200);
  pass('Student login succeeds (200 OK)');

  // -------------------------------------------------------------
  // SECTION 3: Admin Provisioning, Temporary Passwords & Forced Change
  // -------------------------------------------------------------
  console.log('\n--- 3. Testing Admin Provisioning, Passwords & Forced Change ---');

  const stamp = Date.now();
  const testStudentEmail = `audit.student.${stamp}@realcohort.edu`;

  // 3.1 Create single student
  const createStudentRes = await fetch(`${BASE_URL}/api/admin/users/create-single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'student',
      name: 'Maya Sen',
      email: testStudentEmail,
      className: 'Class 11-A',
    }),
  });
  assert.strictEqual(createStudentRes.status, 201);
  const createdStudent = await createStudentRes.json();
  const studentTempPass = createdStudent.temporaryPassword;
  assert(studentTempPass && studentTempPass.startsWith('Lens#'));
  pass(`Created real student Maya Sen with temporary password (${studentTempPass})`);

  // 3.2 Login with temporary password -> must_change_password is true
  const tempLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testStudentEmail, password: studentTempPass }),
  });
  assert.strictEqual(tempLoginRes.status, 200);
  const tempLoginData = await tempLoginRes.json();
  assert.strictEqual(tempLoginData.must_change_password, true);
  pass('First-time login with temporary password flags must_change_password = true');

  // 3.3 Change password validation: cannot reuse temporary password
  const reusePassRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testStudentEmail,
      current_password: studentTempPass,
      new_password: studentTempPass,
    }),
  });
  assert.strictEqual(reusePassRes.status, 400);
  pass('Password change rejects reusing identical temporary password (400)');

  // 3.4 Change password validation: new password too short (<6 chars)
  const shortNewPassRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testStudentEmail,
      current_password: studentTempPass,
      new_password: '123',
    }),
  });
  assert.strictEqual(shortNewPassRes.status, 400);
  pass('Password change rejects passwords < 6 chars (400)');

  // 3.5 Successful permanent password change
  const validNewPass = 'Maya#Secure2026';
  const changePassRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testStudentEmail,
      current_password: studentTempPass,
      new_password: validNewPass,
    }),
  });
  assert.strictEqual(changePassRes.status, 200);
  pass('Permanent password change succeeds (200 OK)');

  // 3.6 Login with permanent password -> must_change_password is false
  const permLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testStudentEmail, password: validNewPass }),
  });
  assert.strictEqual(permLoginRes.status, 200);
  const permLoginData = await permLoginRes.json();
  assert.strictEqual(permLoginData.must_change_password, false);
  pass('Login with permanent password flags must_change_password = false');

  // 3.7 Admin Password Reset
  const resetRes = await fetch(`${BASE_URL}/api/admin/users/${createdStudent.user.id}/reset-password`, {
    method: 'POST',
  });
  assert.strictEqual(resetRes.status, 200);
  const resetData = await resetRes.json();
  assert(resetData.temporaryPassword);
  pass(`Admin generated new temporary password on demand (${resetData.temporaryPassword})`);

  // 3.8 Disable account -> subsequent login rejected
  const disableRes = await fetch(`${BASE_URL}/api/admin/users/${createdStudent.user.id}/toggle-status`, {
    method: 'PATCH',
  });
  assert.strictEqual(disableRes.status, 200);

  const disabledLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testStudentEmail, password: resetData.temporaryPassword }),
  });
  assert.strictEqual(disabledLoginRes.status, 403);
  pass('Disabled account login blocked with 403 AccountDisabled');

  // 3.9 Re-enable account
  const enableRes = await fetch(`${BASE_URL}/api/admin/users/${createdStudent.user.id}/toggle-status`, {
    method: 'PATCH',
  });
  assert.strictEqual(enableRes.status, 200);
  pass('Admin toggled status back to active');

  // -------------------------------------------------------------
  // SECTION 4: CSV Batch Validation & Import
  // -------------------------------------------------------------
  console.log('\n--- 4. Testing CSV Batch Preview & Import Edge Cases ---');

  const previewRes = await fetch(`${BASE_URL}/api/admin/users/csv-preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rows: [
        { role: 'student', full_name: 'Tarun Rao', email: `tarun.${stamp}@school.edu`, class_name: 'Class 11-A' },
        { role: 'parent', full_name: 'Gita Rao', email: `gita.${stamp}@home.edu`, linked_student_email: `tarun.${stamp}@school.edu` },
        { role: 'invalid_role', full_name: 'Bad Role User', email: `badrole.${stamp}@school.edu` },
        { role: 'student', full_name: 'Bad Email User', email: 'not_an_email' },
      ],
    }),
  });
  assert.strictEqual(previewRes.status, 200);
  const previewData = await previewRes.json();
  assert.strictEqual(previewData.total, 4);
  assert.strictEqual(previewData.valid_count, 2);
  assert.strictEqual(previewData.error_count, 2);
  pass('CSV preview caught 2 invalid rows (invalid role & invalid email) and passed 2 valid rows');

  // Import the 2 valid rows
  const importRes = await fetch(`${BASE_URL}/api/admin/users/csv-import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ validRows: previewData.previewRows.filter((r) => r.isValid) }),
  });
  assert.strictEqual(importRes.status, 201);
  const importData = await importRes.json();
  assert.strictEqual(importData.importedCount, 2);
  pass('CSV import successfully provisioned 2 valid accounts with temporary passwords');

  // -------------------------------------------------------------
  // SECTION 5: Diagnostic Quiz, Level-Based Grading & Gap Analysis
  // -------------------------------------------------------------
  console.log('\n--- 5. Testing Quiz Grading, Gap Diagnosis & Duplicate Protection ---');

  const attemptId = `audit-attempt-${stamp}`;

  // 5.1 Submit quiz with Level 1, Level 2, and Level 3 answers
  const submitQuizRes = await fetch(`${BASE_URL}/api/quiz/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'student',
      'x-user-id': createdStudent.user.id,
      'x-user-email': testStudentEmail,
    },
    body: JSON.stringify({
      attemptId,
      studentId: createdStudent.user.id,
      studentEmail: testStudentEmail,
      studentName: 'Maya Sen',
      subject: 'Mathematics',
      className: 'Class 11-A',
      answers: [
        { questionId: 'math-01', selectedOption: 'C', confidence: 'sure' },
        { questionId: 'math-02', selectedOption: 'B', confidence: 'sure' },
        { questionId: 'math-03', selectedOption: 'A', confidence: 'guessing' }, // wrong answer
      ],
    }),
  });
  assert.strictEqual(submitQuizRes.status, 200);
  const reportData = await submitQuizRes.json();
  // Level 1 = 1 mark, Level 2 = 2 marks -> 3 marks earned out of 6 possible (50%)
  assert.strictEqual(reportData.marks_earned, 3);
  assert.strictEqual(reportData.marks_possible, 6);
  assert.strictEqual(reportData.percentage, 50);
  assert(reportData.reportId);
  pass('Server-side grading: L1 (1m) + L2 (2m) = 3/6 marks (50%), reportId generated');

  // 5.2 Duplicate submission protection
  const dupQuizRes = await fetch(`${BASE_URL}/api/quiz/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'student',
      'x-user-id': createdStudent.user.id,
      'x-user-email': testStudentEmail,
    },
    body: JSON.stringify({
      attemptId,
      studentId: createdStudent.user.id,
      answers: [{ questionId: 'q-l1-01', level: 1, isCorrect: true }],
    }),
  });
  assert.strictEqual(dupQuizRes.status, 409);
  pass('Duplicate quiz submission blocked with 409 Conflict protection');

  // -------------------------------------------------------------
  // SECTION 6: Competition Ranking & Student Privacy RLS
  // -------------------------------------------------------------
  console.log('\n--- 6. Testing Competition Rankings & Row-Level Security (RLS) ---');

  // 6.1 Student views OWN rank -> 200 OK
  const ownRankRes = await fetch(`${BASE_URL}/api/quiz/ranks/student/${createdStudent.user.id}`, {
    headers: {
      'x-user-role': 'student',
      'x-user-id': createdStudent.user.id,
      'x-user-email': testStudentEmail,
    },
  });
  assert.strictEqual(ownRankRes.status, 200);
  const ownRankData = await ownRankRes.json();
  assert(ownRankData.rank);
  pass(`Student Maya Sen can view own rank (#${ownRankData.rank.classRank} in Class 11-A)`);

  // 6.2 Student attempts to snoop on another student's rank -> 403 Forbidden
  const snoopingRes = await fetch(`${BASE_URL}/api/quiz/ranks/student/00000000-0000-0000-0000-000000000001`, {
    headers: {
      'x-user-role': 'student',
      'x-user-id': createdStudent.user.id,
      'x-user-email': testStudentEmail,
    },
  });
  assert.strictEqual(snoopingRes.status, 403);
  pass('RLS Privacy: Student snooping on classmate is rejected with 403 Forbidden');

  // 6.3 Parent attempts to view unlinked student's rank -> 403 Forbidden
  const parentUnlinkedRes = await fetch(`${BASE_URL}/api/quiz/ranks/student/${createdStudent.user.id}`, {
    headers: {
      'x-user-role': 'parent',
      'x-user-id': '00000000-0000-0000-0000-000000000003', // Sunita (linked only to Priya)
      'x-user-email': 'sunita.sharma@learnlens.edu',
    },
  });
  assert.strictEqual(parentUnlinkedRes.status, 403);
  pass('RLS Privacy: Parent querying unlinked student is rejected with 403 Forbidden');

  // 6.4 Teacher views student's rank -> 200 OK
  const teacherRankRes = await fetch(`${BASE_URL}/api/quiz/ranks/student/${createdStudent.user.id}`, {
    headers: {
      'x-user-role': 'teacher',
      'x-user-id': '00000000-0000-0000-0000-000000000002',
      'x-user-email': 'rajesh.rao@learnlens.edu',
    },
  });
  assert.strictEqual(teacherRankRes.status, 200);
  pass('Institutional Access: Teacher can view student rank (200 OK)');

  // 6.5 Admin views student's rank -> 200 OK
  const adminRankRes = await fetch(`${BASE_URL}/api/quiz/ranks/student/${createdStudent.user.id}`, {
    headers: {
      'x-user-role': 'admin',
      'x-user-id': '00000000-0000-0000-0000-000000000004',
      'x-user-email': 'admin@learnlens.edu',
    },
  });
  assert.strictEqual(adminRankRes.status, 200);
  pass('Institutional Access: Admin can view student rank (200 OK)');

  // -------------------------------------------------------------
  // SECTION 7: Teacher Review & Clarification Workflow
  // -------------------------------------------------------------
  console.log('\n--- 7. Testing Teacher Incoming Queue & Clarifications ---');

  // 7.1 Teacher incoming submissions feed
  const incomingRes = await fetch(`${BASE_URL}/api/teacher/reports/incoming`, {
    headers: {
      'x-user-role': 'teacher',
      'x-user-id': '00000000-0000-0000-0000-000000000002',
      'x-user-email': 'rajesh.rao@learnlens.edu',
    },
  });
  assert.strictEqual(incomingRes.status, 200);
  const incomingData = await incomingRes.json();
  const mayaSub = incomingData.submissions.find((s) => s.studentId === createdStudent.user.id);
  assert(mayaSub, 'Maya Sen report missing in teacher incoming queue');
  assert.strictEqual(mayaSub.isNew, true);
  pass('Teacher received Maya Sen submission with isNew = true ("New" badge active)');

  // 7.2 Teacher submits clarification note
  const clarifyRes = await fetch(`${BASE_URL}/api/teacher/clarifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'teacher',
      'x-user-id': '00000000-0000-0000-0000-000000000002',
      'x-user-email': 'rajesh.rao@learnlens.edu',
    },
    body: JSON.stringify({
      reportId: reportData.reportId,
      studentId: createdStudent.user.id,
      status: 'improve_focus',
      topics: ['Polynomials'],
      comment: 'Maya, review polynomial degree and factoring before the chapter exam.',
    }),
  });
  assert.strictEqual(clarifyRes.status, 200);
  const clarifyData = await clarifyRes.json();
  assert.strictEqual(clarifyData.clarification.status, 'improve_focus');
  pass('Teacher saved clarification note: status = improve_focus');

  // 7.3 Student reads teacher note
  const studentNoteRes = await fetch(`${BASE_URL}/api/teacher/clarifications/student/${createdStudent.user.id}`, {
    headers: {
      'x-user-role': 'student',
      'x-user-id': createdStudent.user.id,
      'x-user-email': testStudentEmail,
    },
  });
  assert.strictEqual(studentNoteRes.status, 200);
  const studentNoteData = await studentNoteRes.json();
  assert.strictEqual(studentNoteData.clarification.comment, 'Maya, review polynomial degree and factoring before the chapter exam.');
  pass('Student successfully retrieved teacher guidance note');

  // -------------------------------------------------------------
  // SECTION 8: Admin School Metrics & Activity Log Audit
  // -------------------------------------------------------------
  console.log('\n--- 8. Testing Admin Metrics, Directory & Audit Trail ---');

  const metricsRes = await fetch(`${BASE_URL}/api/admin/metrics`);
  assert.strictEqual(metricsRes.status, 200);
  const metrics = await metricsRes.json();
  assert(metrics.counts.real.students >= 4);
  assert(metrics.counts.real.reportsSubmitted >= 1);
  assert(metrics.users.length > 5);
  assert(metrics.classes.length >= 2);
  assert(metrics.recentActivity.length > 5);
  pass(`Admin metrics verified: ${metrics.counts.real.students} real students, ${metrics.recentActivity.length} audit logs`);

  console.log('\n==============================================================');
  console.log(`🎉 ALL ${testsPassed} AUDIT CHECKS PASSED WITH 100% SUCCESS!`);
  console.log('   LearnLens is verified completely resilient across every role!');
  console.log('==============================================================\n');
}

runExhaustiveSystemAudit().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
