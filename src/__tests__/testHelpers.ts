import { ClassType } from "../types";

export class ExampleClass {
    propertyDefaultNull: string = null as any;
    propertyDefaultEmptyString = "";
    propertyDefaultUndefined!: boolean;

    propertyDefault0 = 0;
    propertyDefaultHelloWorld = "HelloWorld";
    propertyDefaultAge = 17;

    propertyObject!: ExampleClass;
}

export class ExtraExampleClass {
    propertyDefaultFooBar = "FooBar";
}

/**
 * Removes all fields and metadata from the given class.
 */
export function removeConfigMetadata(clazz: ClassType) {
    const classPrototype = clazz.prototype;

    for (const symbol of Object.getOwnPropertySymbols(classPrototype)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete classPrototype[symbol];
    }

    for (const property of Object.getOwnPropertyNames(classPrototype)) {
        // Obviously we don't want to delete the constructor
        if (property === "constructor") continue;

        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete classPrototype[property];
    }
}
