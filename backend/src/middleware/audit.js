const { recordAuditLog } = require("../services/audit.service");

function auditTrail(req, res, next) {
  if (!["POST", "PATCH", "DELETE"].includes(req.method)) {
    return next();
  }

  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    if (res.statusCode < 400 && !req.path.startsWith("/api/admin/audit-logs")) {
      void recordAuditLog({
        userId: req.user?.userId || payload?.user?.id || null,
        action: req.audit?.action || `${req.method} ${req.path}`,
        resourceType: req.audit?.resourceType || req.baseUrl.replace("/api/", "") || "api",
        resourceId: req.audit?.resourceId || payload?.product?.id || payload?.sale?.id || payload?.order?.id || payload?.supplier?.id || null,
        method: req.method,
        path: `${req.baseUrl}${req.path}`,
        ipAddress: req.ip || req.socket?.remoteAddress || null,
        userAgent: req.headers["user-agent"] || null,
        metadata: req.audit?.metadata || null,
      });
    }

    return originalJson(payload);
  };

  next();
}

function setAuditContext(req, _res, next) {
  req.audit = req.audit || {};
  next();
}

module.exports = { auditTrail, setAuditContext };
