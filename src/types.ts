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
};

export type AllConfigValueData = ConfigValueOptions & {
    type: ConfigValueType;
    value: SupportedConfigTypes;
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
    recommendedValue?: SupportedConfigTypes;
};

export type ConfigSnapshot = Record<string, SupportedConfigTypes>;

export type ConfigOptions = {
    configYmlPath?: string;
    /**
     * By default true.
     */
    configYmlRequired?: boolean;
};
