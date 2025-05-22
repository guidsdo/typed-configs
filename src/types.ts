export type SupportedConfigTypes = boolean | string | number;

export type ConfigValueType = "boolean" | "string" | "number";

export type ConfigValueOptions = {
    required: boolean;
    description: string;
    /**
     * Name of how the property can be used within a yaml file and env variables (must be all caps)
     */
    name: string;
    recommendedValue?: SupportedConfigTypes;
    /**
     * Non-async validations that will prevent the config from loading (and thus your program from running)
     * when returning a false value or throwing an error.
     */
    validate?: (value: any) => boolean;
};

export type AllConfigValueData = ConfigValueOptions & {
    type: ConfigValueType;
    value: SupportedConfigTypes;
};

export type ConfigSettings = {
    location: string;
};

export type ClassType<T extends object = any> = new (...args: any[]) => T;

export type ClassTypeNoArgs<T extends object = any> = new () => T;

export type ConfigPropertyDefinition = {
    /**
     * Name of how the property can be used within a yaml file and env variables (must be all caps)
     */
    name: string;
    type: ConfigValueType;
    required: boolean;
    description: string;
    recommendedValue?: SupportedConfigTypes;
};

export type ConfigSnapshot = Record<string, SupportedConfigTypes>;

export type ConfigOptions = {
    configYmlPath?: string;
    /**
     * By default false.
     */
    configYmlRequired?: boolean;

    /**
     * By default false.
     */
    ignoreEmptyEnvironmentVariables?: boolean;
};
