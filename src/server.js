const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

client.login(env.DISCORD_TOKEN);

// import { AutoRouter, error, json } from "itty-router";
// import {
//   InteractionResponseType,
//   InteractionType,
//   verifyKey,
// } from "discord-interactions";
// import { HELLO_COMMAND } from "./commands.js";
// import {
//   InteractionResponseFlags,
//   MessageComponentTypes,
// } from "discord-interactions";

// const router = AutoRouter();

// router.post("/interactions", async (req, env) => {
//   try {
//     const { interaction, isValid } = await verifyDiscordRequest(req, env);
//     if (!isValid || !interaction) {
//       return error(401, "Invalid request signature");
//     }

//     if (interaction.type === InteractionType.PING) {
//       return json({ type: InteractionResponseType.PONG });
//     }

//     if (interaction.type === InteractionType.APPLICATION_COMMAND) {
//       const commandName = interaction.data.name;
//       switch (commandName) {
//         case HELLO_COMMAND.name:
//           return handleHelloCommand();
//         default:
//           return error(400, "Unknown command");
//       }
//     }

//     return error(400, "Unknown interaction type");
//   } catch (e) {
//     console.error("Unhandled error in /interactions", e);
//     return error(500, "Internal Server Error");
//   }
// });

// router.all("*", () => error(404, "Not Found"));

// async function verifyDiscordRequest(req, env) {
//   const signature = req.headers.get("X-Signature-Ed25519");
//   const timestamp = req.headers.get("X-Signature-Timestamp");
//   const body = await req.text();

//   try {
//     const isValidRequest =
//       signature &&
//       timestamp &&
//       (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));

//     return { interaction: JSON.parse(body), isValid: isValidRequest };
//   } catch (e) {
//     return { interaction: null, isValid: false };
//   }
// }

// function handleHelloCommand() {
//   return json({
//     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
//     data: {
//       flags: InteractionResponseFlags.IS_COMPONENTS_V2,
//       components: [
//         {
//           type: MessageComponentTypes.TEXT_DISPLAY,
//           content: "Hello Developer",
//         },
//       ],
//     },
//   });
// }

// const server = {
//   fetch: router.fetch,
// };

// export default server;
