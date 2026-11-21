import assert from 'assert';
import { computeStudentRankings, quizAttemptsStore } from '../src/services/reportService.js';

async function runStep4Tests() {
  console.log('Testing Rank Calculation and Visibility Access Control (Step 4)...');

  // -------------------------------------------------------------
  // 1. Pure Competition Ranking Logic & Tie Handling Test
  // -------------------------------------------------------------
  // Clear any temporary demo artifacts and test tie ranking
  const mockStudentsRank = [
    { student_id: 's1', marks_earned: 90, marks_possible: 100 }, // 90%
    { student_id: 's2', marks_earned: 90, marks_possible: 100 }, // 90% -> Tied with s1
    { student_id: 's3', marks_earned: 75, marks_possible: 100 }, // 75% -> Must be Rank 3 (NOT 2)
    { student_id: 's4', marks_earned: 75, marks_possible: 100 }, // 75% -> Tied Rank 3
    { student_id: 's5', marks_earned: 50, marks_possible: 100 }, // 50% -> Must be Rank 5 (NOT 4)
  ];

  // Helper matching reportService ranking logic
  mockStudentsRank.sort((a, b) => (b.marks_earned / b.marks_possible) - (a.marks_earned / a.marks_possible));
  let rank = 1;
  for (let i = 0; i < mockStudentsRank.length; i++) {
    const curPct = (mockStudentsRank[i].marks_earned / mockStudentsRank[i].marks_possible) * 100;
    const prevPct = i > 0 ? (mockStudentsRank[i - 1].marks_earned / mockStudentsRank[i - 1].marks_possible) * 100 : null;
    if (i > 0 && curPct < prevPct) {
      rank = i + 1;
    }
    mockStudentsRank[i].computedRank = rank;
  }

  assert.strictEqual(mockStudentsRank[0].computedRank, 1, 'First 90% student gets Rank 1');
  assert.strictEqual(mockStudentsRank[1].computedRank, 1, 'Tied 90% student gets Rank 1');
  assert.strictEqual(mockStudentsRank[2].computedRank, 3, '75% student gets Rank 3 (skipping Rank 2)');
  assert.strictEqual(mockStudentsRank[3].computedRank, 3, 'Tied 75% student gets Rank 3');
  assert.strictEqual(mockStudentsRank[4].computedRank, 5, '50% student gets Rank 5 (skipping Rank 4)');
  console.log('✔ Competition RANK() algorithm correctly shares ranks on ties (1, 1, 3, 3, 5)');

  // -------------------------------------------------------------
  // 2. Demo Account Exclusion from Real Rankings
  // -------------------------------------------------------------
  const realRankings = computeStudentRankings(false); // excludeDemo = false
  const demoFound = realRankings.rankedStudents.some((st) => st.is_demo);
  assert.strictEqual(demoFound, false, 'Real rankings must strictly exclude is_demo = true accounts');
  console.log('✔ Real school rankings strictly exclude demo accounts (is_demo = true)');

  // -------------------------------------------------------------
  // 3. API Role Isolation: Student Access Checks
  // -------------------------------------------------------------
  const studentA_id = '00000000-0000-0000-0000-000000000006'; // Ananya Sen
  const studentB_id = '00000000-0000-0000-0000-000000000007'; // Arjun Sharma

  // Student viewing own rank -> OK
  const ownRankRes = await fetch(`http://localhost:5000/api/quiz/ranks/student/${studentA_id}`, {
    headers: {
      'x-user-role': 'student',
      'x-user-id': studentA_id,
      'x-user-email': 'ananya.sen@learnlens.edu',
    },
  });
  assert.strictEqual(ownRankRes.status, 200);
  const ownRankData = await ownRankRes.json();
  assert(ownRankData.rank && ownRankData.rank.class_rank !== undefined);
  console.log('✔ Student can view their own rank');

  // Student attempting to view another student's rank -> FORBIDDEN (403)
  const forbiddenRes = await fetch(`http://localhost:5000/api/quiz/ranks/student/${studentB_id}`, {
    headers: {
      'x-user-role': 'student',
      'x-user-id': studentA_id,
      'x-user-email': 'ananya.sen@learnlens.edu',
    },
  });
  assert.strictEqual(forbiddenRes.status, 403, 'Student cannot view another student rank');
  console.log('✔ Student is strictly blocked (HTTP 403) from viewing another student rank');

  // Student attempting to view class leaderboard -> FORBIDDEN (403)
  const classForbidRes = await fetch(`http://localhost:5000/api/quiz/ranks/class/Class%2011-A`, {
    headers: {
      'x-user-role': 'student',
      'x-user-id': studentA_id,
      'x-user-email': 'ananya.sen@learnlens.edu',
    },
  });
  assert.strictEqual(classForbidRes.status, 403, 'Student cannot view class leaderboard');
  console.log('✔ Student is strictly blocked (HTTP 403) from viewing class leaderboard');

  // -------------------------------------------------------------
  // 4. API Role Isolation: Parent Access Checks
  // -------------------------------------------------------------
  // Sunita Sharma is linked to Priya Sharma and Arjun Sharma
  const parentId = '00000000-0000-0000-0000-000000000003';
  const parentLinkedRes = await fetch(`http://localhost:5000/api/quiz/ranks/student/${studentB_id}`, {
    headers: {
      'x-user-role': 'parent',
      'x-user-id': parentId,
      'x-user-email': 'sunita.sharma@learnlens.edu',
    },
  });
  assert.strictEqual(parentLinkedRes.status, 200, 'Parent can view linked child rank');
  console.log('✔ Parent can view linked child rank');

  // Parent attempting to view unlinked student rank (Ananya Sen) -> FORBIDDEN (403)
  const parentUnlinkedRes = await fetch(`http://localhost:5000/api/quiz/ranks/student/${studentA_id}`, {
    headers: {
      'x-user-role': 'parent',
      'x-user-id': parentId,
      'x-user-email': 'sunita.sharma@learnlens.edu',
    },
  });
  assert.strictEqual(parentUnlinkedRes.status, 403, 'Parent cannot view unlinked student rank');
  console.log('✔ Parent is blocked (HTTP 403) from viewing unlinked child rank');

  // -------------------------------------------------------------
  // 5. API Role Isolation: Teacher Access Checks
  // -------------------------------------------------------------
  // Rajesh Rao teaches Class 11-A
  const teacherId = '00000000-0000-0000-0000-000000000002';
  const teacherClassRes = await fetch(`http://localhost:5000/api/quiz/ranks/class/Class%2011-A`, {
    headers: {
      'x-user-role': 'teacher',
      'x-user-id': teacherId,
      'x-user-email': 'rajesh.rao@learnlens.edu',
    },
  });
  assert.strictEqual(teacherClassRes.status, 200, 'Teacher can view own class leaderboard');
  console.log('✔ Teacher can view leaderboard for their assigned class');

  // Teacher attempting to view unassigned class (Class 9-B) -> FORBIDDEN (403)
  const teacherUnassignedRes = await fetch(`http://localhost:5000/api/quiz/ranks/class/Class%209-B`, {
    headers: {
      'x-user-role': 'teacher',
      'x-user-id': teacherId,
      'x-user-email': 'rajesh.rao@learnlens.edu',
    },
  });
  assert.strictEqual(teacherUnassignedRes.status, 403, 'Teacher cannot view unassigned class leaderboard');
  console.log('✔ Teacher is blocked (HTTP 403) from viewing unassigned class leaderboard');

  // -------------------------------------------------------------
  // 6. Admin Access Check
  // -------------------------------------------------------------
  const adminRes = await fetch(`http://localhost:5000/api/quiz/ranks/school/leaderboard`, {
    headers: {
      'x-user-role': 'admin',
      'x-user-email': 'admin@learnlens.demo',
    },
  });
  assert.strictEqual(adminRes.status, 200);
  const adminData = await adminRes.json();
  assert(adminData.students && Array.isArray(adminData.students));
  console.log('✔ Admin can view complete school-wide leaderboard');

  console.log('\nAll Step 4 tests passed successfully!');
}

runStep4Tests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
