import { ButtonInteraction, GuildMember } from "discord.js";
import { db, sendEphermal } from "./util.js";
import { checkPermissions } from "./validation.js";

export async function handleRegister(
  interaction: ButtonInteraction,
  buttonId: string
) {
  // Get tournament
  const messageId = interaction.message.id;
  const tournament = db.tournaments.find(
    (tournament) => tournament.id === messageId
  );

  // Check if tournament exists
  if (!tournament) {
    await sendEphermal(interaction, "Tournament not found.");
    return;
  }

  // Get user id
  const userId = interaction.user.id;

  // Check if user already registered
  if (tournament.people.girls.concat(tournament.people.guys).includes(userId)) {
    await sendEphermal(interaction, "You are already registered.");
    return;
  }

  // Add user to tournament
  switch (buttonId) {
    case "guys":
      tournament.people.guys.push(userId);
      tournament.count.guys++;
      break;
    case "girls":
      tournament.people.girls.push(userId);
      tournament.count.girls++;
      break;
  }

  // Update tournament in database
  db.updateTournament(tournament.id, tournament);

  // Update embed
  const embed = interaction.message.embeds[0];
  embed.fields[0].value = `Guys: ${tournament.count.guys}\nGirls: ${tournament.count.girls}`;
  await interaction.message.edit({ embeds: [embed] });

  // Send confirmation message
  await sendEphermal(interaction, "You have been registered.");

  // Log registration
  console.log(`${interaction.user.tag} registered for ${tournament.id}.`);
}

export async function handleUnregister(interaction: ButtonInteraction) {
  // Get user id and tournament
  const userId = interaction.user.id;
  const tournament = db.tournaments.find(
    (tournament) => tournament.id === interaction.message.id
  );

  // Check if tournament exists
  if (!tournament) {
    await sendEphermal(interaction, "Tournament not found.");
    return;
  }

  // Check if user isn't registered
  const registered = tournament.people.girls
    .concat(tournament.people.guys)
    .includes(userId);
  if (!registered) {
    await sendEphermal(interaction, "You are not registered.");
    return;
  }

  // Remove user from tournament
  const isGuy = tournament.people.guys.includes(userId);
  if (isGuy) {
    tournament.people.guys = tournament.people.guys.filter(
      (id) => id !== userId
    );
    tournament.count.guys--;
  } else {
    tournament.people.girls = tournament.people.girls.filter(
      (id) => id !== userId
    );
    tournament.count.girls--;
  }

  // Update tournament in database
  db.updateTournament(tournament.id, tournament);

  // Update embed
  const embed = interaction.message.embeds[0];
  embed.fields[0].value = `Guys: ${tournament.count.guys}\nGirls: ${tournament.count.girls}`;
  await interaction.message.edit({ embeds: [embed] });

  // Send confirmation message
  await sendEphermal(interaction, "You have been unregistered.");

  // Log unregistration
  console.log(`${interaction.user.tag} unregistered for ${tournament.id}.`);
}

export async function handleDetails(interaction: ButtonInteraction) {
  // Check if user has permissions
  const hasAuth = checkPermissions(interaction.member as GuildMember);
  if (!hasAuth) {
    sendEphermal(interaction, "You do not have permission to use this button.");
    return;
  }

  // Get tournament
  const messageId = interaction.message.id;
  const tournament = db.tournaments.find(
    (tournament) => tournament.id === messageId
  );

  // Check if tournament exists
  if (!tournament) {
    await sendEphermal(interaction, "Tournament not found.");
    return;
  }

  // Defer reply
  await interaction.deferReply({ ephemeral: true });

  // Get nicknames/usernames of people registered
  const guys = await Promise.all(
    tournament.people.guys.map(async (id) => {
      const member = await interaction.guild?.members.fetch(id);
      return member?.displayName || member?.nickname || member?.user.username;
    })
  );

  const girls = await Promise.all(
    tournament.people.girls.map(async (id) => {
      const member = await interaction.guild?.members.fetch(id);
      return member?.displayName || member?.nickname || member?.user.username;
    })
  );

  const msg =
    `**Guys Count:** ${tournament.count.guys}\n` +
    `**Girls Count:** ${tournament.count.girls}\n\n` +
    "**Guys:**\n" +
    guys.map((guy) => `> ${guy}`).join("\n") +
    "\n" +
    "**Girls:**\n" +
    girls.map((girl) => `> ${girl}`).join("\n");

  await interaction.editReply({ content: msg });
}
