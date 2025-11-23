export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  VENDEDOR: 'vendedor',
};

export const PERMISSIONS = {
  DASHBOARD: 'dashboard:access',
  PRODUCTS_MANAGE: 'products:manage',
  SALES_CREATE: 'sales:create',
  SALES_READ: 'sales:read',
  USERS_PANEL: 'users:panel',
  USERS_MANAGE: 'users:manage',
  MOVEMENTS_MANAGE: 'movements:manage',
};

const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.PRODUCTS_MANAGE,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_READ,
    PERMISSIONS.MOVEMENTS_MANAGE,
  ],
  [ROLES.VENDEDOR]: [
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_READ,
  ],
};

// middleware factory: requiere uno o varios permisos
export function requirePermission(required) {
  // required: string o array de strings
  const requiredArray = Array.isArray(required) ? required : [required];
  return (req, res, next) => {
    try {
      const user = req.user; // asume que auth middleware puso req.user con { id, rol, ... }
      if (!user) return res.status(401).json({ error: 'No autorizado' });
      const role = user.rol;
      const perms = ROLE_PERMISSIONS[role] || [];
      const ok = requiredArray.every(p => perms.includes(p));
      if (!ok) return res.status(403).json({ error: 'Permiso denegado' });
      next();
    } catch (err) {
      console.error('requirePermission error', err);
      res.status(500).json({ error: 'Error al comprobar permisos' });
    }
  };
}

// convenience middleware requireRole (por rol explícito)
export function requireRole(...roles) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'No autorizado' });
    if (!roles.includes(user.rol)) return res.status(403).json({ error: 'Rol no permitido' });
    next();
  };
}