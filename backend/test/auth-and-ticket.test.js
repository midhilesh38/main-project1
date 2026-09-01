const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const jwt = require('jsonwebtoken');

const backendRoot = path.resolve(__dirname, '..');
const dbPath = require.resolve('../src/config/db');

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

const loadAppWithMockPrisma = (prisma) => {
  for (const key of Object.keys(require.cache)) {
    if (key.includes(`${path.sep}src${path.sep}`)) {
      delete require.cache[key];
    }
  }

  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: prisma,
  };

  process.env.JWT_SECRET = 'unit-test-secret';

  return require('../src/app')();
};

test('server exits before accepting traffic when JWT_SECRET is missing', () => {
  const result = spawnSync(process.execPath, [path.join(backendRoot, 'src/server.js')], {
    cwd: os.tmpdir(),
    env: {
      JWT_SECRET: '',
      PATH: process.env.PATH,
      Path: process.env.Path,
      SystemRoot: process.env.SystemRoot,
      PORT: '0',
    },
    encoding: 'utf8',
    timeout: 5000,
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing required environment variable: JWT_SECRET/);
});

test('protected ticket routes return 401 when JWT is missing', async () => {
  const prisma = {
    user: {
      findUnique: async () => null,
    },
  };
  const app = loadAppWithMockPrisma(prisma);

  const response = await request(app, {
    path: '/api/tickets/electricians',
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test('protected ticket routes return 401 when JWT is invalid', async () => {
  const prisma = {
    user: {
      findUnique: async () => null,
    },
  };
  const app = loadAppWithMockPrisma(prisma);

  const response = await request(app, {
    path: '/api/tickets/electricians',
    token: 'not-a-valid-token',
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test('assignment-only ticket routes return 403 for valid users with the wrong role', async () => {
  const prisma = {
    user: {
      findUnique: async () => ({
        id: 'electrician-user',
        employeeId: 'E-1',
        username: 'electrician',
        fullName: 'Electrician User',
        email: null,
        phone: null,
        role: 'ELECTRICIAN',
        departmentId: null,
        isActive: true,
      }),
    },
  };
  const app = loadAppWithMockPrisma(prisma);
  const token = jwt.sign({ userId: 'electrician-user' }, process.env.JWT_SECRET);

  const response = await request(app, {
    path: '/api/tickets/electricians',
    token,
  });

  assert.equal(response.status, 403);
  assert.equal(response.body.success, false);
});

test('authorized assignment role can assign an active electrician to an approved complaint', async () => {
  const calls = [];
  const prisma = {
    user: {
      findUnique: async () => ({
        id: 'hod-user',
        employeeId: 'H-1',
        username: 'hod',
        fullName: 'HOD User',
        email: null,
        phone: null,
        role: 'HOD',
        departmentId: null,
        isActive: true,
      }),
    },
    $transaction: async (callback) => callback({
      user: {
        findUnique: async () => ({
          id: 'tech-user',
          employeeId: 'E-2',
          username: 'tech',
          fullName: 'Tech User',
          role: 'ELECTRICIAN',
          isActive: true,
        }),
      },
      complaint: {
        findUnique: async () => ({
          id: 'complaint-1',
          ticketNumber: 'CMP-1',
          title: 'Light repair',
          hodApprovalStatus: 'APPROVED',
          assignments: [],
        }),
        update: async ({ data }) => {
          calls.push(['complaint.update', data]);
          return {
            id: 'complaint-1',
            ticketNumber: 'CMP-1',
            title: 'Light repair',
            status: data.status,
          };
        },
      },
      assignment: {
        create: async ({ data }) => {
          calls.push(['assignment.create', data]);
          return {
            id: 'assignment-1',
            ...data,
            status: 'ASSIGNED',
            technician: {
              id: 'tech-user',
              role: 'ELECTRICIAN',
            },
            complaint: {
              id: 'complaint-1',
            },
          };
        },
      },
      complaintStatusHistory: {
        create: async ({ data }) => {
          calls.push(['complaintStatusHistory.create', data]);
          return data;
        },
      },
    }),
  };
  const app = loadAppWithMockPrisma(prisma);
  const token = jwt.sign({ userId: 'hod-user' }, process.env.JWT_SECRET);

  const response = await request(app, {
    method: 'PATCH',
    path: '/api/tickets/complaint-1/assign-electrician',
    token,
    body: {
      electricianId: 'tech-user',
      remarks: 'Assigning for repair',
    },
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.assignment.technicianId, 'tech-user');
  assert.deepEqual(calls[0], ['assignment.create', {
    complaintId: 'complaint-1',
    technicianId: 'tech-user',
    assignedById: 'hod-user',
    remarks: 'Assigning for repair',
  }]);
  assert.equal(calls[1][1].status, 'REPAIR_ASSIGNED');
  assert.equal(calls[2][1].changedById, 'hod-user');
});

test('HOD rejection requires a reason', async () => {
  const prisma = {
    user: {
      findUnique: async () => ({
        id: 'hod-user',
        employeeId: 'H-1',
        username: 'hod',
        fullName: 'HOD User',
        email: null,
        phone: null,
        role: 'HOD',
        departmentId: null,
        isActive: true,
      }),
    },
  };
  const app = loadAppWithMockPrisma(prisma);
  const token = jwt.sign({ userId: 'hod-user' }, process.env.JWT_SECRET);

  const response = await request(app, {
    method: 'PATCH',
    path: '/api/approvals/complaint-1',
    token,
    body: {
      status: 'REJECTED',
    },
  });

  assert.equal(response.status, 400);
  assert.match(response.body.message, /Rejection reason is required/);
});

test('HOD cannot approve an already processed complaint', async () => {
  const prisma = {
    user: {
      findUnique: async () => ({
        id: 'hod-user',
        employeeId: 'H-1',
        username: 'hod',
        fullName: 'HOD User',
        email: null,
        phone: null,
        role: 'HOD',
        departmentId: null,
        isActive: true,
      }),
    },
    complaint: {
      findUnique: async () => ({
        id: 'complaint-1',
        hodApprovalStatus: 'APPROVED',
      }),
    },
  };
  const app = loadAppWithMockPrisma(prisma);
  const token = jwt.sign({ userId: 'hod-user' }, process.env.JWT_SECRET);

  const response = await request(app, {
    method: 'PATCH',
    path: '/api/approvals/complaint-1',
    token,
    body: {
      status: 'APPROVED',
    },
  });

  assert.equal(response.status, 400);
  assert.match(response.body.message, /already been processed/);
});

test('assignment rejects duplicate active assignments', async () => {
  const prisma = {
    user: {
      findUnique: async () => ({
        id: 'hod-user',
        employeeId: 'H-1',
        username: 'hod',
        fullName: 'HOD User',
        email: null,
        phone: null,
        role: 'HOD',
        departmentId: null,
        isActive: true,
      }),
    },
    $transaction: async (callback) => callback({
      user: {
        findUnique: async () => ({
          id: 'tech-user',
          employeeId: 'E-2',
          username: 'tech',
          fullName: 'Tech User',
          role: 'ELECTRICIAN',
          isActive: true,
        }),
      },
      complaint: {
        findUnique: async () => ({
          id: 'complaint-1',
          ticketNumber: 'CMP-1',
          hodApprovalStatus: 'APPROVED',
          assignments: [{ id: 'assignment-existing', status: 'ASSIGNED' }],
        }),
      },
    }),
  };
  const app = loadAppWithMockPrisma(prisma);
  const token = jwt.sign({ userId: 'hod-user' }, process.env.JWT_SECRET);

  const response = await request(app, {
    method: 'PATCH',
    path: '/api/tickets/complaint-1/assign-electrician',
    token,
    body: {
      electricianId: 'tech-user',
    },
  });

  assert.equal(response.status, 409);
  assert.match(response.body.message, /active assignment/);
});

test('electrician cannot update another electrician assignment', async () => {
  const prisma = {
    user: {
      findUnique: async () => ({
        id: 'tech-user',
        employeeId: 'E-1',
        username: 'tech',
        fullName: 'Tech User',
        email: null,
        phone: null,
        role: 'ELECTRICIAN',
        departmentId: null,
        isActive: true,
      }),
    },
    assignment: {
      findUnique: async () => ({
        id: 'assignment-1',
        technicianId: 'other-tech',
        status: 'ASSIGNED',
        complaintId: 'complaint-1',
      }),
    },
  };
  const app = loadAppWithMockPrisma(prisma);
  const token = jwt.sign({ userId: 'tech-user' }, process.env.JWT_SECRET);

  const response = await request(app, {
    method: 'PATCH',
    path: '/api/jobs/assignment-1/status',
    token,
    body: {
      status: 'IN_PROGRESS',
    },
  });

  assert.equal(response.status, 403);
  assert.match(response.body.message, /only your own jobs/);
});

test('electrician can perform valid ASSIGNED to IN_PROGRESS transition', async () => {
  const calls = [];
  const prisma = {
    user: {
      findUnique: async () => ({
        id: 'tech-user',
        employeeId: 'E-1',
        username: 'tech',
        fullName: 'Tech User',
        email: null,
        phone: null,
        role: 'ELECTRICIAN',
        departmentId: null,
        isActive: true,
      }),
    },
    assignment: {
      findUnique: async () => ({
        id: 'assignment-1',
        technicianId: 'tech-user',
        status: 'ASSIGNED',
        complaintId: 'complaint-1',
        remarks: null,
        complaint: {
          id: 'complaint-1',
        },
      }),
    },
    $transaction: async (callback) => callback({
      assignment: {
        update: async ({ data }) => {
          calls.push(['assignment.update', data]);
          return {
            id: 'assignment-1',
            status: data.status,
            complaintId: 'complaint-1',
          };
        },
      },
      complaint: {
        update: async ({ data }) => {
          calls.push(['complaint.update', data]);
          return data;
        },
      },
      complaintStatusHistory: {
        create: async ({ data }) => {
          calls.push(['complaintStatusHistory.create', data]);
          return data;
        },
      },
    }),
  };
  const app = loadAppWithMockPrisma(prisma);
  const token = jwt.sign({ userId: 'tech-user' }, process.env.JWT_SECRET);

  const response = await request(app, {
    method: 'PATCH',
    path: '/api/jobs/assignment-1/status',
    token,
    body: {
      status: 'IN_PROGRESS',
      remarks: 'Started',
    },
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.job.status, 'IN_PROGRESS');
  assert.equal(calls[0][1].status, 'IN_PROGRESS');
  assert.equal(calls[1][1].status, 'REPAIR_ASSIGNED');
});

test('closure is blocked before successful verification', async () => {
  const prisma = {
    user: {
      findUnique: async () => ({
        id: 'head-user',
        employeeId: 'EH-1',
        username: 'head',
        fullName: 'Head User',
        email: null,
        phone: null,
        role: 'ELECTRICIAN_HEAD',
        departmentId: null,
        isActive: true,
      }),
    },
    complaint: {
      findUnique: async () => ({
        id: 'complaint-1',
        status: 'ACTION_TAKEN',
        assignments: [{ id: 'assignment-1', status: 'COMPLETED' }],
        verifications: [],
      }),
    },
  };
  const app = loadAppWithMockPrisma(prisma);
  const token = jwt.sign({ userId: 'head-user' }, process.env.JWT_SECRET);

  const response = await request(app, {
    method: 'POST',
    path: '/api/verifications/complaint-1/close',
    token,
    body: {
      remarks: 'Ready to close',
    },
  });

  assert.equal(response.status, 400);
  assert.match(response.body.message, /successful verification/);
});
