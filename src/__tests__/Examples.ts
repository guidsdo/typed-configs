import * as fs from "fs";

import { Configs } from "../ConfigManager";
import { Config, ConfigValue } from "../decorators";

@Config({ configYmlPath: "configs/test.yml" })
export class Communicator {
    @ConfigValue({ required: true, name: "GREETING", description: "They way you say hi to others", recommendedValue: "Hello" })
    greeting!: string;

    @ConfigValue({ required: false, name: "GOODBYE_MESSAGE", description: "The way you say goodbye. Optional." })
    goodbye: string = "/me left the chat";

    nonConfigProperty = "I don't need a type because I don't matter.";
}

Configs.getConfigsDefinitions().then(definitions => {
    fs.writeFileSync("configDefinitions.json", JSON.stringify(definitions));
});
