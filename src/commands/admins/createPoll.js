const { ApplicationCommandOptionType, Client, ChannelType, EmbedBuilder, Interaction, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');
const Token = require('../../models/Token');
const config = require('../../../config.json');
const mysql = require('mysql2');
const { connection } = require('mongoose');

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

    // Poll main embed
    const topic = interaction.options.getString('topic');
    const pollEmbed = new EmbedBuilder()
    .setTitle('Poll')
    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
    .setDescription(`> ${topic}`)
    .setFooter({ text: `React with 👍 or 👎 to vote on the poll` })
    .setColor(getRandomColor())
    .setTimestamp();

    // Add reactions to poll embed
    const pollMessage = await interaction.editReply({
        embeds: [pollEmbed],
    });

    await pollMessage.react('👍');
    await pollMessage.react('👎');
    
    } catch (error) {
      console.log(error);
    }
  },

  name: 'poll',
    description: 'create a poll',
    options: [
        {
            name: 'topic',
            description: 'The topic of the poll.',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.Administrator],
}
