import * as fs from "fs";
import * as path from "path";
import * as Yaml from "yamljs";
import { ConfigValueType } from "./types";

const currentDir = path.resolve(".");

export function loadConfigfromYaml(configPath: string, isRequired = false): Record<string, any> {
    const cfgPathCurrentDir = path.join(currentDir, configPath);
    const checkedConfigPath = fs.existsSync(configPath) ? configPath : fs.existsSync(cfgPathCurrentDir) ? cfgPathCurrentDir : undefined;

    if (!checkedConfigPath) {
        if (isRequired) {
            throw new Error(`Configuration file '${configPath}' does not exist`);
        }

        return {};
    }

    return Yaml.load(configPath);
}

export function getEnvironmentVariableKeys(filterEmptyValues = false): string[] {
    return filterEmptyValues
        ? Object.entries(process.env)
              .filter(([, value]) => value != "")
              .map(([key]) => key)
        : Object.keys(process.env);
}

export function loadEnvironmentVariable(key: string, expectedType: ConfigValueType) {
    return checkValue(process.env, key, expectedType);
}

export function checkValue(envObject: NodeJS.ProcessEnv, key: string, expectedType: ConfigValueType) {
    const value = envObject[key];

    if (value === undefined) return undefined;

    // All env variables are set as strings, so we need to check first if we can parse them
    switch (expectedType) {
        case "boolean":
            if (["true", "false"].includes(value)) return value === "true";
            break;
        case "number":
            if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
            break;
        case "string":
            return value;
    }

    throw new Error(`Invalid ENV value of property '${key}', which should be of type '${expectedType}' but got '${value}'.`);
}
