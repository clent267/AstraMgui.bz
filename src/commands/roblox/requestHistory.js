const { ApplicationCommandOptionType, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, Interaction, PermissionFlagsBits } = require('discord.js');
const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');
const Token = require('../../models/Token');
const UploadRequests = require('../../models/UploadRequests');
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

    const id = interaction.options.getString('request-id')
    const data = await UploadRequests.findOne({ requestId: id });

    if (!data) {
        interaction.editReply({
            content: 'There is no request with that requestId.',
            ephemeral: true,
        });
        console.log(`\x1b[31m[${getTimestamp()}][INVALID REQUESTID]:\x1b[0m ${interaction.user.tag} tried to run the command /request-history but the requestId was invalid.`);
        return;
    }


    const gamebutton = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel('Game')
      .setURL(`${data.gameURL}`)
      .setEmoji('🎮');

    const row = new ActionRowBuilder()
        .addComponents(gamebutton);

    const success = new EmbedBuilder()
        .setTitle('Request History')
        .setThumbnail(interaction.guild.iconURL())
        .addFields({ name: 'Request ID', value: `${interaction.options.getString('request-id')}`, inline: false })
        .addFields({ name: 'Publishing Type', value: `${data.pubType}`, inline: false })
        .addFields({ name: 'User ID', value: `${data.userId}`, inline: false })
        .addFields({ name: 'Status', value: `${data.status}`, inline: false })
        .setColor(getRandomColor())
        .setFooter({ text: `${config.footerText}`, iconURL: config.footerImage })
        .setTimestamp();

    interaction.editReply({
        embeds: [success],
        components: [row],
        ephemeral: true,
    });
    console.log(`\x1b[32m[${getTimestamp()}][REQUEST HISTORY]:\x1b[0m ${interaction.user.tag} ran the command /request-history.`);
    } catch (error) {
      console.log(error);
    }
  },

  name: 'history',
  description: 'Get history of given requestId.',
  options: [
    {
      name: 'request-id',
      description: 'Publisher request id.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
}