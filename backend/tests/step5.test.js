import assert from 'assert';

async function runStep5Tests() {
  console.log('Testing Teacher Incoming Reports & Clarification Workflow (Step 5)...');

  const teacherA_id = '00000000-0000-0000-0000-000000000002'; // Mr. Rajesh Rao (teaches Class 11-A)
  const studentA_id = '00000000-0000-0000-0000-000000000006'; // Ananya Sen (Class 11-A)
  const studentB_id = '00000000-0000-0000-0000-000000000007'; // Arjun Sharma (Class 9-B)

  // -------------------------------------------------------------
  // 1. Incoming Reports Feed (15s Polling Endpoint)
  // -------------------------------------------------------------
  const incomingRes = await fetch('http://localhost:5000/api/teacher/reports/incoming', {
    headers: {
      'x-user-role': 'teacher',
      'x-user-id': teacherA_id,
      'x-user-email': 'rajesh.rao@learnlens.edu',
    },
  });

  assert.strictEqual(incomingRes.status, 200);
  const incomingData = await incomingRes.json();
  assert(Array.isArray(incomingData.submissions), 'Submissions must be an array');
  console.log(`✔ Teacher received incoming reports queue (${incomingData.submissions.length} reports, ${incomingData.newReportsCount} unreviewed)`);

  const firstSub = incomingData.submissions[0];
  if (firstSub) {
    assert(firstSub.studentName, 'Student name must be present');
    assert(firstSub.subject, 'Subject must be present');
    assert(firstSub.score, 'Score must be present');
    assert(firstSub.rankText || firstSub.classRank !== undefined, 'Rank must be present');
    assert(typeof firstSub.isNew === 'boolean', 'isNew flag for New badge must be boolean');
    console.log(`✔ Incoming report item verified: ${firstSub.studentName} - ${firstSub.subject} (${firstSub.score}) - ${firstSub.rankText || 'Rank 1'}`);
  }

  // -------------------------------------------------------------
  // 2. Class Analytics & Roster with Overall % and Class Rank
  // -------------------------------------------------------------
  const analyticsRes = await fetch('http://localhost:5000/api/teacher/class/c1/analytics', {
    headers: {
      'x-user-role': 'teacher',
      'x-user-id': teacherA_id,
      'x-user-email': 'rajesh.rao@learnlens.edu',
    },
  });

  assert.strictEqual(analyticsRes.status, 200);
  const analyticsData = await analyticsRes.json();
  assert(Array.isArray(analyticsData.students), 'Students array must be present');

  const ananya = analyticsData.students.find((s) => s.id === studentA_id);
  assert(ananya, 'Ananya Sen must be in Class 11-A roster');
  assert(ananya.overallPercentage !== undefined, 'overallPercentage must be present');
  assert(ananya.classRank !== undefined, 'classRank must be present');
  assert(typeof ananya.needsAttention === 'boolean', 'needsAttention must be boolean');
  console.log(`✔ Student roster verified: ${ananya.name} - Overall: ${ananya.overallPercentage}%, Rank: ${ananya.classRank}, Needs Attention: ${ananya.needsAttention}`);

  // Teacher cannot see students from unassigned class
  const arjunInTeacherA = analyticsData.students.find((s) => s.id === studentB_id);
  assert.strictEqual(arjunInTeacherA, undefined, 'Teacher Rajesh Rao must not see Class 9-B students');
  console.log('✔ Teacher assigned-class isolation verified (only own class students visible)');

  // -------------------------------------------------------------
  // 3. Teacher Clarification: Validation & Permissions
  // -------------------------------------------------------------
  // A. Invalid status -> 400
  const invalidStatusRes = await fetch('http://localhost:5000/api/teacher/clarifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'teacher',
      'x-user-id': teacherA_id,
      'x-user-email': 'rajesh.rao@learnlens.edu',
    },
    body: JSON.stringify({
      studentId: studentA_id,
      status: 'invalid_status_value',
      topics: ['Quadratic Equations'],
      comment: 'Review this topic carefully.',
    }),
  });
  assert.strictEqual(invalidStatusRes.status, 400);
  console.log('✔ Invalid clarification status rejected with HTTP 400');

  // B. Comment > 500 characters -> 400
  const longComment = 'A'.repeat(501);
  const longCommentRes = await fetch('http://localhost:5000/api/teacher/clarifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'teacher',
      'x-user-id': teacherA_id,
      'x-user-email': 'rajesh.rao@learnlens.edu',
    },
    body: JSON.stringify({
      studentId: studentA_id,
      status: 'improve_focus',
      topics: ['Quadratic Equations'],
      comment: longComment,
    }),
  });
  assert.strictEqual(longCommentRes.status, 400);
  console.log('✔ Clarification comment exceeding 500 characters rejected with HTTP 400');

  // C. Unassigned class student clarification -> 403 Forbidden
  const unassignedClarRes = await fetch('http://localhost:5000/api/teacher/clarifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'teacher',
      'x-user-id': teacherA_id,
      'x-user-email': 'rajesh.rao@learnlens.edu',
    },
    body: JSON.stringify({
      studentId: studentB_id, // Class 9-B student
      status: 'needs_extra_help',
      topics: ['Linear Equations in 2 Variables'],
      comment: 'Arjun needs extra help.',
    }),
  });
  assert.strictEqual(unassignedClarRes.status, 403);
  console.log('✔ Teacher forbidden (HTTP 403) from writing clarification for unassigned class student');

  // D. Valid Clarification Save
  const validClarRes = await fetch('http://localhost:5000/api/teacher/clarifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'teacher',
      'x-user-id': teacherA_id,
      'x-user-email': 'rajesh.rao@learnlens.edu',
    },
    body: JSON.stringify({
      studentId: studentA_id,
      status: 'improve_focus',
      topics: ['Differential Calculus', 'Algebraic Identities & Factoring'],
      comment: 'Ananya has strong logical skills. Spend 25 minutes reviewing derivative inflection points before the mock exam.',
    }),
  });
  assert.strictEqual(validClarRes.status, 200);
  const clarData = await validClarRes.json();
  assert(clarData.clarification);
  assert.strictEqual(clarData.clarification.status, 'improve_focus');
  assert.strictEqual(clarData.clarification.topics.length, 2);
  console.log('✔ Teacher clarification successfully saved with topics, status, and comment');

  // -------------------------------------------------------------
  // 4. Clarification Retrieval & Editing
  // -------------------------------------------------------------
  const getClarRes = await fetch(`http://localhost:5000/api/teacher/clarifications/student/${studentA_id}`);
  assert.strictEqual(getClarRes.status, 200);
  const getClarData = await getClarRes.json();
  assert.strictEqual(getClarData.clarification.comment, 'Ananya has strong logical skills. Spend 25 minutes reviewing derivative inflection points before the mock exam.');
  console.log('✔ Saved clarification successfully retrieved for student');

  // Edit the clarification later
  const editClarRes = await fetch('http://localhost:5000/api/teacher/clarifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'teacher',
      'x-user-id': teacherA_id,
      'x-user-email': 'rajesh.rao@learnlens.edu',
    },
    body: JSON.stringify({
      studentId: studentA_id,
      status: 'doing_well', // Updated status
      topics: ['Differential Calculus'],
      comment: 'Updated note: Ananya completed the practice questions and is doing very well.',
    }),
  });
  assert.strictEqual(editClarRes.status, 200);
  const editData = await editClarRes.json();
  assert.strictEqual(editData.clarification.status, 'doing_well');
  console.log('✔ Teacher successfully edited clarification later (status changed to doing_well)');

  console.log('\nAll Step 5 tests passed successfully!');
}

runStep5Tests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
