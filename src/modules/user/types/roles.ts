export const Role = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];
