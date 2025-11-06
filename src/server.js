import { AutoRouter, error, json } from "itty-router";
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import { HELLO_COMMAND } from "./commands.js";
import { InteractionResponseFlags } from "discord-interactions";

const router = AutoRouter();

router.post("/interactions", async (req, env) => {
  const { interaction, isValid } = await verifyDiscordRequest(req, env);
  if (!isValid || !interaction) {
    return error(401, "Invalid request signature");
  }

  if (interaction.type === InteractionType.PING) {
    return json({ type: InteractionResponseType.PONG });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const commandName = interaction.data.name;
    switch (commandName) {
      case HELLO_COMMAND.name:
        return handleHelloCommand();
      default:
        return error(400, "Unknown command");
    }
  }

  return error(400, "Unknown interaction type");
});

router.all("*", () => error(404, "Not Found"));

async function verifyDiscordRequest(req, env) {
  const signature = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");
  const body = await req.text();

  const isValidRequest =
    signature &&
    timestamp &&
    verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);

  return { interaction: JSON.parse(body) || null, isValid: isValidRequest };
}

function handleHelloCommand() {
  return json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: MessageComponentTypes.TEXT_DISPLAY,
          content: "Hello World",
        },
      ],
    },
  });
}
