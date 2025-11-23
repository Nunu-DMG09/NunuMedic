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
  USERS_PANEL: 'users:panel', // acceso al panel/CRUD de usuarios
  USERS_MANAGE: 'users:manage', // crear/editar/eliminar usuarios
  MOVEMENTS_MANAGE: 'movements:manage',
  // agrega más permisos según necesites...
};

// asignación de permisos por rol
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // todo
  [ROLES.ADMIN]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.PRODUCTS_MANAGE,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_READ,
    PERMISSIONS.MOVEMENTS_MANAGE,
    // Nota: no incluye USERS_PANEL ni USERS_MANAGE
  ],
  [ROLES.VENDEDOR]: [
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_READ,
  ],
};

// helper: verificar si un rol tiene un permiso
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const perms = ROLE_PERMISSIONS[role] || [];
  // SUPER_ADMIN entró como todos los permisos automáticamente
  return perms.includes(permission);
}

// helper: verificar varios permisos (all required)
export function isAuthorized(role, requiredPermissions = []) {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return requiredPermissions.every(p => hasPermission(role, p));
}