import { ClassTypeNoArgs, ConfigOptions, ConfigPropertyDefinition, ConfigSnapshot, ConfigValueOptions, ConfigValueType } from "./types";
import { getConfigValueNames, getConfigValueOptionsMap, processConfigFieldOptions, validateRequiredConfigValues } from "./configMetadata";
import { getEnvironmentVariableKeys, loadConfigfromYaml, loadEnvironmentVariable } from "./configHelpers";

class ConfigManager {
    private readonly configs = new Map<ClassTypeNoArgs, Object>();

    /**
     * Add a new config class to the configs list. Please only use this if you know what you're doing.
     */
    add<I extends Object, T extends ClassTypeNoArgs<I>>(configClass: T, options?: ConfigOptions): void {
        if (this.configs.has(configClass)) {
            throw new Error(`Class already added '${configClass.name}'`);
        }

        // Validate the required field types and the property decorator options
        processConfigFieldOptions(configClass);

        // 1. Create an instance, so the default class values (like: property = "value") are set.
        this.configs.set(configClass, new configClass());
        const configInstance = this.configs.get(configClass) as I;
        const configNamePropertyMapping = getConfigValueNames(configClass.prototype);

        // 2. Set the default values as 'defaultValue' in the config property

        // 3. Load the values from given config path (overrides any value already set by a previous step).
        if (options?.configYmlPath) {
            const yamlValues = loadConfigfromYaml(options.configYmlPath);
            const knownYamlKeys = Object.keys(yamlValues).filter(yamlKey => configNamePropertyMapping.has(yamlKey));
            knownYamlKeys.forEach(key => {
                const configValueOptions = configNamePropertyMapping.get(key)!;
                (configInstance as any)[configValueOptions.property] = yamlValues[key];
            });
        }

        // 4. Load the values from the environment variables (overrides any value already set by a previous step).
        const envKeys = getEnvironmentVariableKeys();
        const knownEnvKeys = envKeys.filter(envKey => configNamePropertyMapping.has(envKey));
        knownEnvKeys.forEach(key => {
            const configValueOptions = configNamePropertyMapping.get(key)!;
            (configInstance as any)[configValueOptions.property] = loadEnvironmentVariable(key, configValueOptions.type);
        });

        // Make sure that any value that is required, has actually been set by either a default value, a config file or env.
        validateRequiredConfigValues(configInstance, configClass);

        this.configs.set(configClass, configInstance);
    }

    /**
     * Get the config instance of the given class.
     *
     * @param configClass The config class you want the instance of.
     * @returns the class' instance
     */
    get<I>(configClass: ClassTypeNoArgs<I>): I {
        if (!this.configs.has(configClass)) {
            throw new Error(`Cannot find config instance for '${configClass.name}'`);
        }

        return this.configs.get(configClass) as I;
    }

    /**
     * Returns an array of all the properties and their options. This can be exported to a file for example.
     * Awaits a javascript tick, so we know for sure that all config have been loaded. This only works if the config is used somewhere.
     */
    async getConfigsDefinitions(): Promise<ConfigPropertyDefinition[]> {
        // Await a javascript tick so the configs can be loaded
        await new Promise(resolve => setTimeout(resolve));

        // We export to an array so the definitions are ordered, which can be helpful
        const configPropertyDefinitions: ConfigPropertyDefinition[] = [];

        // Sort by name property so the order is guaranteed to remain the same
        const sortedConfigs = Array.from(this.configs.keys()).sort((a, b) => a.name.localeCompare(b.name));

        sortedConfigs.forEach(clazz => {
            const sortedValues = Array.from(getConfigValueOptionsMap(clazz.prototype)).sort((a, b) => a[1].name.localeCompare(b[1].name));
            sortedValues.forEach(([_, { name, description, required, type, recommendedValue }]) => {
                configPropertyDefinitions.push({ name, description, required, type, recommendedValue });
            });
        });

        return configPropertyDefinitions;
    }

    /**
     * Copy all the current values of the given config class. This can later be used to restore the values.
     *
     * @param configClass
     * @example
     * describe("Example", () => {
     *     let mainConfigSnapshot: Record<string, any>;
     *
     *     beforeEach(() => {
     *         mainConfigSnapshot = Configs.takeSnapshot(MainConfig);
     *         Configs.get(MainConfig).greeting = "Hey dude";
     *     });
     *
     *     afterEach(() => Configs.restoreSnapshot(FileStoreConfig, fileStoreConfigSnapshot));
     *
     *     it("Some test", () => {
     *         const greeter = new Greeter("Bob");
     *         expect(greeter.sayGreeting()).toBe("Hey dude");
     *     });
     * });
     *
     * @returns all the current values of the config
     */
    takeSnapshot(configClass: ClassTypeNoArgs): ConfigSnapshot {
        const snapshot: ConfigSnapshot = {};
        getConfigValueOptionsMap(configClass.prototype).forEach((configValueOptions, property) => {
            snapshot[property] = configValueOptions.value;
        });

        return snapshot;
    }

    /**
     * Restore the values of the given config class with all the values of the given snapshot.
     *
     * @param configClass
     * @param snapshot
     *
     * @example See Configs.takeSnapshot() for a full example
     */
    restoreSnapshot(configClass: ClassTypeNoArgs, snapshot: ConfigSnapshot): void {
        const instance = this.get(configClass);

        const knownProperties = Array.from(getConfigValueOptionsMap(configClass.prototype).keys());

        for (const property in snapshot) {
            if (!knownProperties.includes(property)) throw new Error(`Property '${property}' is unknown in config ${configClass.name}`);

            instance[property] = snapshot[property];
        }
    }

    /**
     * Remove all configs from the config manager. This doesn't remove any of the individual config data though. Added for testing purposes.
     */
    removeAllConfigs(): void {
        this.configs.clear();
    }

    /**
     * Get the config property metadata
     *
     * @returns {} { name: string, description, required, type, recommendedValue }
     */
    getConfigPropertyMetadata<I>(
        configClass: ClassTypeNoArgs<I>,
        property: keyof I & string
    ): ConfigValueOptions & { type: ConfigValueType } {
        const configValueOptionMap = getConfigValueOptionsMap(configClass.prototype);
        if (!configValueOptionMap.has(property)) {
            throw new Error(`Property '${property}' is unknown in config ${configClass.name}`);
        }

        const { name, description, required, type, recommendedValue } = configValueOptionMap.get(property)!;
        return { name, description, required, type, recommendedValue };
    }
}

export const Configs = new ConfigManager();
