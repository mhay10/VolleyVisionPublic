import { REST, Routes } from "discord.js";
import config from "./config.json" assert { type: "json" };
import { SlashCommandBuilder } from "discord.js";

// Command builders
const helpCommand = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Get help with the bot")
  .addStringOption((option) =>
    option
      .setName("command")
      .setDescription("Command to get help with")
      .setRequired(false)
      .addChoices(
        { name: "practice", value: "practice" },
        { name: "tournament", value: "tournament" }
      )
  );

const practiceCommand = new SlashCommandBuilder()
  .setName("practice")
  .setDescription("Create a practice post")
  .addStringOption((option) =>
    option.setName("date").setDescription("Date of practice").setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("location")
      .setDescription("Where practice is")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("start").setDescription("Start time").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("end").setDescription("End time").setRequired(true)
  );

const tournamentCommand = new SlashCommandBuilder()
  .setName("tournament")
  .setDescription("Create a tournament post")
  .addStringOption((option) =>
    option
      .setName("location")
      .setDescription("Where tournament is")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("datestart")
      .setDescription("Start date of tournament")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("dateend")
      .setDescription("End date of tournament")
      .setRequired(true)
  )
  .addNumberOption((option) =>
    option
      .setName("price")
      .setDescription("Price of tournament")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("deadline")
      .setDescription("Deadline to register")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("method")
      .setDescription("Method of travel")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("place")
      .setDescription("Place of tournament")
      .setRequired(true)
  );

// Command in API compatible format
export const commands = [
  helpCommand.toJSON(),
  practiceCommand.toJSON(),
  tournamentCommand.toJSON(),
];

// Create new REST client
const rest = new REST({ version: "10" }).setToken(config.token);

export async function registerCommands() {
  try {
    // Register commands with API
    console.log("Refreshing slash commands");
    await rest.put(Routes.applicationCommands(config.id), { body: commands });
    console.log("Successfully refreshed slash commands");
  } catch (error) {
    // Log error
    console.error(error);
  }
}
