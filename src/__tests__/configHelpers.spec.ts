import { getValue, getValueFromString, loadConfigfromYaml } from "../configHelpers";

describe("configHelpers", () => {
    describe("getValueFromString", () => {
        describe("when expecting a string", () => {
            it("should return a string when either 'true' or 'false' is passed", () => {
                expect(getValueFromString("TEST_KEY", "true", "string")).toBe("true");
                expect(getValueFromString("TEST_KEY", "false", "string")).toBe("false");
            });

            it("should return a string when a number is given", () => {
                expect(getValueFromString("TEST_KEY", "8080", "string")).toBe("8080");
                expect(getValueFromString("TEST_KEY", "-1", "string")).toBe("-1");
            });
        });

        describe("when expecting a boolean", () => {
            it("should return a boolean when either 'true' or 'false' is passed", () => {
                expect(getValueFromString("TEST_KEY", "true", "boolean")).toBe(true);
                expect(getValueFromString("TEST_KEY", "false", "boolean")).toBe(false);
            });

            it("should throw when a non-valid string boolean is given", () => {
                expect(() => getValueFromString("TEST_KEY", "treu", "boolean")).toThrowErrorMatchingSnapshot();
                expect(() => getValueFromString("TEST_KEY", "0", "boolean")).toThrowErrorMatchingSnapshot();
                expect(() => getValueFromString("TEST_KEY", "1", "boolean")).toThrowErrorMatchingSnapshot();
            });
        });

        describe("when expecting a number", () => {
            it("should return a number when a valid number string is passed", () => {
                expect(getValueFromString("TEST_KEY", "8080", "number")).toBe(8080);
                expect(getValueFromString("TEST_KEY", "-1", "number")).toBe(-1);
                expect(getValueFromString("TEST_KEY", "1.1", "number")).toBe(1.1);
            });

            it("should throw when a non-valid number string is given", () => {
                expect(() => getValueFromString("TEST_KEY", "not-a-number", "number")).toThrowErrorMatchingSnapshot();
                expect(() => getValueFromString("TEST_KEY", "one", "number")).toThrowErrorMatchingSnapshot();
                expect(() => getValueFromString("TEST_KEY", "NaN", "number")).toThrowErrorMatchingSnapshot();
                expect(() => getValueFromString("TEST_KEY", "1 1", "number")).toThrowErrorMatchingSnapshot();
            });
        });
    });

    describe("getValue", () => {
        it("should return undefined when the value is not set", () => {
            expect(getValue("TEST_KEY", undefined, "string")).toBeUndefined();
            expect(getValue("TEST_KEY", null, "string")).toBeUndefined();
            expect(getValue("TEST_KEY", "", "string")).toBeUndefined();
        });

        describe("when expecting a string", () => {
            it("should return a string when either true or false is passed", () => {
                expect(getValue("TEST_KEY", "true", "string")).toBe("true");
                expect(getValue("TEST_KEY", "false", "string")).toBe("false");
            });

            it("should return a string when a number is given", () => {
                expect(getValue("TEST_KEY", "8080", "string")).toBe("8080");
                expect(getValue("TEST_KEY", "-1", "string")).toBe("-1");
            });
        });

        describe("when expecting a boolean", () => {
            it("should return a boolean when either true or false is passed", () => {
                expect(getValue("TEST_KEY", true, "boolean")).toBe(true);
                expect(getValue("TEST_KEY", false, "boolean")).toBe(false);
            });

            it("should return a boolean when either 'true' or 'false' is passed", () => {
                expect(getValueFromString("TEST_KEY", "true", "boolean")).toBe(true);
                expect(getValueFromString("TEST_KEY", "false", "boolean")).toBe(false);
            });

            it("should throw when a non-valid string boolean is given", () => {
                expect(() => getValue("TEST_KEY", "treu", "boolean")).toThrowErrorMatchingSnapshot();
                expect(() => getValue("TEST_KEY", 0, "boolean")).toThrowErrorMatchingSnapshot();
                expect(() => getValue("TEST_KEY", 1, "boolean")).toThrowErrorMatchingSnapshot();
            });
        });

        describe("when expecting a number", () => {
            it("should return a number when a valid number string is passed", () => {
                expect(getValue("TEST_KEY", 8080, "number")).toBe(8080);
                expect(getValue("TEST_KEY", -1, "number")).toBe(-1);
                expect(getValue("TEST_KEY", 1.1, "number")).toBe(1.1);
            });

            it("should return a number when a valid number string is passed", () => {
                expect(getValue("TEST_KEY", "8080", "number")).toBe(8080);
                expect(getValue("TEST_KEY", "-1", "number")).toBe(-1);
                expect(getValue("TEST_KEY", "1.1", "number")).toBe(1.1);
            });

            it("should throw when a non-valid number string is given", () => {
                expect(() => getValue("TEST_KEY", "not-a-number", "number")).toThrowErrorMatchingSnapshot();
                expect(() => getValue("TEST_KEY", "one", "number")).toThrowErrorMatchingSnapshot();
                expect(() => getValue("TEST_KEY", "1 1", "number")).toThrowErrorMatchingSnapshot();
            });

            it("should throw when a non-valid number is given", () => {
                expect(() => getValue("TEST_KEY", NaN, "number")).toThrowErrorMatchingSnapshot();
            });
        });
    });

    describe("loadConfigfromYaml", () => {
        // This test is relevant because we need to ensure that config files are loaded as we expect when checking their values
        it("should load the config from a YAML file", () => {
            const config = loadConfigfromYaml(__dirname + "/TestConfig.yml", true);

            expect(config).toEqual({
                BOOLEAN_VALUE: true,
                DICTIONARY_VALUE: {
                    key1: "value1",
                    key2: "value2",
                    key3: "value3"
                },
                EMPTY_STRING: "",
                EMPTY_VALUE: null,
                LIST_VALUE: ["item1", "item2", "item3"],
                NESTED_LIST: [
                    "item1",
                    "item2",
                    {
                        item3: {
                            subitem1: "value1",
                            subitem2: "value2"
                        }
                    }
                ],
                NUMBER_VALUE: 42,
                STRING_VALUE: "Hello, World!"
            });
        });

        it("should throw an error when the config file does not exist and is required", () => {
            expect(() => loadConfigfromYaml("nonexistent.yml", true)).toThrowErrorMatchingSnapshot();
        });

        it("should not throw an error when the config file does not exist and is not required", () => {
            expect(() => loadConfigfromYaml("nonexistent.yml")).not.toThrow();
        });
    });
});
