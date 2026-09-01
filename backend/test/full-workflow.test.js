const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');

const request = (app, { method = 'GET', path: requestPath, token, body }) => new Promise((resolve, reject) => {
  const server = app.listen(0, '127.0.0.1', () => {
    const address = server.address();
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: address.port,
      path: requestPath,
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(payload ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        } : {}),
      },
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        server.close(() => {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
          });
        });
      });
    });

    req.on('error', (error) => {
      server.close(() => reject(error));
    });

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
});

test('Full end-to-end workflow: Login -> Create -> HOD Approve -> Assign -> ATR -> HOD ATR Approve -> Verify & Close', async () => {
  process.env.JWT_SECRET = 'test-workflow-secret';
  delete process.env.DATABASE_URL;

  // Clear cache to load fresh in-memory DB
  for (const key of Object.keys(require.cache)) {
    if (key.includes(`${path.sep}src${path.sep}`)) {
      delete require.cache[key];
    }
  }

  const createApp = require('../src/app');
  const app = createApp();

  const testPassword = 'LocalSupervisor!2026';

  // 1. Test Login for Supervisor, HOD, and Electrician with same password
  const supLogin = await request(app, {
    method: 'POST',
    path: '/api/auth/login',
    body: {
      username: 'supervisor1',
      password: testPassword,
    },
  });
  assert.equal(supLogin.status, 200, 'Supervisor should login successfully');
  assert.ok(supLogin.body.token);
  const supervisorToken = supLogin.body.token;

  const hodLogin = await request(app, {
    method: 'POST',
    path: '/api/auth/login',
    body: {
      username: 'hod1',
      password: testPassword,
    },
  });
  assert.equal(hodLogin.status, 200, 'HOD should login successfully with test password');
  assert.ok(hodLogin.body.token);
  const hodToken = hodLogin.body.token;

  const elLogin = await request(app, {
    method: 'POST',
    path: '/api/auth/login',
    body: {
      username: 'electrician1',
      password: testPassword,
    },
  });
  assert.equal(elLogin.status, 200, 'Electrician should login successfully with test password');
  assert.ok(elLogin.body.token);
  const electricianToken = elLogin.body.token;

  // 2. Supervisor creates a complaint
  const createRes = await request(app, {
    method: 'POST',
    path: '/api/complaints',
    token: supervisorToken,
    body: {
      title: 'Lab 4 AC Not Cooling',
      description: 'The air conditioner in Computer Lab 4 stopped cooling properly.',
      category: 'ELECTRICAL',
      priority: 'HIGH',
      slaDueAt: new Date(Date.now() + 86400000).toISOString(),
      locationBuilding: 'Computer Science Complex',
      floorArea: '2nd Floor',
      roomAreaNumber: 'Lab 204',
      requesterContact: '9876543210',
      locationIntercom: 'Ext 401 (IT Lab Control Room)',
    },
  });
  assert.equal(createRes.status, 201, 'Complaint creation should succeed');
  const complaintId = createRes.body.complaint.id;
  assert.equal(createRes.body.complaint.status, 'COMPLAINT_REGISTERED');
  assert.equal(createRes.body.complaint.hodApprovalStatus, 'PENDING');
  assert.equal(createRes.body.complaint.requesterContact, '9876543210');
  assert.equal(createRes.body.complaint.locationIntercom, 'Ext 401 (IT Lab Control Room)');

  // 3. HOD views pending approvals
  const pendingRes = await request(app, {
    method: 'GET',
    path: '/api/approvals/pending',
    token: hodToken,
  });
  assert.equal(pendingRes.status, 200);
  assert.ok(pendingRes.body.complaints.some((c) => c.id === complaintId));

  // 4. HOD approves complaint
  const approveRes = await request(app, {
    method: 'PATCH',
    path: `/api/approvals/${complaintId}`,
    token: hodToken,
    body: {
      status: 'APPROVED',
    },
  });
  assert.equal(approveRes.status, 200);
  assert.equal(approveRes.body.complaint.hodApprovalStatus, 'APPROVED');

  // 5. Supervisor assigns Electrician
  const assignRes = await request(app, {
    method: 'PATCH',
    path: `/api/tickets/${complaintId}/assign-electrician`,
    token: supervisorToken,
    body: {
      electricianId: 'user-el1',
      remarks: 'Please check compressor and gas levels',
    },
  });
  assert.equal(assignRes.status, 200);
  const assignmentId = assignRes.body.assignment.id;

  // 6. Electrician views jobs and updates status to IN_PROGRESS
  const startRes = await request(app, {
    method: 'PATCH',
    path: `/api/jobs/${assignmentId}/status`,
    token: electricianToken,
    body: {
      status: 'IN_PROGRESS',
      remarks: 'Checked refrigerant pressure and started coil repair',
    },
  });
  assert.equal(startRes.status, 200);

  // 7. Electrician marks job COMPLETED and submits Action Taken Report (ATR)
  const completeRes = await request(app, {
    method: 'PATCH',
    path: `/api/jobs/${assignmentId}/status`,
    token: electricianToken,
    body: {
      status: 'COMPLETED',
      remarks: 'Repair work finished and tested.',
    },
  });
  assert.equal(completeRes.status, 200);

  const atrRes = await request(app, {
    method: 'POST',
    path: `/api/jobs/${assignmentId}/action-taken`,
    token: electricianToken,
    body: {
      actionTaken: 'Cleaned filters, replaced capacitor, refilled R-410A refrigerant.',
      partsUsed: 'Capacitor 45uF, Refrigerant R-410A 1kg',
      remarks: 'AC tested and running at 18 degrees Celsius.',
    },
  });
  assert.equal(atrRes.status, 201);
  assert.equal(atrRes.body.complaint.status, 'ACTION_TAKEN');

  // 8. HOD checks pending Action Taken Reports
  const pendingAtrRes = await request(app, {
    method: 'GET',
    path: '/api/approvals/action-reports/pending',
    token: hodToken,
  });
  assert.equal(pendingAtrRes.status, 200);
  assert.ok(pendingAtrRes.body.complaints.some((c) => c.id === complaintId));

  // 9. HOD approves Action Taken Report (endorses ATR and closes ticket)
  const atrApproveRes = await request(app, {
    method: 'PATCH',
    path: `/api/approvals/action-reports/${complaintId}`,
    token: hodToken,
    body: {
      status: 'APPROVED',
      remarks: 'Work verified by lab supervisor; endorsed ATR and closed.',
    },
  });
  assert.equal(atrApproveRes.status, 200);
  assert.equal(atrApproveRes.body.complaint.status, 'CLOSED');

  // Verify complaint state via GET /api/complaints/:id
  const getComplaintRes = await request(app, {
    method: 'GET',
    path: `/api/complaints/${complaintId}`,
    token: hodToken,
  });
  assert.equal(getComplaintRes.status, 200);
  assert.equal(getComplaintRes.body.complaint.status, 'CLOSED');
  assert.ok(getComplaintRes.body.complaint.closedAt);
  assert.equal(getComplaintRes.body.complaint.atrs.length, 1);
});

test('HOD rejects Action Taken Report and sends back for rework', async () => {
  process.env.JWT_SECRET = 'test-workflow-secret';
  delete process.env.DATABASE_URL;

  for (const key of Object.keys(require.cache)) {
    if (key.includes(`${path.sep}src${path.sep}`)) {
      delete require.cache[key];
    }
  }

  const createApp = require('../src/app');
  const app = createApp();

  const testPassword = 'LocalSupervisor!2026';

  const supLogin = await request(app, {
    method: 'POST',
    path: '/api/auth/login',
    body: { username: 'supervisor1', password: testPassword },
  });
  const supervisorToken = supLogin.body.token;

  const hodLogin = await request(app, {
    method: 'POST',
    path: '/api/auth/login',
    body: { username: 'hod1', password: testPassword },
  });
  const hodToken = hodLogin.body.token;

  const elLogin = await request(app, {
    method: 'POST',
    path: '/api/auth/login',
    body: { username: 'electrician1', password: testPassword },
  });
  const electricianToken = elLogin.body.token;

  // Create complaint
  const createRes = await request(app, {
    method: 'POST',
    path: '/api/complaints',
    token: supervisorToken,
    body: {
      title: 'Auditorium Projector Dimming',
      description: 'Lamp needs replacement before guest lecture',
      category: 'ELECTRICAL',
      priority: 'MEDIUM',
      slaDueAt: new Date(Date.now() + 86400000).toISOString(),
    },
  });
  assert.equal(createRes.status, 201);
  const complaintId = createRes.body.complaint.id;

  // HOD approve initial
  await request(app, {
    method: 'PATCH',
    path: `/api/approvals/${complaintId}`,
    token: hodToken,
    body: { status: 'APPROVED' },
  });

  // Supervisor assign
  const assignRes = await request(app, {
    method: 'PATCH',
    path: `/api/tickets/${complaintId}/assign-electrician`,
    token: supervisorToken,
    body: {
      electricianId: 'user-el1',
    },
  });
  assert.equal(assignRes.status, 200);
  const assignmentId = assignRes.body.assignment.id;

  // Progress assignment to IN_PROGRESS then COMPLETED
  await request(app, {
    method: 'PATCH',
    path: `/api/jobs/${assignmentId}/status`,
    token: electricianToken,
    body: {
      status: 'IN_PROGRESS',
    },
  });

  await request(app, {
    method: 'PATCH',
    path: `/api/jobs/${assignmentId}/status`,
    token: electricianToken,
    body: {
      status: 'COMPLETED',
    },
  });

  // Electrician submits ATR
  await request(app, {
    method: 'POST',
    path: `/api/jobs/${assignmentId}/action-taken`,
    token: electricianToken,
    body: {
      actionTaken: 'Cleaned lens.',
      remarks: 'Did not replace lamp yet.',
    },
  });

  // HOD rejects ATR
  const rejectRes = await request(app, {
    method: 'PATCH',
    path: `/api/approvals/action-reports/${complaintId}`,
    token: hodToken,
    body: {
      status: 'REJECTED',
      rejectionReason: 'Lamp is still flickering; new bulb installation mandatory.',
    },
  });
  assert.equal(rejectRes.status, 200);
  assert.equal(rejectRes.body.complaint.status, 'REPAIR_ASSIGNED');
});

test('Atomic verify-and-close endpoint works smoothly', async () => {
  process.env.JWT_SECRET = 'test-workflow-secret';
  delete process.env.DATABASE_URL;

  for (const key of Object.keys(require.cache)) {
    if (key.includes(`${path.sep}src${path.sep}`)) {
      delete require.cache[key];
    }
  }

  const createApp = require('../src/app');
  const app = createApp();

  const testPassword = 'LocalSupervisor!2026';

  const supLogin = await request(app, {
    method: 'POST',
    path: '/api/auth/login',
    body: { username: 'supervisor1', password: testPassword },
  });
  const supervisorToken = supLogin.body.token;

  const hodLogin = await request(app, {
    method: 'POST',
    path: '/api/auth/login',
    body: { username: 'hod1', password: testPassword },
  });
  const hodToken = hodLogin.body.token;

  const elLogin = await request(app, {
    method: 'POST',
    path: '/api/auth/login',
    body: { username: 'electrician1', password: testPassword },
  });
  const electricianToken = elLogin.body.token;

  // Create complaint
  const createRes = await request(app, {
    method: 'POST',
    path: '/api/complaints',
    token: supervisorToken,
    body: {
      title: 'Server Room Exhaust Fan',
      description: 'Fan stopped spinning',
      category: 'ELECTRICAL',
      priority: 'HIGH',
      slaDueAt: new Date(Date.now() + 86400000).toISOString(),
    },
  });
  assert.equal(createRes.status, 201);
  const complaintId = createRes.body.complaint.id;

  // HOD approve
  await request(app, {
    method: 'PATCH',
    path: `/api/approvals/${complaintId}`,
    token: hodToken,
    body: { status: 'APPROVED' },
  });

  // Assign
  const assignRes = await request(app, {
    method: 'PATCH',
    path: `/api/tickets/${complaintId}/assign-electrician`,
    token: supervisorToken,
    body: { electricianId: 'user-el1' },
  });
  assert.equal(assignRes.status, 200);
  const assignmentId = assignRes.body.assignment.id;

  // Complete assignment
  await request(app, {
    method: 'PATCH',
    path: `/api/jobs/${assignmentId}/status`,
    token: electricianToken,
    body: { status: 'IN_PROGRESS' },
  });

  await request(app, {
    method: 'PATCH',
    path: `/api/jobs/${assignmentId}/status`,
    token: electricianToken,
    body: { status: 'COMPLETED' },
  });

  // Submit ATR
  await request(app, {
    method: 'POST',
    path: `/api/jobs/${assignmentId}/action-taken`,
    token: electricianToken,
    body: { actionTaken: 'Replaced motor bearing' },
  });

  // Verify and close in single step
  const verifCloseRes = await request(app, {
    method: 'POST',
    path: `/api/verifications/${complaintId}/verify-and-close`,
    token: hodToken,
    body: { remarks: 'Inspected airflow; perfect.' },
  });

  assert.equal(verifCloseRes.status, 200);
  assert.equal(verifCloseRes.body.complaint.status, 'CLOSED');
  assert.ok(verifCloseRes.body.complaint.closedAt);
  assert.ok(verifCloseRes.body.complaint.verifiedAt);
});

test('Backend rejects complaints with SLA resolution date in the past with 400', async () => {
  process.env.JWT_SECRET = 'test-workflow-secret';
  delete process.env.DATABASE_URL;

  for (const key of Object.keys(require.cache)) {
    if (key.includes(`${path.sep}src${path.sep}`)) {
      delete require.cache[key];
    }
  }

  const createApp = require('../src/app');
  const app = createApp();
  const testPassword = 'LocalSupervisor!2026';

  const supervisorLogin = await request(app, {
    method: 'POST',
    path: '/api/auth/login',
    body: {
      username: 'supervisor1',
      password: testPassword,
    },
  });
  const supervisorToken = supervisorLogin.body.token;

  // Attempt to create complaint with past SLA date (e.g. yesterday)
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const pastRes = await request(app, {
    method: 'POST',
    path: '/api/complaints',
    token: supervisorToken,
    body: {
      title: 'Broken Light Switch',
      description: 'The light switch is sparking when turned on.',
      category: 'ELECTRICAL',
      priority: 'HIGH',
      slaDueAt: yesterday,
      locationBuilding: 'Main Academic Block',
      roomAreaNumber: 'Lab 101',
    },
  });

  assert.equal(pastRes.status, 400, 'Submitting past SLA date must return 400 Bad Request');
  assert.ok(
    pastRes.body.message && pastRes.body.message.toLowerCase().includes('sla'),
    'Error message should mention SLA date constraint'
  );
});

test('Estate / Campus Manager can track all allocated tickets and real-time execution status', async () => {
  process.env.JWT_SECRET = 'test-workflow-secret';
  delete process.env.DATABASE_URL;

  for (const key of Object.keys(require.cache)) {
    if (key.includes(`${path.sep}src${path.sep}`)) {
      delete require.cache[key];
    }
  }

  const createApp = require('../src/app');
  const app = createApp();
  const testPassword = 'LocalSupervisor!2026';

  // 1. Login as Manager
  const managerLogin = await request(app, {
    method: 'POST',
    path: '/api/auth/login',
    body: {
      username: 'manager1',
      password: testPassword,
    },
  });
  assert.equal(managerLogin.status, 200);
  const managerToken = managerLogin.body.token;

  // 2. Fetch allocated tickets via GET /api/tickets/allocated
  const allocatedRes = await request(app, {
    method: 'GET',
    path: '/api/tickets/allocated',
    token: managerToken,
  });

  assert.equal(allocatedRes.status, 200);
  assert.ok(Array.isArray(allocatedRes.body.assignments));
  assert.ok(allocatedRes.body.count >= 0);

  // If there are seeded assignments, verify data structure
  if (allocatedRes.body.assignments.length > 0) {
    const item = allocatedRes.body.assignments[0];
    assert.ok(item.id);
    assert.ok(item.technician);
    assert.ok(item.technician.fullName);
    assert.ok(item.status);
    assert.ok(item.complaint);
    assert.ok(item.complaint.ticketNumber);
  }
});
