export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ckwkcg0o80cckkg0oog8okk8.greatssystems.co.zw',
  ENDPOINTS: {
    USER_ROLES: '/user-roles',
    USERS: '/user',
    MACHINES: '/machine',
    SILOS: '/silo',
    SUPPLIERS: '/supplier',
    RAW_MATERIALS: '/raw-material',
    PROCESSES: '/process',
    PRODUCTION_PLANS: '/production-plan',
    DRIVER_FORMS: '/drivers-form',
  },
} as const
