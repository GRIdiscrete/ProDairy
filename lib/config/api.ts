export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://assc4gos404g88scso8go4oc.102.218.14.210.sslip.io',
  ENDPOINTS: {
    USER_ROLES: '/user-roles',
    USERS: '/user',
    AUTH: '/auth',
    MACHINES: '/machine',
    SILOS: '/silo',
    SUPPLIERS: '/supplier',
    RAW_MATERIALS: '/raw-material',
    PROCESSES: '/process',
    PRODUCTION_PLANS: '/production-plan',
    DRIVER_FORMS: '/drivers-form',
    RAW_MILK_INTAKE_LAB_TEST: '/raw-milk-intake-lab-test',
    STERI_MILK_TEST_REPORT: '/steri-milk-test-report',
    RAW_MILK_RESULT_SLIP: '/raw-milk-result-slip',
  },
} as const
