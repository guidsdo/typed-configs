import type { Config } from "jest";

export default async (): Promise<Config> => {
    // https://jestjs.io/docs/en/configuration.html
    return {
        // Use ts-jest to enable correct code coverage
        preset: "ts-jest",

        // Automatically clear mock calls and instances between every test
        clearMocks: true,

        // The directory where Jest should output its coverage files
        coverageDirectory: "coverage",

        // An array of regexp pattern strings used to skip coverage collection
        coveragePathIgnorePatterns: ["/node_modules/", "__tests__", "__mocks__", ".json", ".js", "index.ts"],
        collectCoverageFrom: ["**/src/**/*.ts"],

        // Log all the individual tests
        verbose: true,

        // Make calling deprecated APIs throw helpful error messages
        errorOnDeprecated: true,

        // The test environment that will be used for testing
        testEnvironment: "node",

        // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
        testPathIgnorePatterns: ["/node_modules/", "/lib"],
        testMatch: ["**/__tests__/**/*.spec.ts"],
        setupFiles: ["<rootDir>/src/__tests__/testSetup.ts"]
    };
};
