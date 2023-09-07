import { ButtonInteraction, CommandInteraction } from "discord.js";
import { TournamentManager } from "./tournament.js";

// Database
export const db = new TournamentManager();

// Send ephemeral message
export async function sendEphermal(
  interaction: CommandInteraction | ButtonInteraction,
  msg: string
) {
  await interaction.reply({ content: msg, ephemeral: true });
  setTimeout(() => interaction.deleteReply(), 2500);
}

// Emojis for reactions
// prettier-ignore
const emojis = [
  "🔥", "💯", "🌟", "✨", "🎉", "🎊", "🎮", "🕹️", "📷", "🎥",
  "💻", "🖥️", "📚", "📖", "🔍", "🔎", "💡", "🚀", "🚲", "🏎️",
  "🚁", "🚢", "🌴", "🌺", "🍔", "🍕", "🍣", "🍩", "🍺", "🍻",
  "⚡", "🌞", "🌈", "🌊", "🍁", "🍂", "🍃", "🍀", "🌺", "🌸",
  "🌼", "🌻", "🍁", "🍂", "🍃", "🌲", "🌳", "🌴", "🌵", "🌾",
  "🌹", "🥀", "🌷", "🌱", "🌿", "🍄", "🐾", "🦋", "🐝", "🐞",
  "🌞", "🌛", "🌜", "🌎", "🌍", "🌏", "🌕", "🌖", "🌗", "🌘",
  "🌑", "🌒", "🌓", "🌔", "🌚", "🌝", "🌞", "🌛", "🌜", "⛅",
  "🌤️", "🌥️", "🌦️", "🌧️", "🌨️", "🌩️", "🌪️", "🌫️", "🌬️", "🐫",
  "🌈", "🦁", "🐵", "🐶", "🐺", "🦊", "🐱", "🦁", "🐯", "🐴",
  "🦓", "🐮", "🐷", "🐗", "🦔", "🐰", "🐹", "🐻", "🦍", "🐪",
];

export function randomEmoji() {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

// Convert string to title case
export function titleCase(str: string) {
  const result = str
    .toLowerCase()
    .split(" ")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
  return result;
}
