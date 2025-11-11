const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

dotenv.config({ path: ".env" });
const token = process.env.DISCORD_TOKEN;
const appId = process.env.DISCORD_APPLICATION_ID;

if (!token) {
  throw new Error("DISCORD_TOKEN environment variable is not set");
}
if (!appId) {
  throw new Error("DISCORD_APPLICATION_ID environment variable is not set");
}

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  // Grab all the command files from the commands directory you created earlier
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(Routes.applicationCommands(appId), {
      body: commands,
    });

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();

// import { HELLO_COMMAND } from "./commands.js";
// import dotenv from "dotenv";
// import process from "node:process";

// const commands = JSON.stringify([HELLO_COMMAND]);

// dotenv.config({ path: ".env" });
// const token = process.env.DISCORD_TOKEN;
// const appId = process.env.DISCORD_APPLICATION_ID;

// if (!token) {
//   throw new Error("DISCORD_TOKEN environment variable is not set");
// }
// if (!appId) {
//   throw new Error("DISCORD_APPLICATION_ID environment variable is not set");
// }

// const registerUrl = `https://discord.com/api/v10/applications/${appId}/commands`;

// const res = await fetch(registerUrl, {
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: `Bot ${token}`,
//   },
//   method: "PUT",
//   body: commands,
// });

// if (res.ok) {
//   console.log("Successfully registered all commands");
//   const data = await res.json();
//   console.log(data);
// } else {
//   console.error("Error registering commands");
//   let errorText = `Error registering commands \n ${res.url}: ${res.status}  ${res.statusText}`;
//   try {
//     const error = await res.text();
//     if (error) {
//       errorText = `${errorText} \n\n ${error}`;
//     }
//   } catch (e) {
//     console.error("Error reading body from request:", e);
//   }
//   console.error(errorText);
// }
