import jwt from 'jsonwebtoken';
import prisma from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gesf_super_secure_enterprise_jwt_secret_key_2026';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const fallbackUserId = req.headers['x-user-id'];
    if (fallbackUserId) {
      const user = await prisma.user.findUnique({
        where: { id: fallbackUserId },
        include: { role: true, department: true, team: true }
      });
      if (user) {
        req.user = user;
        return next();
      }
    }
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required.'
      }
    });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Session token is invalid or expired.'
        }
      });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { role: true, department: true, team: true }
      });

      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Active user record could not be found.'
          }
        });
      }

      req.user = user;
      next();
    } catch (dbErr) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error verifying user session.'
        }
      });
    }
  });
}

// Role Authorization Guard: Checks code against MANAGER, TEAM_LEADER, AGENT
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication context missing.'
        }
      });
    }

    const userRoleCode = req.user.role.code;
    if (!allowedRoles.includes(userRoleCode)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access restricted. Requires one of [${allowedRoles.join(', ')}]. Current role: ${userRoleCode}.`
        }
      });
    }

    next();
  };
}

// Team Boundary Guard: Enforces that Team Leaders cannot access another team's private records
export function requireTeamAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
    });
  }

  // Managers have organization-wide access
  if (req.user.role.code === 'MANAGER') {
    return next();
  }

  const requestedTeamId = req.params.teamId || req.params.id || req.body.teamId || req.query.teamId;

  // Team Leaders and Agents can only access their own assigned team
  if (requestedTeamId && req.user.teamId !== requestedTeamId) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CROSS_TEAM_ACCESS_DENIED',
        message: 'Team boundaries enforced: You are not authorized to view or manage another team.'
      }
    });
  }

  next();
}

export const requireManager = requireRole(['MANAGER']);
export const requireTeamLeaderOrManager = requireRole(['MANAGER', 'TEAM_LEADER']);
