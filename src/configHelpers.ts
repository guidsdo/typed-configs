import * as fs from "fs";
import * as path from "path";
import * as Yaml from "yamljs";
import { ConfigValueType, SupportedConfigTypes } from "./types";
import { isEmptyValue } from "./configMetadata";

const currentDir = path.resolve(".");

export function loadConfigfromYaml(configPath: string, isRequired = false): Record<string, unknown> {
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

export function loadEnvironmentVariables() {
    return process.env;
}

export function getValueFromString(key: string, value: string | undefined, expectedType: ConfigValueType) {
    if (isEmptyValue(value)) return undefined;

    // All env variables are set as strings, so we need to check first if we can parse them
    switch (expectedType) {
        case "boolean":
            if (["true", "false"].includes(value)) return value === "true";
            break;
        case "number":
            if (value !== "" && Number.isFinite(Number(value))) return Number(value);
            break;
        case "string":
            return value;
    }

    throw new Error(`Invalid ENV value of property '${key}', which should be of type '${expectedType}' but got '${value}'.`);
}

export function getValue(key: string, value: unknown, expectedType: ConfigValueType): SupportedConfigTypes | undefined {
    if (isEmptyValue(value)) return undefined;
    if (typeof value === "string") return getValueFromString(key, value, expectedType);

    switch (expectedType) {
        case "number":
            if (typeof value === "number" && Number.isFinite(value)) return value;
            break;
        case "boolean":
            if (typeof value === "boolean") return value;
            break;
        case "string":
            if (typeof value === "string") return value;
            break;
    }

    throw new Error(`Invalid ENV value of property '${key}', which should be of type '${expectedType}' but got '${value}'.`);
}
