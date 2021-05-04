# Typed Config

Library for accessing your config variables in a typed manner, with runtime checking and a definition exporter. Supports .yml and enviroment variables.

# How to use

1. In your `index.ts` of your project, add `import "reflect-metadata";`
1. Create a config file like this:
    ```typescript
    import { Config, ConfigValue } from "typed-configs";

    @Config({ configYmlPath: "configs/test.yml" })
    export class Communicator {
        @ConfigValue({ required: true, name: "GREETING", description: "They way you say hi to others", recommendedValue: "Hello" })
        greeting: string;

        @ConfigValue({ required: false, name: "GOODBYE_MESSAGE", description: "The way you say goodbye. Optional." })
        goodbye: string = "/me left the chat";

        nonConfigProperty = "I don't need a type because I don't matter.";
    }
    ```
1. Use the config class somewhere in your code so the decorators get a chance to register the class and its properties.
    ```typescript
    import { Configs } from "typed-configs";
    
    console.log(`User says: ${Configs.get(Communicator).greeting}`)
    ```
1. Export the config definition to an actual file (optional but kinda the goal of this library to support this). The `Configs.getConfigsDefinitions()` method is to know for sure all the decorators have been processed.
    ```typescript
    import * as fs from "fs";
    import { Configs } from "./ConfigManager";

    Configs.getConfigsDefinitions().then(definitions => {
        fs.writeFileSync("configDefinitions.json", JSON.stringify(definitions));
    });
    ```