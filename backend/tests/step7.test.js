import assert from 'assert';

async function runStep7Tests() {
  console.log('Testing Admin Monitoring Sections (Step 7)...');

  // -------------------------------------------------------------
  // 1. GET /api/admin/metrics - Real Totals (Demo Accounts Excluded)
  // -------------------------------------------------------------
  const metricsRes = await fetch('http://localhost:5000/api/admin/metrics');
  assert.strictEqual(metricsRes.status, 200);
  const metrics = await metricsRes.json();
  assert.strictEqual(metrics.status, 'ok');

  const { counts, users, classes, reportsAndRanks, recentActivity } = metrics;
  assert(counts, 'Counts object must be returned');
  assert(counts.real, 'Real counts must be returned');

  console.log('✔ Real Totals Verified:');
  console.log(`   - Students (Real): ${counts.real.students} (Total with demo: ${counts.all.students})`);
  console.log(`   - Teachers (Real): ${counts.real.teachers} (Total with demo: ${counts.all.teachers})`);
  console.log(`   - Parents  (Real): ${counts.real.parents} (Total with demo: ${counts.all.parents})`);
  console.log(`   - Classes:         ${counts.real.classes}`);
  console.log(`   - Reports Submitted (Real): ${counts.real.reportsSubmitted}`);
  console.log(`   - Pending Review    (Real): ${counts.real.reportsNotReviewed}`);

  // Real students must be fewer than total students (because demo accounts are excluded)
  assert(counts.real.students < counts.all.students, 'Demo students must be excluded from real students count');
  assert(counts.real.teachers < counts.all.teachers, 'Demo teachers must be excluded from real teachers count');
  assert(counts.real.parents < counts.all.parents, 'Demo parents must be excluded from real parents count');
  assert(typeof counts.real.reportsSubmitted === 'number', 'reportsSubmitted must be a number');
  assert(typeof counts.real.reportsNotReviewed === 'number', 'reportsNotReviewed must be a number');

  // -------------------------------------------------------------
  // 2. All Users Table Directory
  // -------------------------------------------------------------
  assert(Array.isArray(users), 'Users must be an array');
  assert(users.length >= 8, 'Users directory must contain all users');

  const realUser = users.find((u) => !u.is_demo);
  const demoUser = users.find((u) => u.is_demo);
  assert(realUser, 'At least one real user must exist in directory');
  assert(demoUser, 'At least one demo user must exist in directory');
  assert.strictEqual(demoUser.is_demo, true);
  console.log(`✔ User Directory Verified (${users.length} total users, demo flag verified)`);

  // -------------------------------------------------------------
  // 3. School-Wide Reports and Ranks Table
  // -------------------------------------------------------------
  assert(Array.isArray(reportsAndRanks), 'reportsAndRanks must be an array');
  assert(reportsAndRanks.length > 0, 'reportsAndRanks must contain student entries');

  const firstStudentReport = reportsAndRanks[0];
  assert(firstStudentReport.studentId, 'studentId must be present');
  assert(firstStudentReport.studentName, 'studentName must be present');
  assert(firstStudentReport.className, 'className must be present');
  assert(firstStudentReport.schoolRank !== undefined, 'schoolRank must be computed');
  assert(firstStudentReport.classRank !== undefined, 'classRank must be computed');
  assert(firstStudentReport.overallPercentage !== undefined, 'overallPercentage must be computed');
  console.log(`✔ School-Wide Reports & Ranks verified: ${firstStudentReport.studentName} - School #${firstStudentReport.schoolRank}, Class Rank ${firstStudentReport.classRank} (${firstStudentReport.overallPercentage}%)`);

  // Test Dedicated Class Filter Endpoint
  const classFilterRes = await fetch('http://localhost:5000/api/admin/reports-and-ranks?class=Class%2011-A');
  assert.strictEqual(classFilterRes.status, 200);
  const classFiltered = await classFilterRes.json();
  assert(Array.isArray(classFiltered.reportsAndRanks), 'Class filtered reports must be array');
  assert(classFiltered.reportsAndRanks.every((r) => r.className.toLowerCase() === 'class 11-a'), 'All returned reports must belong to Class 11-A');
  console.log(`✔ Class filter verified: 'Class 11-A' query returned ${classFiltered.reportsAndRanks.length} students strictly belonging to Class 11-A`);

  // -------------------------------------------------------------
  // 4. Recent Activity Log
  // -------------------------------------------------------------
  assert(Array.isArray(recentActivity), 'Recent activity must be an array');
  assert(recentActivity.length > 0, 'Recent activity log must have entries');

  const logTypes = recentActivity.map((l) => l.action);
  console.log(`✔ Recent Activity Log verified (${recentActivity.length} events logged, actions: ${[...new Set(logTypes)].join(', ')})`);

  // Verify that quiz submission or clarification is in the log
  const hasDiagnosticOrAdminEvent = recentActivity.some(
    (l) => l.action === 'report_submitted' || l.action === 'clarification_added' || l.action.startsWith('user_') || l.action.startsWith('system_')
  );
  assert(hasDiagnosticOrAdminEvent, 'Activity log must contain real administrative/diagnostic events');

  console.log('\n--- ALL STEP 7 TESTS PASSED SUCCESSFULLY! ---');
}

runStep7Tests().catch((err) => {
  console.error('\n❌ STEP 7 TEST FAILED:', err);
  process.exit(1);
});
