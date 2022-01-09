// eslint-disable-next-line import/no-internal-modules,import/no-extraneous-dependencies
import { InitialOptions } from "@jest/types/build/Config";

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/setup.ts"],
  collectCoverageFrom: [
    "!__data__/**/*",
    "!__utils__/**/*",
    "!tests/**/*",
    "src/**/*",
  ],
} as InitialOptions;
