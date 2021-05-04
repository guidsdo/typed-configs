import { AllConfigValueData, ConfigValueOptions, ConfigValueType } from "./types";

const configValuesSymbol = Symbol("configValues");

/**
 * Environment variable names used by the utilities in the Shell and Utilities volume of POSIX.1-2017 consist solely of uppercase letters,
 * digits, and the <underscore> ( '_' ) and do not begin with a digit.
 *
 * Source: https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap08.html
 */
const ENV_KEY_REGEX = /^([A-Z_])[A-Z\d_]*$/;

export function addConfigField(classPrototype: Object, property: string, configValueOptions: ConfigValueOptions) {
    if (!Object.getOwnPropertySymbols(classPrototype).includes(configValuesSymbol)) {
        Object.defineProperty(classPrototype, configValuesSymbol, { value: new Map<string, AllConfigValueData>() });
    }

    const configMap = getConfigValueOptionsMap(classPrototype);
    if (configMap.has(property)) {
        throw new Error(`Property '${property}' already defined on ${classPrototype.constructor.name}.`);
    }

    // We're adding the necessary fields when validating the config fields (once the ClassDecorator is called)
    configMap.set(property, configValueOptions as AllConfigValueData);

    // Add a getter and a setter so we can validate the initial/new values
    Object.defineProperty(classPrototype, property, {
        get: () => {
            return getConfigValueOptions(classPrototype, property).value;
        },
        set: (newValue: any) => {
            const configValueData = getConfigValueOptions(classPrototype, property);
            if ((configValueData.required && newValue === undefined) || typeof newValue !== configValueData.type) {
                throw new TypeError(`'${newValue}' must be of type '${configValueData.type}'.`);
            }

            configValueData.value = newValue;
        }
    });
}

export function processConfigFieldOptions(clazz: Function) {
    const configMap = getConfigValueOptionsMap(clazz.prototype);
    configMap.forEach((valueOptions, property) => {
        if (typeof valueOptions.required !== "boolean") {
            throw new Error(`Option 'required' for property '${property}' is not a boolean.`);
        } else if (typeof valueOptions.description !== "string" || !valueOptions.description.length) {
            throw new Error(`Option 'description' for property '${property}' is not a valid string.`);
        }

        // Design types are always set on the prototype of the class they're in
        const type = Reflect.getMetadata("design:type", clazz.prototype, property);
        if (!type || ![String, Boolean, Number].includes(type)) {
            throw new Error(`Invalid type '${type}' for property '${property}'. Type must be set to either: string, boolean, number.`);
        }

        // Check that the recommended value is also the correct type
        const designType = (type.name as string).toLocaleLowerCase();
        const recommendedValueType = typeof valueOptions.recommendedValue;
        if (valueOptions.recommendedValue && recommendedValueType !== designType) {
            throw new Error(`Invalid type '${recommendedValueType}' for 'recommendedValue' of '${property}', must be ${designType}.`);
        }

        // Check that the name field adheres to the required environment naming rules
        if (!valueOptions.name || !ENV_KEY_REGEX.test(valueOptions.name)) {
            throw new Error(`The name option of property '${property}' must adhere to the by 'IEEE Std 1003.1-2017' defined standard.`);
        }

        // Set the type so we can easily keep validating the new value
        valueOptions.type = designType as ConfigValueType;
    });
}

export function validateRequiredConfigValues(instance: Object, clazz: Function) {
    const configMap = getConfigValueOptionsMap(clazz.prototype);
    configMap.forEach((valueOptions, property) => {
        const value = (instance as Record<string, any>)[property];
        if (valueOptions.required && ["", undefined, null].includes(value)) {
            throw new Error(`Required value for property '${property}' has not been set.`);
        }
    });
}

export function getConfigValueNames(prototype: Object): Map<string, { property: string; type: ConfigValueType }> {
    const namePropertyMapping = new Map<string, { property: string; type: ConfigValueType }>();

    for (const iterator of getConfigValueOptionsMap(prototype)) {
        const [property, options] = iterator;
        namePropertyMapping.set(options.name, { property, type: options.type });
    }

    return namePropertyMapping;
}

function getConfigValueOptions(prototype: Object, property: string) {
    const configMap = getConfigValueOptionsMap(prototype);
    if (!configMap.has(property)) {
        throw new Error(`Property '${property}' isn't defined on ${prototype.constructor.name}.`);
    }

    return configMap.get(property)!;
}

export function getConfigValueOptionsMap(prototype: Object) {
    if (!Object.getOwnPropertySymbols(prototype).includes(configValuesSymbol)) {
        throw new Error(`Target ${prototype.constructor.name} doesn't have any config fields.`);
    }

    return (prototype as any)[configValuesSymbol] as Map<string, AllConfigValueData>;
}
