const bcrypt = require('bcryptjs');
require('dotenv').config();

let realPrisma = null;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
  try {
    const { Pool } = require('pg');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { PrismaClient } = require('@prisma/client');

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    const adapter = new PrismaPg(pool);
    realPrisma = new PrismaClient({ adapter });
    console.log('[AI Studio] Initialized Prisma with PostgreSQL connection.');
  } catch (err) {
    console.warn('[AI Studio] PostgreSQL initialization failed, falling back to in-memory store:', err.message);
    realPrisma = null;
  }
}

// In-Memory Database Store Mock for seamless operation without external DB
class InMemoryDatabase {
  constructor() {
    this.departments = new Map();
    this.users = new Map();
    this.complaints = new Map();
    this.assignments = new Map();
    this.actionTakenReports = new Map();
    this.verifications = new Map();
    this.statusHistories = new Map();

    this.seed();
    this.setupModels();
  }

  seed() {
    const dept1 = {
      id: 'dept-1',
      name: 'Electrical Engineering & Maintenance',
      code: 'EEE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.departments.set(dept1.id, dept1);

    const defaultTestPassword = process.env.TEST_PASSWORD || 'LocalSupervisor!2026';

    const defaultSeedUsers = [
      {
        id: 'user-sup1',
        employeeId: 'SUP001',
        username: 'supervisor1',
        password: process.env.SEED_SUPERVISOR_PASSWORD || defaultTestPassword,
        fullName: 'Test Supervisor',
        email: 'supervisor1@test.com',
        phone: '9876543210',
        role: 'SUPERVISOR',
        departmentId: 'dept-1',
        isActive: true,
      },
      {
        id: 'user-hod1',
        employeeId: 'HOD001',
        username: 'hod1',
        password: process.env.SEED_HOD_PASSWORD || defaultTestPassword,
        fullName: 'Test HOD',
        email: 'hod1@test.com',
        phone: '9876543211',
        role: 'HOD',
        departmentId: 'dept-1',
        isActive: true,
      },
      {
        id: 'user-eh1',
        employeeId: 'EH001',
        username: 'electricianhead1',
        password: process.env.SEED_ELECTRICIAN_HEAD_PASSWORD || defaultTestPassword,
        fullName: 'Test Electrician Head',
        email: 'electricianhead1@test.com',
        phone: '9876543212',
        role: 'ELECTRICIAN_HEAD',
        departmentId: 'dept-1',
        isActive: true,
      },
      {
        id: 'user-inc1',
        employeeId: 'INC001',
        username: 'incharge1',
        password: process.env.SEED_INCHARGE_PASSWORD || defaultTestPassword,
        fullName: 'Test Electrician Incharge',
        email: 'incharge1@test.com',
        phone: '9876543213',
        role: 'ELECTRICIAN_INCHARGE',
        departmentId: 'dept-1',
        isActive: true,
      },
      {
        id: 'user-el1',
        employeeId: 'EL001',
        username: 'electrician1',
        password: process.env.SEED_ELECTRICIAN_1_PASSWORD || defaultTestPassword,
        fullName: 'Test Electrician 1',
        email: 'electrician1@test.com',
        phone: '9876543214',
        role: 'ELECTRICIAN',
        departmentId: 'dept-1',
        isActive: true,
      },
      {
        id: 'user-el2',
        employeeId: 'EL002',
        username: 'electrician2',
        password: process.env.SEED_ELECTRICIAN_2_PASSWORD || defaultTestPassword,
        fullName: 'Test Electrician 2',
        email: 'electrician2@test.com',
        phone: '9876543215',
        role: 'ELECTRICIAN',
        departmentId: 'dept-1',
        isActive: true,
      },
      {
        id: 'user-mgr1',
        employeeId: 'MGR001',
        username: 'manager1',
        password: process.env.SEED_MANAGER_PASSWORD || defaultTestPassword,
        fullName: 'Test Manager',
        email: 'manager1@test.com',
        phone: '9876543216',
        role: 'MANAGER',
        departmentId: 'dept-1',
        isActive: true,
      },
      {
        id: 'user-dean1',
        employeeId: 'DEAN001',
        username: 'dean1',
        password: process.env.SEED_DEAN_PASSWORD || defaultTestPassword,
        fullName: 'Test Dean IQAC',
        email: 'dean1@test.com',
        phone: '9876543217',
        role: 'DEAN_IQAC',
        departmentId: 'dept-1',
        isActive: true,
      },
    ];

    for (const u of defaultSeedUsers) {
      const passwordHash = bcrypt.hashSync(u.password, 10);
      this.users.set(u.id, {
        id: u.id,
        employeeId: u.employeeId,
        username: u.username,
        passwordHash,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        role: u.role,
        departmentId: u.departmentId,
        isActive: u.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  setupModels() {
    const self = this;

    const populateUser = (u) => {
      if (!u) return null;
      const dept = u.departmentId ? self.departments.get(u.departmentId) || null : null;
      return { ...u, department: dept };
    };

    const populateComplaint = (c, include = {}) => {
      if (!c) return null;
      const result = { ...c };

      if (include.reporter) {
        const rep = self.users.get(c.reporterId);
        result.reporter = rep ? {
          id: rep.id,
          employeeId: rep.employeeId,
          username: rep.username,
          fullName: rep.fullName,
        } : null;
      }

      if (include.department) {
        result.department = c.departmentId ? self.departments.get(c.departmentId) || null : null;
      }

      if (include.equipment) {
        result.equipment = null;
      }

      if (include.assignments) {
        const asList = Array.from(self.assignments.values())
          .filter((a) => a.complaintId === c.id);
        result.assignments = asList.map((a) => {
          const tech = self.users.get(a.technicianId);
          return {
            ...a,
            technician: tech ? {
              id: tech.id,
              employeeId: tech.employeeId,
              username: tech.username,
              fullName: tech.fullName,
              role: tech.role,
            } : null,
          };
        });
      }

      if (include.atrs) {
        const atrs = Array.from(self.actionTakenReports.values())
          .filter((r) => r.complaintId === c.id)
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        result.atrs = atrs.map((atr) => {
          const submitter = atr.submittedById ? self.users.get(atr.submittedById) : null;
          return {
            ...atr,
            submittedBy: submitter ? {
              id: submitter.id,
              employeeId: submitter.employeeId,
              fullName: submitter.fullName,
            } : null,
          };
        });
      }

      if (include.verifications) {
        result.verifications = Array.from(self.verifications.values())
          .filter((v) => v.complaintId === c.id);
      }

      if (include.statusHistory) {
        result.statusHistory = Array.from(self.statusHistories.values())
          .filter((s) => s.complaintId === c.id)
          .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
      }

      if (include.hodApprovedBy) {
        const hod = c.hodApprovedById ? self.users.get(c.hodApprovedById) : null;
        result.hodApprovedBy = hod ? {
          id: hod.id,
          employeeId: hod.employeeId,
          fullName: hod.fullName,
        } : null;
      }

      return result;
    };

    const populateAssignment = (a, include = {}) => {
      if (!a) return null;
      const result = { ...a };

      if (include.technician) {
        const tech = self.users.get(a.technicianId);
        result.technician = tech ? {
          id: tech.id,
          employeeId: tech.employeeId,
          username: tech.username,
          fullName: tech.fullName,
          role: tech.role,
        } : null;
      }

      if (include.assignedBy) {
        const assigner = a.assignedById ? self.users.get(a.assignedById) : null;
        result.assignedBy = assigner ? {
          id: assigner.id,
          employeeId: assigner.employeeId,
          fullName: assigner.fullName,
          role: assigner.role,
        } : null;
      }

      if (include.complaint) {
        const cmp = self.complaints.get(a.complaintId);
        result.complaint = cmp ? populateComplaint(cmp, include.complaint.include || {}) : null;
      }

      return result;
    };

    this.user = {
      findFirst: async ({ where, include } = {}) => {
        for (const user of self.users.values()) {
          let match = true;
          if (where?.OR && Array.isArray(where.OR)) {
            match = where.OR.some((cond) => {
              for (const [k, v] of Object.entries(cond)) {
                if (user[k] === v) return true;
              }
              return false;
            });
          }
          if (where?.username && user.username !== where.username) match = false;
          if (where?.employeeId && user.employeeId !== where.employeeId) match = false;
          if (where?.email && user.email !== where.email) match = false;
          if (where?.role && user.role !== where.role) match = false;
          if (where?.isActive !== undefined && user.isActive !== where.isActive) match = false;

          if (match) return populateUser(user);
        }
        return null;
      },

      findUnique: async ({ where, select, include } = {}) => {
        let found = null;
        if (where?.id) {
          found = self.users.get(where.id);
        } else if (where?.employeeId) {
          for (const u of self.users.values()) {
            if (u.employeeId === where.employeeId) {
              found = u;
              break;
            }
          }
        } else if (where?.username) {
          for (const u of self.users.values()) {
            if (u.username === where.username) {
              found = u;
              break;
            }
          }
        }
        if (!found) return null;
        const populated = populateUser(found);
        if (select) {
          const selected = {};
          for (const [k, v] of Object.entries(select)) {
            if (v) selected[k] = populated[k];
          }
          return selected;
        }
        return populated;
      },

      findMany: async ({ where, select, orderBy } = {}) => {
        let results = Array.from(self.users.values());
        if (where) {
          if (where.role) results = results.filter((u) => u.role === where.role);
          if (where.isActive !== undefined) results = results.filter((u) => u.isActive === where.isActive);
        }
        if (orderBy?.fullName === 'asc') {
          results.sort((a, b) => a.fullName.localeCompare(b.fullName));
        }
        return results.map((u) => {
          const populated = populateUser(u);
          if (select) {
            const selected = {};
            for (const [k, v] of Object.entries(select)) {
              if (v) selected[k] = populated[k];
            }
            return selected;
          }
          return populated;
        });
      },

      create: async ({ data, select } = {}) => {
        const id = data.id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const user = {
          id,
          employeeId: data.employeeId,
          username: data.username,
          passwordHash: data.passwordHash,
          fullName: data.fullName,
          email: data.email || null,
          phone: data.phone || null,
          role: data.role || 'ELECTRICIAN',
          departmentId: data.departmentId || null,
          isActive: data.isActive !== undefined ? data.isActive : true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        self.users.set(id, user);
        const populated = populateUser(user);
        if (select) {
          const selected = {};
          for (const [k, v] of Object.entries(select)) {
            if (v) selected[k] = populated[k];
          }
          return selected;
        }
        return populated;
      },

      upsert: async ({ where, update, create } = {}) => {
        let existing = null;
        if (where?.employeeId) {
          for (const u of self.users.values()) {
            if (u.employeeId === where.employeeId) {
              existing = u;
              break;
            }
          }
        }
        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date() });
          self.users.set(existing.id, existing);
          return populateUser(existing);
        }
        return self.user.create({ data: create });
      },
    };

    this.complaint = {
      findMany: async ({ where, include, orderBy } = {}) => {
        let results = Array.from(self.complaints.values());

        if (where) {
          if (where.OR && Array.isArray(where.OR)) {
            results = results.filter((c) => {
              return where.OR.some((cond) => {
                let match = true;
                if (cond.hodApprovedById !== undefined && c.hodApprovedById !== cond.hodApprovedById) match = false;
                if (cond.departmentId !== undefined && c.departmentId !== cond.departmentId) match = false;
                if (cond.reporterId !== undefined && c.reporterId !== cond.reporterId) match = false;
                if (cond.hodApprovalStatus) {
                  if (typeof cond.hodApprovalStatus === 'string' && c.hodApprovalStatus !== cond.hodApprovalStatus) match = false;
                  if (cond.hodApprovalStatus.in && Array.isArray(cond.hodApprovalStatus.in) && !cond.hodApprovalStatus.in.includes(c.hodApprovalStatus)) match = false;
                }
                if (cond.status) {
                  if (typeof cond.status === 'string' && c.status !== cond.status) match = false;
                  if (cond.status.in && Array.isArray(cond.status.in) && !cond.status.in.includes(c.status)) match = false;
                }
                return match;
              });
            });
          }

          if (where.status) {
            if (typeof where.status === 'string') {
              results = results.filter((c) => c.status === where.status);
            } else if (where.status.in && Array.isArray(where.status.in)) {
              results = results.filter((c) => where.status.in.includes(c.status));
            } else if (where.status.not) {
              results = results.filter((c) => c.status !== where.status.not);
            }
          }

          if (where.hodApprovalStatus) {
            if (typeof where.hodApprovalStatus === 'string') {
              results = results.filter((c) => c.hodApprovalStatus === where.hodApprovalStatus);
            } else if (where.hodApprovalStatus.in && Array.isArray(where.hodApprovalStatus.in)) {
              results = results.filter((c) => where.hodApprovalStatus.in.includes(c.hodApprovalStatus));
            }
          }

          if (where.departmentId) {
            results = results.filter((c) => c.departmentId === where.departmentId);
          }

          if (where.reporterId) {
            results = results.filter((c) => c.reporterId === where.reporterId);
          }

          if (where.atrs?.some) {
            results = results.filter((c) => {
              return Array.from(self.actionTakenReports.values()).some((r) => r.complaintId === c.id);
            });
          }

          if (where.assignments?.some?.status) {
            results = results.filter((c) => {
              return Array.from(self.assignments.values()).some(
                (a) => a.complaintId === c.id && a.status === where.assignments.some.status
              );
            });
          }

          if (where.assignments?.none?.status?.in) {
            const activeStatuses = where.assignments.none.status.in;
            results = results.filter((c) => {
              const active = Array.from(self.assignments.values()).some(
                (a) => a.complaintId === c.id && activeStatuses.includes(a.status)
              );
              return !active;
            });
          }
        }

        if (orderBy?.createdAt === 'desc') {
          results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (orderBy?.createdAt === 'asc') {
          results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (orderBy?.lastUpdatedAt === 'desc') {
          results.sort((a, b) => new Date(b.lastUpdatedAt || b.updatedAt || 0) - new Date(a.lastUpdatedAt || a.updatedAt || 0));
        } else if (orderBy?.hodApprovedAt === 'asc') {
          results.sort((a, b) => new Date(a.hodApprovedAt || 0) - new Date(b.hodApprovedAt || 0));
        }

        return results.map((c) => populateComplaint(c, include));
      },

      findUnique: async ({ where, include } = {}) => {
        if (!where?.id) return null;
        const found = self.complaints.get(where.id);
        if (!found) return null;
        return populateComplaint(found, include);
      },

      create: async ({ data } = {}) => {
        const id = data.id || `cmp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const complaint = {
          id,
          ticketNumber: data.ticketNumber || `CMP-${Date.now()}`,
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority || 'MEDIUM',
          status: 'COMPLAINT_REGISTERED',
          reporterId: data.reporterId,
          departmentId: data.departmentId || null,
          equipmentId: data.equipmentId || null,
          locationBuilding: data.locationBuilding || null,
          floorArea: data.floorArea || null,
          roomAreaNumber: data.roomAreaNumber || null,
          requesterContact: data.requesterContact || data.contactPhone || null,
          locationIntercom: data.locationIntercom || null,
          hodApprovalStatus: 'PENDING',
          hodApprovedById: null,
          hodApprovedAt: null,
          hodRemarks: null,
          registeredAt: new Date(),
          slaDueAt: data.slaDueAt ? new Date(data.slaDueAt) : new Date(Date.now() + 86400000 * 3),
          lastUpdatedAt: new Date(),
          resolvedAt: null,
          verifiedAt: null,
          closedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        self.complaints.set(id, complaint);
        return complaint;
      },

      update: async ({ where, data } = {}) => {
        const existing = self.complaints.get(where.id);
        if (!existing) throw new Error(`Complaint ${where.id} not found`);
        Object.assign(existing, data, { updatedAt: new Date() });
        self.complaints.set(existing.id, existing);
        return { ...existing };
      },
    };

    this.assignment = {
      findMany: async ({ where, include, orderBy } = {}) => {
        let results = Array.from(self.assignments.values());
        if (where?.technicianId) {
          results = results.filter((a) => a.technicianId === where.technicianId);
        }
        if (where?.status) {
          if (typeof where.status === 'string') {
            results = results.filter((a) => a.status === where.status);
          } else if (where.status.in && Array.isArray(where.status.in)) {
            results = results.filter((a) => where.status.in.includes(a.status));
          }
        }
        if (where?.complaintId) {
          results = results.filter((a) => a.complaintId === where.complaintId);
        }
        if (orderBy?.assignedAt === 'desc') {
          results.sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));
        } else if (orderBy?.assignedAt === 'asc') {
          results.sort((a, b) => new Date(a.assignedAt) - new Date(b.assignedAt));
        }
        return results.map((a) => populateAssignment(a, include));
      },

      findUnique: async ({ where, include } = {}) => {
        if (!where?.id) return null;
        const found = self.assignments.get(where.id);
        if (!found) return null;
        return populateAssignment(found, include);
      },

      create: async ({ data, include } = {}) => {
        const id = data.id || `asg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const assignment = {
          id,
          complaintId: data.complaintId,
          technicianId: data.technicianId,
          assignedById: data.assignedById || null,
          status: data.status || 'ASSIGNED',
          assignedAt: new Date(),
          startedAt: null,
          completedAt: null,
          remarks: data.remarks || null,
        };
        self.assignments.set(id, assignment);
        return populateAssignment(assignment, include);
      },

      update: async ({ where, data, include } = {}) => {
        const existing = self.assignments.get(where.id);
        if (!existing) throw new Error(`Assignment ${where.id} not found`);
        Object.assign(existing, data);
        self.assignments.set(existing.id, existing);
        return populateAssignment(existing, include);
      },
    };

    this.actionTakenReport = {
      create: async ({ data } = {}) => {
        const id = data.id || `atr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const atr = {
          id,
          complaintId: data.complaintId,
          submittedById: data.submittedById,
          actionTaken: data.actionTaken,
          partsUsed: data.partsUsed || null,
          remarks: data.remarks || null,
          submittedAt: new Date(),
        };
        self.actionTakenReports.set(id, atr);
        return atr;
      },
      findFirst: async ({ where, orderBy } = {}) => {
        let results = Array.from(self.actionTakenReports.values());
        if (where?.complaintId) {
          results = results.filter((r) => r.complaintId === where.complaintId);
        }
        if (where?.submittedById) {
          results = results.filter((r) => r.submittedById === where.submittedById);
        }
        if (orderBy?.submittedAt === 'desc') {
          results.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        } else if (orderBy?.submittedAt === 'asc') {
          results.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
        }
        const first = results[0];
        if (!first) return null;
        const submitter = first.submittedById ? self.users.get(first.submittedById) : null;
        return {
          ...first,
          submittedBy: submitter ? {
            id: submitter.id,
            employeeId: submitter.employeeId,
            fullName: submitter.fullName,
          } : null,
        };
      },
      findMany: async ({ where, include, orderBy } = {}) => {
        let results = Array.from(self.actionTakenReports.values());
        if (where?.complaintId) {
          results = results.filter((r) => r.complaintId === where.complaintId);
        }
        if (where?.submittedById) {
          results = results.filter((r) => r.submittedById === where.submittedById);
        }
        if (orderBy?.submittedAt === 'desc') {
          results.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        } else if (orderBy?.submittedAt === 'asc') {
          results.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
        }
        return results.map((r) => {
          const submitter = r.submittedById ? self.users.get(r.submittedById) : null;
          return {
            ...r,
            submittedBy: submitter ? {
              id: submitter.id,
              employeeId: submitter.employeeId,
              fullName: submitter.fullName,
            } : null,
          };
        });
      },
      findUnique: async ({ where } = {}) => {
        if (!where?.id) return null;
        const found = self.actionTakenReports.get(where.id);
        if (!found) return null;
        const submitter = found.submittedById ? self.users.get(found.submittedById) : null;
        return {
          ...found,
          submittedBy: submitter ? {
            id: submitter.id,
            employeeId: submitter.employeeId,
            fullName: submitter.fullName,
          } : null,
        };
      },
    };

    this.verification = {
      create: async ({ data } = {}) => {
        const id = data.id || `ver-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const verification = {
          id,
          complaintId: data.complaintId,
          verifierId: data.verifierId,
          isVerified: data.isVerified,
          remarks: data.remarks || null,
          verifiedAt: new Date(),
        };
        self.verifications.set(id, verification);
        return verification;
      },
    };

    this.complaintStatusHistory = {
      create: async ({ data } = {}) => {
        const id = data.id || `csh-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const history = {
          id,
          complaintId: data.complaintId,
          status: data.status,
          remarks: data.remarks || null,
          changedById: data.changedById || null,
          changedAt: new Date(),
        };
        self.statusHistories.set(id, history);
        return history;
      },
    };

    this.department = {
      findMany: async () => Array.from(self.departments.values()),
      findUnique: async ({ where }) => (where?.id ? self.departments.get(where.id) || null : null),
    };
  }

  async $transaction(fn) {
    if (typeof fn === 'function') {
      return fn(this);
    }
    if (Array.isArray(fn)) {
      return Promise.all(fn);
    }
    return fn;
  }

  async $queryRaw() {
    return [{ 1: 1 }];
  }

  async $disconnect() {
    return Promise.resolve();
  }
}

const mockPrisma = new InMemoryDatabase();

const db = realPrisma || mockPrisma;

module.exports = db;
