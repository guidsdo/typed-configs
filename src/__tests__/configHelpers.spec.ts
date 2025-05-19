import { checkValue } from "../configHelpers";

describe("configHelpers", () => {
    describe("checkValue", () => {
        it("should return undefined when key isn't in the env object", () => {
            // expect(() => checkValue({}, "TEST_KEY", "string")).toThrow("Target ExampleClass doesn't have any config fields.");
            expect(checkValue({}, "TEST_KEY", "string")).toBeUndefined();
        });

        describe("when expecting a string", () => {
            it("should return a string when either 'true' or 'false' is passed", () => {
                expect(checkValue({ TEST_KEY: "true" }, "TEST_KEY", "string")).toBe("true");
                expect(checkValue({ TEST_KEY: "false" }, "TEST_KEY", "string")).toBe("false");
            });

            it("should return a string when a number is given", () => {
                expect(checkValue({ TEST_KEY: "8080" }, "TEST_KEY", "string")).toBe("8080");
                expect(checkValue({ TEST_KEY: "-1" }, "TEST_KEY", "string")).toBe("-1");
            });
        });

        describe("when expecting a boolean", () => {
            it("should return a boolean when either 'true' or 'false' is passed", () => {
                expect(checkValue({ TEST_KEY: "true" }, "TEST_KEY", "boolean")).toBe(true);
                expect(checkValue({ TEST_KEY: "false" }, "TEST_KEY", "boolean")).toBe(false);
            });

            it("should throw when a non-valid string boolean is given", () => {
                expect(() => checkValue({ TEST_KEY: "treu" }, "TEST_KEY", "boolean")).toThrowErrorMatchingSnapshot();
                expect(() => checkValue({ TEST_KEY: "0" }, "TEST_KEY", "boolean")).toThrowErrorMatchingSnapshot();
                expect(() => checkValue({ TEST_KEY: "1" }, "TEST_KEY", "boolean")).toThrowErrorMatchingSnapshot();
            });
        });

        describe("when expecting a number", () => {
            it("should return a number when a valid number string is passed", () => {
                expect(checkValue({ TEST_KEY: "8080" }, "TEST_KEY", "number")).toBe(8080);
                expect(checkValue({ TEST_KEY: "-1" }, "TEST_KEY", "number")).toBe(-1);
                expect(checkValue({ TEST_KEY: "1.1" }, "TEST_KEY", "number")).toBe(1.1);
            });

            it("should throw when a non-valid number string is given", () => {
                expect(() => checkValue({ TEST_KEY: "not-a-number" }, "TEST_KEY", "number")).toThrowErrorMatchingSnapshot();
                expect(() => checkValue({ TEST_KEY: "one" }, "TEST_KEY", "number")).toThrowErrorMatchingSnapshot();
                expect(() => checkValue({ TEST_KEY: "NaN" }, "TEST_KEY", "number")).toThrowErrorMatchingSnapshot();
                expect(() => checkValue({ TEST_KEY: "1 1" }, "TEST_KEY", "number")).toThrowErrorMatchingSnapshot();
            });
        });
    });
});
