import { CommandInteraction, GuildMember } from "discord.js";
import config from "./config.json" assert { type: "json" };

export function checkPermissions(member: GuildMember) {
  // Get authorized role
  const authorizedRole = {
    id: config.roles.leadership,
  };

  // Get member roles
  const memberRoles = member.roles.cache;

  // Check if member has authorized role
  return memberRoles.find((role) => role.id === authorizedRole.id);
}

export function checkChannels(interaction: CommandInteraction) {
  // Get authorized channels
  const practiceChannels = config.channels.practice;
  const tournamentChannels = config.channels.tournaments;

  // Get channel command was sent in
  const commandChannel = interaction.channelId;

  // Check if command was sent in authorized channel
  return (
    practiceChannels.includes(commandChannel) ||
    tournamentChannels.includes(commandChannel)
  );
}
