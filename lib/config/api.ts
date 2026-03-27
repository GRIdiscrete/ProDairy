export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ckwkcg0o80cckkg0oog8okk8.greatssystems.co.zw',
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
