import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],  // 👈 novo
  },
  moduleNameMapper: {
    '^@saas/shared-kafka/testing$': '<rootDir>/test/stubs/shared-kafka.ts',
    // 👇 mapeia o pacote diretamente para o stub TS
    '^@saas/shared-kafka$': '<rootDir>/test/stubs/shared-kafka.ts',
    // (opcional) se quiser stubbar o shared-config também:
    '^@saas/shared-config$': '<rootDir>/test/stubs/shared-config.ts',
    '^@saas/(.*)$': '<rootDir>/../../packages/$1/src',
  },
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/main.ts',
    '!<rootDir>/**/index.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
};
export default config;
