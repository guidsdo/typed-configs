import {
    addConfigField,
    validateRequiredConfigValues,
    getConfigValueOptionsMap,
    processConfigFieldOptions,
    getConfigValueNames,
    runCustomValidations
} from "../configMetadata";
import { ExampleClass, removeConfigMetadata } from "./testHelpers";

describe("configMetadata", () => {
    afterEach(() => {
        removeConfigMetadata(ExampleClass);
    });

    describe("addConfigField", () => {
        it("should throw if a field already has been added", () => {
            // Act
            addConfigField(ExampleClass.prototype, "propertyNoDefaultValue", { required: true, name: "abcs", description: "a" }, true);

            // Act + Assert
            expect(() => addConfigField(ExampleClass.prototype, "propertyNoDefaultValue", {} as any, false)).toThrowError(
                "Property 'propertyNoDefaultValue' already defined on ExampleClass."
            );
        });

        it("should keep track of all added property's options", () => {
            // Act
            addConfigField(ExampleClass.prototype, "propertyNoDefaultValue", { required: true, name: "abcs", description: "a" }, true);

            // Assert
            expect(Array.from(getConfigValueOptionsMap(ExampleClass.prototype))).toStrictEqual([
                ["propertyNoDefaultValue", { description: "a", name: "abcs", required: true }]
            ]);

            // Act
            addConfigField(ExampleClass.prototype, "propertyDefaultHelloWorld", { required: false, name: "field", description: "b" }, true);

            // Assert
            expect(Array.from(getConfigValueOptionsMap(ExampleClass.prototype))).toStrictEqual([
                ["propertyNoDefaultValue", { description: "a", name: "abcs", required: true }],
                ["propertyDefaultHelloWorld", { description: "b", name: "field", required: false }]
            ]);
        });

        it("should add a setter that will complain if the config options have not been processed first", () => {
            addConfigField(ExampleClass.prototype, "propertyDefaultHelloWorld", { required: true, name: "abcs", description: "a" }, true);

            expect(() => new ExampleClass()).toThrowError(
                "Config field option 'propertyDefaultHelloWorld' of class 'ExampleClass' has not been processed"
            );
        });

        it("should add a setter for the field that won't allow different value type than specified", () => {
            // Add string type
            addConfigField(ExampleClass.prototype, "propertyDefaultHelloWorld", { required: true, name: "ABC", description: "a" }, true);

            // Mimick what Reflect Metadata does when there is a decorator
            Reflect.defineMetadata("design:type", String, ExampleClass.prototype, "propertyDefaultHelloWorld");

            // Make sure all the meta data have been set for type checking
            processConfigFieldOptions(ExampleClass);

            // Set the default class values
            const classInstance = new ExampleClass();

            expect(() => (classInstance.propertyDefaultHelloWorld = 0 as any)).toThrow(
                "Value '0' of property 'ABC' must be of type 'string'."
            );
        });
    });

    describe("validateRequiredConfigValues", () => {
        it("should throw an error if there is no config field set", () => {
            expect(() => validateRequiredConfigValues(new ExampleClass(), ExampleClass)).toThrowError(
                "Target ExampleClass doesn't have any config fields."
            );
        });

        it("should throw if a required field has not been set", () => {
            // Note: we can't test null or an empty string, because the setter that's added by 'addConfigField' won't allow it.

            // Arange
            addConfigField(ExampleClass.prototype, "propertyNoDefaultValue", { required: true, name: "FIELD_NAME", description: "" }, true);

            // Act + assert
            expect(() => validateRequiredConfigValues(new ExampleClass(), ExampleClass)).toThrowError(
                "Required value for property 'FIELD_NAME' has not been set."
            );
        });

        it("should not throw if an unset field isn't required", () => {
            // Arange
            addConfigField(ExampleClass.prototype, "propertyNoDefaultValue", { required: false, name: "field", description: "" }, true);

            // Act + assert
            expect(() => validateRequiredConfigValues(new ExampleClass(), ExampleClass)).not.toThrow();
        });

        it("should not throw if the prototype has an unknown field", () => {
            // Arange
            Object.defineProperty(ExampleClass.prototype, "bla", { value: "value", configurable: true });
            addConfigField(ExampleClass.prototype, "propertyNoDefaultValue", { required: false, name: "field", description: "" }, true);

            // Act + assert
            expect(() => validateRequiredConfigValues(new ExampleClass(), ExampleClass)).not.toThrow();
        });
    });

    describe("runCustomValidations", () => {
        it("should throw if a field is invalid according to the validate option", () => {
            // Arange
            Reflect.defineMetadata("design:type", Number, ExampleClass.prototype, "propertyDefaultAge");
            addConfigField(
                ExampleClass.prototype,
                "propertyDefaultAge",
                {
                    required: false,
                    name: "AGE",
                    description: "Driver age",
                    validate: (age: number) => age >= 18
                },
                true
            );
            processConfigFieldOptions(ExampleClass);

            // Act + assert
            expect(() => runCustomValidations(new ExampleClass(), ExampleClass)).toThrowError("The value for property 'AGE' is invalid.");
        });

        it("should throw a custom error if a field is invalid according to the validate option", () => {
            // Arange
            Reflect.defineMetadata("design:type", Number, ExampleClass.prototype, "propertyDefaultAge");
            addConfigField(
                ExampleClass.prototype,
                "propertyDefaultAge",
                {
                    required: false,
                    name: "AGE",
                    description: "Driver age",
                    validate: (age: number) => {
                        if (age < 18) {
                            throw new Error("Age config should be greater than 18.");
                        }

                        return true;
                    }
                },
                true
            );
            processConfigFieldOptions(ExampleClass);

            // Act + assert
            expect(() => runCustomValidations(new ExampleClass(), ExampleClass)).toThrowError("Age config should be greater than 18.");
        });

        it("should not throw if a field is valid according to the validate option", () => {
            // Arange
            Reflect.defineMetadata("design:type", Number, ExampleClass.prototype, "propertyDefaultAge");
            addConfigField(
                ExampleClass.prototype,
                "propertyDefaultAge",
                {
                    required: false,
                    name: "AGE",
                    description: "Driver age",
                    validate: (age: number) => age >= 16
                },
                true
            );
            processConfigFieldOptions(ExampleClass);

            // Act + assert
            expect(() => runCustomValidations(new ExampleClass(), ExampleClass)).not.toThrow();
        });
    });

    describe("getConfigValueNames", () => {
        it("should return all the names of a config", () => {
            // Mimick what Reflect Metadata does when there is a decorator
            Reflect.defineMetadata("design:type", String, ExampleClass.prototype, "propertyDefaultHelloWorld");
            addConfigField(ExampleClass.prototype, "propertyDefaultHelloWorld", { required: true, name: "FIELD1", description: "X" }, true);
            Reflect.defineMetadata("design:type", Boolean, ExampleClass.prototype, "propertyDefaultUndefined");
            addConfigField(ExampleClass.prototype, "propertyDefaultUndefined", { required: false, name: "DLIEF", description: "Y" }, true);
            processConfigFieldOptions(ExampleClass);

            // Act
            const names = getConfigValueNames(ExampleClass.prototype);

            expect(Array.from(names).sort((a, b) => a[0].localeCompare(b[0]))).toStrictEqual([
                ["DLIEF", { property: "propertyDefaultUndefined", type: "boolean" }],
                ["FIELD1", { property: "propertyDefaultHelloWorld", type: "string" }]
            ]);
        });
    });

    describe("processConfigFieldOptions", () => {
        it("should throw an error when the required field is defined but not a boolean", () => {
            addConfigField(ExampleClass.prototype, "propertyDefaultHelloWorld", { required: "" as any, name: "F", description: "X" }, true);

            expect(() => processConfigFieldOptions(ExampleClass)).toThrow(
                "Option 'required' for property 'propertyDefaultHelloWorld' is not a boolean in config 'ExampleClass'."
            );
        });

        it("should throw an error when the description isn't set correctly", () => {
            addConfigField(ExampleClass.prototype, "propertyDefaultHelloWorld", { required: false, name: "F", description: "" }, true);

            expect(() => processConfigFieldOptions(ExampleClass)).toThrow(
                "Option 'description' for property 'propertyDefaultHelloWorld' is not a valid string in config 'ExampleClass'."
            );
        });

        it("should throw an error when the description isn't set correctly", () => {
            // Mimick what Reflect Metadata does when there is a decorator and the type isn't a single primitive
            Reflect.defineMetadata("design:type", ExampleClass, ExampleClass.prototype, "propertyObject");
            addConfigField(ExampleClass.prototype, "propertyObject", { required: false, name: "F", description: "X" }, true);

            expect(() => processConfigFieldOptions(ExampleClass)).toThrow(
                `Invalid type 'class ExampleClass {
    constructor() {
        this.propertyDefaultNull = null;
        this.propertyDefaultEmptyString = \"\";
        this.propertyDefault0 = 0;
        this.propertyDefaultHelloWorld = \"HelloWorld\";
        this.propertyDefaultAge = 17;
    }
}' for property 'propertyObject' in config 'ExampleClass'. Type must be set to either: string, boolean, number.`
            );
        });

        it("should throw an error when the recommended value is of the wrong type", () => {
            // Mimick what Reflect Metadata does when there is a decorator and the type isn't a single primitive
            Reflect.defineMetadata("design:type", String, ExampleClass.prototype, "propertyDefaultHelloWorld");
            addConfigField(
                ExampleClass.prototype,
                "propertyDefaultHelloWorld",
                { recommendedValue: 3, required: false, name: "F", description: "X" },
                true
            );

            expect(() => processConfigFieldOptions(ExampleClass)).toThrow(
                "Invalid type 'number' for 'recommendedValue' of 'propertyDefaultHelloWorld' in config 'ExampleClass', must be string."
            );
        });

        it("should throw an error when the name fields doesn't adhere to the 'IEEE Std 1003.1-2017' standard", () => {
            // Mimick what Reflect Metadata does when there is a decorator and the type isn't a single primitive
            Reflect.defineMetadata("design:type", String, ExampleClass.prototype, "propertyDefaultHelloWorld");
            addConfigField(
                ExampleClass.prototype,
                "propertyDefaultHelloWorld",
                { required: false, name: "a name", description: "X", recommendedValue: "Hi there" },
                true
            );

            expect(() => processConfigFieldOptions(ExampleClass)).toThrow(
                "The name option of property 'propertyDefaultHelloWorld' must adhere to the by 'IEEE Std 1003.1-2017' defined standard."
            );
        });

        it("should throw not throw when all is fine and save the type of the fields", () => {
            // Mimick what Reflect Metadata does when there is a decorator and the type isn't a single primitive
            Reflect.defineMetadata("design:type", String, ExampleClass.prototype, "propertyDefaultHelloWorld");
            addConfigField(
                ExampleClass.prototype,
                "propertyDefaultHelloWorld",
                { required: false, name: "A_NAME", description: "X", recommendedValue: "Hi there" },
                true
            );

            expect(() => processConfigFieldOptions(ExampleClass)).not.toThrow();
        });
    });
});
