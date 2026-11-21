import assert from 'assert';

async function runStep2Tests() {
  console.log('Testing Admin & Auth Endpoints for Step 2...');
  const testEmail = 'aditi.sharma.' + Date.now() + '@school.edu';

  // 1. CSV Template
  const tmplRes = await fetch('http://localhost:5000/api/admin/users/csv-template');
  assert.strictEqual(tmplRes.status, 200);
  const csvText = await tmplRes.text();
  assert(csvText.includes('role,full_name,email,class_name,linked_student_email'));
  console.log('✔ CSV template endpoint functional');

  // 2. Create Single Real User
  const createRes = await fetch('http://localhost:5000/api/admin/users/create-single', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'student',
      full_name: 'Aditi Sharma',
      email: testEmail,
      class_name: 'Class 11-A'
    })
  });
  if (createRes.status !== 201) {
    const errText = await createRes.text();
    console.error('Create single failed:', createRes.status, errText);
  }
  assert.strictEqual(createRes.status, 201);
  const created = await createRes.json();
  assert(created.user && created.user.tempPassword);
  assert.strictEqual(created.user.must_change_password, true);
  assert.strictEqual(created.user.is_demo, false);
  const tempPassword = created.user.tempPassword;
  const userId = created.user.id;
  console.log('✔ Single user creation functional (Temp password generated: ' + tempPassword + ')');

  // 3. Login with Temp Password
  const loginTempRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: tempPassword
    })
  });
  assert.strictEqual(loginTempRes.status, 200);
  const loginTempData = await loginTempRes.json();
  assert.strictEqual(loginTempData.user.must_change_password, true);
  console.log('✔ Login with temp password flags must_change_password = true');

  // 4. Forced Password Change
  const changeRes = await fetch('http://localhost:5000/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      current_password: tempPassword,
      new_password: 'PermanentPassword#2026'
    })
  });
  assert.strictEqual(changeRes.status, 200);
  const changeData = await changeRes.json();
  assert.strictEqual(changeData.status, 'ok');
  console.log('✔ Forced password change functional');

  // 5. Login with New Permanent Password
  const loginPermRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'PermanentPassword#2026'
    })
  });
  assert.strictEqual(loginPermRes.status, 200);
  const loginPermData = await loginPermRes.json();
  assert.strictEqual(loginPermData.user.must_change_password, false);
  console.log('✔ Permanent password login verified');

  // 6. CSV Preview with Valid and Invalid rows
  const previewRes = await fetch('http://localhost:5000/api/admin/users/csv-preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rows: [
        { role: 'student', full_name: 'Rohan Verma', email: 'rohan.v.' + Date.now() + '@school.edu', class_name: 'Class 11-A' },
        { role: 'parent', full_name: 'Mr. Verma', email: 'mr.verma.' + Date.now() + '@home.edu', linked_student_email: 'rohan.v.' + Date.now() + '@school.edu' },
        { role: 'student', full_name: 'Invalid Email User', email: 'invalid-email', class_name: 'Class 11-A' },
        { role: 'student', full_name: 'Duplicate', email: testEmail, class_name: 'Class 11-A' }
      ]
    })
  });
  assert.strictEqual(previewRes.status, 200);
  const previewData = await previewRes.json();
  assert.strictEqual(previewData.total, 4);
  assert.strictEqual(previewData.valid_count, 2);
  assert.strictEqual(previewData.error_count, 2);
  console.log('✔ CSV preview validation functional with row-by-row error detection');

  // 7. Reset Password
  const resetRes = await fetch('http://localhost:5000/api/admin/users/' + userId + '/reset-password', {
    method: 'POST'
  });
  assert.strictEqual(resetRes.status, 200);
  const resetData = await resetRes.json();
  assert(resetData.tempPassword);
  console.log('✔ Password reset by admin functional (New temp: ' + resetData.tempPassword + ')');

  // 8. Toggle Status (Disable user)
  const toggleRes = await fetch('http://localhost:5000/api/admin/users/' + userId + '/toggle-status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'disabled' })
  });
  assert.strictEqual(toggleRes.status, 200);
  const toggleData = await toggleRes.json();
  assert.strictEqual(toggleData.user.status, 'disabled');

  // Try logging in as disabled user
  const loginDisabledRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: resetData.tempPassword
    })
  });
  assert.strictEqual(loginDisabledRes.status, 403);
  console.log('✔ Disabled user access prevention verified');

  console.log('\nAll Step 2 API tests passed perfectly!');
}

runStep2Tests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
