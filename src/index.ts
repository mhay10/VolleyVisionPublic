import {
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  GuildMember,
} from "discord.js";
import config from "./config.json" assert { type: "json" };
import { registerCommands } from "./commands.js";
import { checkChannels, checkPermissions } from "./validation.js";
import {
  handleHelp,
  handlePractice,
  handleTournament,
} from "./commandHandlers.js";
import { sendEphermal } from "./util.js";
import {
  handleDetails,
  handleRegister,
  handleUnregister,
} from "./buttonHandlers.js";

// Create new client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("ready", async () => {
  // Register commands
  await registerCommands();
  console.log(`Logged in as ${client.user?.tag}!`);
});

// Handle commands
client.on("interactionCreate", async (interaction) => {
  // Handle command and buttons only
  if (interaction.isCommand()) {
    // Check if user has permissions
    const hasAuth = checkPermissions(interaction.member as GuildMember);
    if (!hasAuth) {
      sendEphermal(
        interaction,
        "You do not have permission to use this command."
      );
    }

    // Check if command is in right channel
    const inCorrectChannels = checkChannels(interaction);
    if (!inCorrectChannels) {
      sendEphermal(
        interaction,
        "You can only use this command in the practice or tournament channels."
      );
    }

    // Get command and args
    const command = interaction.commandName;
    const args = interaction.options.data;

    // Handle command
    switch (command) {
      case "help":
        await handleHelp(interaction, args);
        break;
      case "practice":
        await handlePractice(interaction, args);
        break;
      case "tournament":
        await handleTournament(interaction, args);
        break;
    }
  } else if (interaction.isButton()) {
    // Get button id
    const buttonId = interaction.customId;

    // Handle button id
    switch (buttonId) {
      case "guys":
      case "girls":
        await handleRegister(interaction, buttonId);
        break;
      case "unregister":
        await handleUnregister(interaction);
        break;
      case "details":
        await handleDetails(interaction);
        break;
    }
  }
});

// Run client
client.login(config.token);
