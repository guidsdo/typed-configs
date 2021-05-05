# Typed Config

Library for accessing your config variables in a typed manner, with runtime checking and a definition exporter. Supports .yml and enviroment variables.

# How to use

1. In your `index.ts` of your project, add `import "reflect-metadata";`
1. Create a config file like this:

    ```typescript
    import { Config, ConfigValue } from "typed-configs";

    @Config({ configYmlPath: "configs/test.yml" })
    export class Communicator {
        @ConfigValue({
            name: "GREETING",
            description: "They way you say hi to others",
            required: true,
            recommendedValue: "Hello"
        })
        greeting!: string;

        @ConfigValue({
            name: "GOODBYE_MESSAGE",
            description: "The way you say goodbye. Optional.",
            required: false
        })
        goodbye: string = "/me left the chat";

        @ConfigValue({
            name: "IDLE_SOUND",
            description: "What do you say when doing nothing?",
            required: false
        })
        idleMessage?: string;

        nonConfigProperty = "I don't need a type because I don't matter.";
    }
    ```

1. Use the config class somewhere in your code so the decorators get a chance to register the class and its properties.

    ```typescript
    import { Configs } from "typed-configs";

    console.log(`User says: ${Configs.get(Communicator).greeting}`);
    ```

1. Export the config definition to an actual file (optional but kinda the goal of this library to support this). The `Configs.getConfigsDefinitions()` method is to know for sure all the decorators have been processed.

    ```typescript
    import * as fs from "fs";
    import { Configs } from "./ConfigManager";

    Configs.getConfigsDefinitions().then(definitions => {
        fs.writeFileSync("configDefinitions.json", JSON.stringify(definitions));
    });
    ```

# Important notes:

-   You're required to explicitly set the type of each field with Typescript. This is the only way we can make sure we know the required type before setting any (default) value. Only `string`, `number` and `boolean` are currently supported.
-   For setting the type of a field, `goodbye?: string;` is allowed, but `goodbye: string | undefined;` isn't. `reflect-metadata` will give the first one type `String` and the latter `Object` (which isn't allowed by the library).
-   When having a value that's required but doesn't have a default value (like `greeting` in our example), you can use an exclamation mark (like `greeting!: string;`) to make the types still work. The library will prevent your program to start if the value isn't provided.
