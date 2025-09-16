import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  moduleNameMapper: {
    '^@saas/(.*)$': '<rootDir>/../../packages/$1/src'
  }
};
export default config;
