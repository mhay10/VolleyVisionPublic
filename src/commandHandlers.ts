import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  CommandInteractionOption,
  EmbedBuilder,
} from "discord.js";
import config from "./config.json" assert { type: "json" };
import { db, randomEmoji, sendEphermal, titleCase } from "./util.js";
import { parseDate } from "chrono-node";
import strftime from "strftime";
import { Tournament } from "./tournament.js";

// Help command
export async function handleHelp(
  interaction: CommandInteraction,
  args: readonly CommandInteractionOption[],
) {
  // Check if specific command requested
  if (args.length > 0) {
    let message = "Command not found.";

    const command = args[0].value;
    switch (command) {
      case "practice":
        message =
          "Create a practice post.\n" +
          "Usage: `/practice [date] [location] [start] [end]`\n" +
          "Example: `/practice date:Aug 31 2023 location:Memorial Park start:5pm end:7pm`";
        break;
      case "tournament":
        message =
          "Create a tournament post.\n" +
          "Usage: `/tournament [location] [datestart] [dateend] [price] [deadline] [method] [place]`\n" +
          "Example: `/tournament location:Memorial Park datestart:Oct 6 2023 dateend:Oct 8 2023 price:35 deadline:Sept 22 2023 method:driving place:Colorado Springs, CO`";
        break;
    }

    await interaction.reply({ content: message, ephemeral: true });
  } else {
    // Send general help message
    const message =
      "Get help with the bot.\n" +
      "Usage: `/help [command]`\n" +
      "Commands:\n" +
      "`/help` - Get help with the bot\n" +
      "`/help practice` - Get help with the practice command\n" +
      "`/help tournament` - Get help with the tournament command";

    await interaction.reply({ content: message, ephemeral: true });
  }
}

// Practice command
export async function handlePractice(
  interaction: CommandInteraction,
  args: readonly CommandInteractionOption[],
) {
  // Check that command in practice channels
  if (!config.channels.practice.includes(interaction.channelId)) {
    sendEphermal(interaction, "Command not allowed in this channel.");
    return;
  }

  // Parse date and times
  const date = parseDate(
    <string>args.find((arg) => arg.name === "date")?.value,
  );
  const start = parseDate(
    <string>args.find((arg) => arg.name === "start")?.value,
  );
  const end = parseDate(<string>args.find((arg) => arg.name === "end")?.value);

  // Validate date and times
  let error = "";
  if (!date) error += "Invalid date.\n";
  if (!start) error += "Invalid start time.\n";
  if (!end) error += "Invalid end time.\n";
  if (start && end && start > end)
    error += "Start time must be before end time.";

  // Send error message if invalid
  if (error) {
    sendEphermal(interaction, error);
    return;
  }

  // Get location
  const location = args.find((arg) => arg.name === "location")?.value;

  // Create embed
  const title = `__${strftime("%A", date)} Practice__`;
  const desc =
    `**Date:** ${strftime("%A, %B %d, %Y", date)}\n` +
    `**Time:** ${strftime("%I:%M %p", start)} - ${strftime(
      "%I:%M %p",
      end,
    )}\n` +
    `**Location:** ${location}`;
  const color = "#00ff00";

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(desc)
    .setColor(color);

  // Send and react to message
  const msg = await interaction.reply({
    content: "@everyone",
    embeds: [embed],
    fetchReply: true,
  });
  await msg.react(randomEmoji());

  // Log post creation
  console.log(`Practice post created in ${interaction.channelId}.`);
}

// Tournament command
export async function handleTournament(
  interaction: CommandInteraction,
  args: readonly CommandInteractionOption[],
) {
  // Check that in tournament channels
  if (!config.channels.tournaments.includes(interaction.channelId)) {
    sendEphermal(interaction, "Command not allowed in this channel.");
    return;
  }

  // Parse dates
  const dateStart = parseDate(
    <string>args.find((arg) => arg.name === "datestart")?.value,
  );
  const dateEnd = parseDate(
    <string>args.find((arg) => arg.name === "dateend")?.value,
  );
  const deadline = parseDate(
    <string>args.find((arg) => arg.name === "deadline")?.value,
  );

  // Validate date and deadline
  let error = "";
  if (!dateStart) error += "Invalid start date.\n";
  if (!dateEnd) error += "Invalid end date.\n";
  if (!deadline) error += "Invalid deadline.\n";
  if (dateStart && dateEnd && dateStart > dateEnd)
    error += "Start date must be before end date.\n";
  if (dateStart && deadline && deadline > dateStart)
    error += "Deadline must be before start date.\n";

  // Send error message if invalid
  if (error) {
    sendEphermal(interaction, error);
    return;
  }

  // Get location, travel method, price
  const location = <string>args.find((arg) => arg.name === "location")?.value;
  const method = <string>args.find((arg) => arg.name === "method")?.value;
  const price = <number>args.find((arg) => arg.name === "price")?.value;
  const place = <string>args.find(arg => arg.name === "place")?.value;

  // Create buttons
  const addGuy = new ButtonBuilder()
    .setCustomId("guys")
    .setLabel("Guys")
    .setStyle(ButtonStyle.Primary);
  const addGirl = new ButtonBuilder()
    .setCustomId("girls")
    .setLabel("Girls")
    .setStyle(ButtonStyle.Primary);
  const genderRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    addGuy,
    addGirl,
  );

  const removePlayer = new ButtonBuilder()
    .setCustomId("unregister")
    .setLabel("Unregister")
    .setStyle(ButtonStyle.Danger);
  const unregisterRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    removePlayer,
  );

  const getDetails = new ButtonBuilder()
    .setCustomId("details")
    .setLabel("Details (Leadership Only)")
    .setStyle(ButtonStyle.Secondary);
  const detailsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    getDetails,
  );

  // Create embed
  const title = `__${titleCase(location)} Tournament__`;
  const desc =
    `**Date:** ${strftime("%A, %B %d, %Y", dateStart)} - ${strftime(
      "%A, %B %d, %Y",
      dateEnd,
    )}\n` +
    `**Price:** $${price}\n` +
    `**Deadline:** ${strftime("%A, %B %d, %Y", deadline)}\n` +
    `**Place:** ${place}\n` +
    `**Travel Method:** ${titleCase(method)}`;
  const color = "#ff0000";
  const count = {
    name: "__Count__",
    value: "Guys: 0\nGirls: 0",
  };

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(desc)
    .setFields(count)
    .setColor(color);

  // Send message
  const msg = await interaction.reply({
    content: "@everyone",
    embeds: [embed],
    components: [genderRow, unregisterRow, detailsRow],
    fetchReply: true,
  });

  // Create tournament
  const tournament: Tournament = {
    id: msg.id,
    location,
    place,
    dateStart,
    dateEnd,
    price,
    deadline,
    count: { guys: 0, girls: 0 },
    people: { guys: [], girls: [] },
  };
  db.createTournament(tournament);

  // Log post creation
  console.log(`Tournament post created in ${interaction.channelId}.`);
}
