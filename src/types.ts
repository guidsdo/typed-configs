export type SupportedConfigTypes = boolean | string | number;

export type ConfigValueType = "boolean" | "string" | "number";

export type ConfigValueOptions = {
    /**
     * Name of how the property can be used within a yaml file and env variables (must be all caps)
     */
    name: string;
    description: string;
    required: boolean;
    /**
     * Set of values that are allowed. Example for a imaginary log level: ["none", "info", "warning", "error"]
     * Note: these values are also validated against the type of the config property
     */
    possibleValues?: SupportedConfigTypes[];
    recommendedValue?: SupportedConfigTypes;
};

export type AllConfigValueData = ConfigValueOptions & {
    type: ConfigValueType;
    value: SupportedConfigTypes;
    defaultValue: SupportedConfigTypes;
};

export type ConfigSettings = {
    location: string;
};

export interface ClassType<T extends Object = any> {
    new (...args: any[]): T;
}

export interface ClassTypeNoArgs<T extends Object = any> {
    new (): T;
}

export type ConfigPropertyDefinition = {
    /**
     * Name of how the property can be used within a yaml file and env variables (must be all caps)
     */
    name: string;
    type: ConfigValueType;
    required: boolean;
    description: string;
    defaultValue?: any;
    recommendedValue?: SupportedConfigTypes;
};

export type ConfigSnapshot = Record<string, SupportedConfigTypes>;

export type ConfigOptions = {
    configYmlPath?: string;
};
