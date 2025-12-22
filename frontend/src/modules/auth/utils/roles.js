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


export const ROLE_PERMISSIONS = {
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


export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}

export function isAuthorized(role, requiredPermissions = []) {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return requiredPermissions.every(p => hasPermission(role, p));
}