import { ClassTypeNoArgs, ConfigOptions, ConfigPropertyDefinition, ConfigSnapshot } from "./types";
import { getConfigValueNames, getConfigValueOptionsMap, processConfigFieldOptions, validateRequiredConfigValues } from "./configMetadata";
import { getEnvironmentVariableKeys, loadConfigfromYaml, loadEnvironmentVariable } from "./configHelpers";

class ConfigManager {
    private readonly configs = new Map<ClassTypeNoArgs, Object>();

    /**
     * Add a new config class to the configs list. Please use the decorators iso this, since this
     */
    add<I extends Object, T extends ClassTypeNoArgs<I>>(clazz: T, options?: ConfigOptions): void {
        if (this.configs.has(clazz)) {
            throw new Error(`Class already added '${clazz.name}'`);
        }

        // Validate the required field types and the property decorator options
        processConfigFieldOptions(clazz);

        // 1. Create an instance, so the default class values (like: property = "value") are set.
        this.configs.set(clazz, new clazz());
        const configInstance = this.configs.get(clazz) as I;
        const configNamePropertyMapping = getConfigValueNames(clazz.prototype);

        // 2. Load the values from given config path (overrides any value already set by a previous step).
        if (options?.configYmlPath) {
            const yamlValues = loadConfigfromYaml(options.configYmlPath);
            const knownYamlKeys = Object.keys(yamlValues).filter(yamlKey => configNamePropertyMapping.has(yamlKey));
            knownYamlKeys.forEach(key => {
                const configValueOptions = configNamePropertyMapping.get(key)!;
                (configInstance as any)[configValueOptions.property] = yamlValues[key];
            });
        }

        // 3. Load the values from the environment variables (overrides any value already set by a previous step).
        const envKeys = getEnvironmentVariableKeys();
        const knownEnvKeys = envKeys.filter(envKey => configNamePropertyMapping.has(envKey));
        knownEnvKeys.forEach(key => {
            const configValueOptions = configNamePropertyMapping.get(key)!;
            (configInstance as any)[configValueOptions.property] = loadEnvironmentVariable(key, configValueOptions.type);
        });

        // Make sure that any value that is required, has actually been set by either a default value, a config file or env.
        validateRequiredConfigValues(configInstance, clazz);

        this.configs.set(clazz, configInstance);
    }

    get<I>(clazz: ClassTypeNoArgs<I>): I {
        if (!this.configs.has(clazz)) {
            throw new Error(`Cannot find config instance for '${clazz.name}'`);
        }

        return this.configs.get(clazz) as I;
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

        const sortedConfigs = Array.from(this.configs.keys()).sort((a, b) => a.name.localeCompare(b.name));

        sortedConfigs.forEach(clazz => {
            const sortedValues = Array.from(getConfigValueOptionsMap(clazz.prototype)).sort((a, b) => a[1].name.localeCompare(b[1].name));
            sortedValues.forEach(([_, { name, description, required, type, recommendedValue }]) => {
                configPropertyDefinitions.push({ name, description, required, type, recommendedValue });
            });
        });

        return configPropertyDefinitions;
    }

    takeSnapshot(configClass: ClassTypeNoArgs): ConfigSnapshot {
        const snapshot: ConfigSnapshot = {};
        getConfigValueOptionsMap(configClass.prototype).forEach((configValueOptions, property) => {
            snapshot[property] = configValueOptions.value;
        });

        return snapshot;
    }

    restoreSnapshot(configClass: ClassTypeNoArgs, snapshot: ConfigSnapshot) {
        const instance = this.get(configClass);

        const knownProperties = Array.from(getConfigValueOptionsMap(configClass.prototype).keys());

        for (const property in snapshot) {
            if (!knownProperties.includes(property)) throw new Error(`Property '${property}' is unknown in config ${configClass.name}`);

            instance[property] = snapshot[property];
        }
    }

    /**
     * Remove all configs from the config manager. This doesn't remove any of the individual config data though.
     */
    removeAllConfigs() {
        this.configs.clear();
    }
}

export const Configs = new ConfigManager();
