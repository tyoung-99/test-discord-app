const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hello")
    .setDescription("Test if the bot is working"),
  async execute(interaction) {
    await interaction.reply("Hello World");
  },
};
