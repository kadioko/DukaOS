const prisma = require("../lib/prisma");

async function recordAuditLog(entry) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId || null,
        action: entry.action || "UNKNOWN",
        resourceType: entry.resourceType || "unknown",
        resourceId: entry.resourceId || null,
        method: entry.method || "GET",
        path: entry.path || "/",
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
        metadata: entry.metadata || null,
      },
    });
  } catch (error) {
    console.error("Failed to record audit log", error);
  }
}

module.exports = { recordAuditLog };
