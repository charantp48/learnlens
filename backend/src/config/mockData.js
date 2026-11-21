// In-memory representation of Class 9 Mathematics curriculum & demo state
// Enables 100% offline development, testing, and judge demonstrations without database failure risks

export const MOCK_SUBJECT = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Class 9 Mathematics',
  code: 'MATH-09',
  grade_level: '9',
};

export const MOCK_TOPICS = [
  { id: '10000000-0000-0000-0000-000000000001', name: 'Number Systems & Rationals', order_index: 1 },
  { id: '10000000-0000-0000-0000-000000000002', name: 'Real Numbers & Radicals', order_index: 2 },
  { id: '10000000-0000-0000-0000-000000000003', name: 'Algebraic Identities & Factoring', order_index: 3 },
  { id: '10000000-0000-0000-0000-000000000004', name: 'Quadratic Equations', order_index: 4 },
  { id: '10000000-0000-0000-0000-000000000005', name: 'Linear Equations in 1 Variable', order_index: 5 },
  { id: '10000000-0000-0000-0000-000000000006', name: 'Linear Equations in 2 Variables', order_index: 6 },
  { id: '10000000-0000-0000-0000-000000000007', name: 'Lines and Angles', order_index: 7 },
  { id: '10000000-0000-0000-0000-000000000008', name: 'Triangles & Congruence', order_index: 8 },
  { id: '10000000-0000-0000-0000-000000000009', name: 'Quadrilaterals & Polygons', order_index: 9 },
  { id: '10000000-0000-0000-0000-000000000010', name: 'Coordinate Geometry', order_index: 10 },
];

// Prerequisite Graph: Key = topic_id, Value = Array of prerequisite topic_ids
export const MOCK_PREREQUISITES_GRAPH = {
  '10000000-0000-0000-0000-000000000002': ['10000000-0000-0000-0000-000000000001'], // Real Numbers requires Number Systems
  '10000000-0000-0000-0000-000000000004': ['10000000-0000-0000-0000-000000000003'], // Quadratics requires Factoring
  '10000000-0000-0000-0000-000000000006': [
    '10000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000003'
  ], // 2 Variables requires 1 Variable + Factoring
  '10000000-0000-0000-0000-000000000008': ['10000000-0000-0000-0000-000000000007'], // Triangles requires Lines & Angles
  '10000000-0000-0000-0000-000000000009': ['10000000-0000-0000-0000-000000000008'], // Quadrilaterals requires Triangles
  '10000000-0000-0000-0000-000000000010': [
    '10000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000005'
  ], // Coord Geometry requires Real Numbers & Linear Eq
};

export const MOCK_USERS = {
  student: {
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Priya Sharma',
    email: 'priya.student@learnlens.demo',
    role: 'student',
    class_name: 'Class 9-A',
  },
  teacher: {
    id: '00000000-0000-0000-0000-000000000002',
    full_name: 'Mr. Rajesh Rao',
    email: 'rajesh.teacher@learnlens.demo',
    role: 'teacher',
    subject: 'Mathematics',
  },
  parent: {
    id: '00000000-0000-0000-0000-000000000003',
    full_name: 'Sunita Sharma',
    email: 'sunita.parent@learnlens.demo',
    role: 'parent',
    linked_student_id: '00000000-0000-0000-0000-000000000001',
    child_name: 'Priya Sharma',
  },
  admin: {
    id: '00000000-0000-0000-0000-000000000004',
    full_name: 'Dr. Vikram Malhotra',
    email: 'admin@learnlens.demo',
    role: 'admin',
    school: 'Kendriya Vidyalaya / Public School',
  },
};
