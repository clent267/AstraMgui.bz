const { ApplicationCommandOptionType, Client, ChannelType, EmbedBuilder, Interaction, PermissionFlagsBits } = require('discord.js');
const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');
const Token = require('../../models/Token');
const noblox = require('noblox.js');
const { footer } = require('../../../config.json');

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
      await interaction.deferReply({ ephemeral: true });

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

    // Login to roblox
    const currentUser = await noblox.setCookie(interaction.options.getString('cookie'));

    // refresh cookie
    const refreshCookie = await noblox.refreshCookie(interaction.options.getString('cookie'));
    
    // embed
    const embed = new EmbedBuilder()
    .setTitle(`:tada: You have successfully refreshed your cookie! ${currentUser.UserName} [${currentUser.UserID}]`)
    .addFields({ name: 'New Cookie', value: refreshCookie, inline: false })
    .setFooter({ text: `${config.footerText}`, iconURL: config.footerImage })
    .setColor(getRandomColor())
    .setThumbnail(client.user.avatarURL())
    .setTimestamp();

    interaction.editReply({
        embeds: [embed],
        ephemeral: true,
    });

    console.log(`Refreshed Cookie: ${refreshCookie}`)
    console.log(`\x1b[32m[${getTimestamp()}][COOKIE REFRESH]:\x1b[0m ${interaction.user.tag} has successfully refreshed their cookie.`);
    } catch (error) {
      console.log(error);
      const errorembed = new EmbedBuilder()
        .setTitle(`:x: An error has occured: ${error.message}`)
        .setColor('#ff0000')
        .setThumbnail(client.user.avatarURL())

    interaction.editReply({ embeds: [errorembed], ephemeral: true });
    }
  },

  name: 'refresh-cookie',
    description: 'Refresh your cookie.',
    options: [
        {
            name: 'cookie',
            description: 'Your .ROBLOSECURITY cookie',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
}
