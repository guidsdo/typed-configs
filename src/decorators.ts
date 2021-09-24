import { SupportedConfigTypes } from ".";
import { Configs } from "./ConfigManager";
import { addConfigField } from "./configMetadata";
import { ConfigValueOptions, ClassTypeNoArgs } from "./types";

/**
 * A class decorator's return value will always be called with Classname on code initialisation.
 * This means that you're manipulating the class and not an instance of the given class.
 *
 * We only allow a constructor without args, so we can instantiate and check all (required) property values right away.
 */
type ClassTypeDecorator<T> = (clazz: ClassTypeNoArgs<T>) => void;

type ConfigOptions = {
    configYmlPath?: string;
};

export function Config<T>(options?: ConfigOptions): ClassTypeDecorator<T> {
    return clazz => Configs.add(clazz, options);
}

/**
 * A PropertyDecorator's return value will always be called with Classname.prototype on code initialisation.
 * This means that you're manipulating the class' prototype and not an instance of the given class.
 */
type SimplePropertyDecorator = (target: object, propertyKey: string) => void;

export function ConfigValue(options: {
    name: string;
    description: string;
    required: boolean;
    requiredIf: keyof 
    possibleValues?: SupportedConfigTypes[];
    recommendedValue?: SupportedConfigTypes;
}): SimplePropertyDecorator {
    return (target, propertyKey) => {
        addConfigField(target, propertyKey, options);
    };
}
