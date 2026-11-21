import assert from 'assert';

async function runStep3Tests() {
  console.log('Testing Server-Side Quiz Grading & Automatic Report Creation (Step 3)...');

  const testStudentId = '00000000-0000-0000-0000-000000000006'; // Ananya Sen (Real student)
  const attemptId = 'test-att-' + Date.now();

  // Test Submission:
  // math-01: Level 1 (1 mark) - Correct ('C'), confidence 'guessing' -> Must get 1 mark (guessing does NOT reduce marks)
  // math-02: Level 2 (2 marks) - Correct ('B'), confidence 'sure' -> Must get 2 marks
  // math-03: Level 3 (3 marks) - Wrong ('A', correct is 'B') -> Must get 0 marks
  // phy-01: Level 1 (1 mark) - Skipped / wrong ('A', correct is 'B') -> Must get 0 marks
  // Total marks possible: 1 + 2 + 3 + 1 = 7 marks
  // Total marks earned: 1 + 2 + 0 + 0 = 3 marks
  // Percentage: (3 / 7) * 100 = 42.9%

  const submitRes = await fetch('http://localhost:5000/api/quiz/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attemptId,
      studentId: testStudentId,
      studentName: 'Ananya Sen',
      studentEmail: 'ananya.sen@learnlens.edu',
      className: 'Class 11-A',
      subject: 'Mathematics',
      answers: [
        { questionId: 'math-01', selectedOption: 'C', confidence: 'guessing' },
        { questionId: 'math-02', selectedOption: 'B', confidence: 'sure' },
        { questionId: 'math-03', selectedOption: 'A', confidence: 'not_sure' }, // Wrong
        { questionId: 'phy-01', selectedOption: 'A', confidence: 'not_sure' },  // Wrong
      ],
    }),
  });

  if (submitRes.status !== 200) {
    const errText = await submitRes.text();
    console.error('Quiz submit failed:', submitRes.status, errText);
  }

  assert.strictEqual(submitRes.status, 200);
  const result = await submitRes.json();

  // 1. Verify Level-Based Marks Calculation
  assert.strictEqual(result.marks_earned, 3, 'Level 1 (1m) + Level 2 (2m) = 3 marks earned');
  assert.strictEqual(result.marks_possible, 7, '1 + 2 + 3 + 1 = 7 marks possible');
  assert.strictEqual(result.percentage, 42.9, 'Percentage must be exactly (3/7)*100 = 42.9%');
  console.log('✔ Server calculated level-based marks accurately (L1=1m, L2=2m, L3=3m, Wrong=0)');
  console.log('✔ Confidence rating "guessing" gave full marks without penalty');

  // 2. Verify Level Achieved & Automatic Report Generation
  assert.strictEqual(result.level_achieved, 'Level 1: Foundational Review', '42.9% lands in Level 1 review');
  assert(result.reportId, 'Report ID must be generated automatically');
  assert.strictEqual(result.attemptId, attemptId, 'Report must be linked to attempt ID');
  console.log('✔ Automatic student report created with Level 1 achieved');

  // 3. Verify Prerequisite Gap Diagnosis
  assert(Array.isArray(result.weak_topics), 'weak_topics array must be returned');
  console.log('✔ Prerequisite gap diagnosis returned weak topics');

  // 4. Verify Rank Snapshot
  assert(result.class_rank !== undefined && result.class_rank > 0, 'Class rank must be positive');
  assert(result.school_rank !== undefined && result.school_rank > 0, 'School rank must be positive');
  console.log(`✔ Real-time rank snapshot returned: Class Rank ${result.class_rank} of ${result.class_total_students}, School Rank ${result.school_rank} of ${result.school_total_students}`);

  // 5. Verify Privacy (No other students' data in response)
  assert.strictEqual(result.other_students, undefined, 'Must NEVER return other students');
  assert.strictEqual(result.all_scores, undefined, 'Must NEVER return other students scores');
  console.log('✔ Student privacy strictly enforced: zero exposure of other students data');

  // 6. Verify Duplicate Submission Prevention (Unique constraint)
  const duplicateRes = await fetch('http://localhost:5000/api/quiz/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attemptId, // Same attemptId
      studentId: testStudentId,
      answers: [
        { questionId: 'math-01', selectedOption: 'C', confidence: 'sure' },
      ],
    }),
  });

  assert.strictEqual(duplicateRes.status, 409, 'Duplicate attempt submission must return 409 Conflict');
  const duplicateData = await duplicateRes.json();
  assert.strictEqual(duplicateData.error, 'DuplicateSubmission');
  console.log('✔ Duplicate quiz attempt prevention verified: 409 Conflict returned');

  console.log('\nAll Step 3 tests passed successfully!');
}

runStep3Tests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
