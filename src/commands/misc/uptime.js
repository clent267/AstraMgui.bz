const { ApplicationCommandOptionType, Client, ChannelType, EmbedBuilder, Interaction, PermissionFlagsBits } = require('discord.js');
const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');
const Token = require('../../models/Token');
const config = require('../../../config.json');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply('You can only run this command inside a server.');
      return;
    }

    try {
      await interaction.deferReply();

      function getTimestamp() {
        const currentDate = new Date();
        return currentDate.toLocaleTimeString();
      }
    
      function getRandomColor() {
        const color = Math.floor(Math.random() * 16777215);
        return '#' + color.toString(16);
      }

      function formatUptime(uptime) {
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
      
        return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
      }

      const denied = new EmbedBuilder()
      .setTitle('Access Denied')
      .setDescription('You do not have permission to run this command.')
      .setColor('#ff0000')
      .setTimestamp();

    const token = await Token.findOne({ userId: interaction.user.id });

    if (!token) {
      interaction.editReply({
        embeds: [denied],
        ephemeral: true,
      });
      console.log(`\x1b[31m[${getTimestamp()}][DENIED ACCESS]:\x1b[0m ${interaction.user.tag} tried to run the command /check but they do not have access to this command.`);
      return;
    }

        const embed = new EmbedBuilder()
        .setTitle('🕒 Bot Uptime')
        .setThumbnail(client.user.avatarURL())
        .setDescription(`The bot has been online for ${formatUptime(client.uptime)}.`)
        .setFooter({ text: `${config.footerText}`, iconURL: config.footerImage })
        .setColor(getRandomColor())
        .setTimestamp();

    interaction.editReply({ embeds: [embed] });
    console.log(`\x1b[32m[${getTimestamp()}][UPTIME COMMAND]:\x1b[0m ${interaction.user.tag} requested the bot uptime.`);
    } catch (error) {
      console.log(error);
    }
  },

  name: 'uptime',
    description: 'Shows the uptime of the bot.',

}
