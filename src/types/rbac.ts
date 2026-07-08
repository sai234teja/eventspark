export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  STUDENT = 'student'
}

export enum Permission {
  // Event Management
  CREATE_EVENT = 'create:event',
  EDIT_EVENT = 'edit:event',
  DELETE_EVENT = 'delete:event',
  VIEW_EVENTS = 'view:events',

  // Registration & Attendees
  MANAGE_REGISTRATIONS = 'manage:registrations',
  VIEW_ATTENDEES = 'view:attendees',
  REGISTER_FOR_EVENT = 'register:event',

  // Organization & Settings
  MANAGE_TEAM = 'manage:team',
  MANAGE_BILLING = 'manage:billing',
  MANAGE_SETTINGS = 'manage:settings',

  // Analytics
  VIEW_ANALYTICS = 'view:analytics'
}

type RolePermissions = {
  [key in Role]: Permission[];
};

export const ROLE_PERMISSIONS: RolePermissions = {
  [Role.OWNER]: [
    Permission.CREATE_EVENT, Permission.EDIT_EVENT, Permission.DELETE_EVENT, Permission.VIEW_EVENTS,
    Permission.MANAGE_REGISTRATIONS, Permission.VIEW_ATTENDEES, Permission.REGISTER_FOR_EVENT,
    Permission.MANAGE_TEAM, Permission.MANAGE_BILLING, Permission.MANAGE_SETTINGS,
    Permission.VIEW_ANALYTICS
  ],
  [Role.ADMIN]: [
    Permission.CREATE_EVENT, Permission.EDIT_EVENT, Permission.DELETE_EVENT, Permission.VIEW_EVENTS,
    Permission.MANAGE_REGISTRATIONS, Permission.VIEW_ATTENDEES, Permission.REGISTER_FOR_EVENT,
    Permission.MANAGE_TEAM, Permission.MANAGE_SETTINGS,
    Permission.VIEW_ANALYTICS
  ],
  [Role.MANAGER]: [
    Permission.CREATE_EVENT, Permission.EDIT_EVENT, Permission.VIEW_EVENTS,
    Permission.MANAGE_REGISTRATIONS, Permission.VIEW_ATTENDEES, Permission.REGISTER_FOR_EVENT,
    Permission.VIEW_ANALYTICS
  ],
  [Role.STAFF]: [
    Permission.VIEW_EVENTS,
    Permission.VIEW_ATTENDEES, Permission.REGISTER_FOR_EVENT
  ],
  [Role.STUDENT]: [
    Permission.VIEW_EVENTS,
    Permission.REGISTER_FOR_EVENT
  ]
};

export const hasPermission = (role: Role | string | null, permission: Permission): boolean => {
  if (!role) return false;
  
  // Cast to Role enum to check matrix
  const normalizedRole = role.toLowerCase() as Role;
  
  const permissionsForRole = ROLE_PERMISSIONS[normalizedRole];
  if (!permissionsForRole) return false;

  return permissionsForRole.includes(permission);
};
