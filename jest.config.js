/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'node',
          ignoreDeprecations: '6.0',
          esModuleInterop: true
        }
      }
    ]
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/prisma.ts',
    '!src/swagger.ts',
    '!src/tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};