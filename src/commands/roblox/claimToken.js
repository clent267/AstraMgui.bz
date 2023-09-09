const { ApplicationCommandOptionType, Client, ChannelType, EmbedBuilder, Interaction, PermissionFlagsBits } = require('discord.js');
const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');
const Token = require('../../models/Token');
const AccessRole = require('../../models/AccessRole');
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
      await interaction.deferReply({ ephemeral: true });

      function getTimestamp() {
        const currentDate = new Date();
        return currentDate.toLocaleTimeString();
      }
    // Embeds
    const used = new EmbedBuilder()
      .setTitle('Access Denied')
      .setDescription('You already have access to the bot features.')
      .setColor('#ff0000')
      .setTimestamp();
    const notfound = new EmbedBuilder()
      .setTitle('Access Denied')
      .setDescription('This token is invalid or has been used by other user. Please try again.')
      .setColor('#ff0000')
      .setTimestamp();
    const claimed = new EmbedBuilder()
      .setTitle('Access Denied')
      .setDescription('This token has already been claimed. Please try again.')
      .setColor('#ff0000')
      .setTimestamp();
    const granted = new EmbedBuilder()
      .setTitle('Access Granted')
      .setDescription('You have been granted access to the bot features.')
      .setFooter({ text: `${config.footerText}`, iconURL: config.footerImage })
      .setColor('#00ff00')
      .setTimestamp();
    const error = new EmbedBuilder()
      .setTitle('Error')
      .setDescription('An error has occurred. Please try again later.')
      .setColor('#ff0000')
      .setTimestamp();

    // Get roleId from database
    const roleId = await AccessRole.findOne({ guildId: interaction.guild.id });
    const role = interaction.guild.roles.cache.get(roleId.roleId);
    const member = interaction.member;

    // Check if user already has access
    if (member.roles.cache.has(roleId.roleId)) {
      interaction.editReply({ 
        embeds: [used],
        ephemeral: true,
      });
      return;
    }
    const usertoken = interaction.options.getString('token');

    const token = await Token.findOne({ token: usertoken });
    const tstatus = await Token.findOne({ token: usertoken, status: 'claimed' });
  
    if (!token) {
      interaction.editReply({
        embeds: [notfound],
        ephemeral: true,
      });
      return;
    }

    if (tstatus) {
      interaction.editReply({
        embeds: [claimed],
        ephemeral: true,
      });
      return; 
    }

    token.claimedby = interaction.user.tag;
    token.status = 'claimed';
    token.userId = interaction.user.id;
    await token.save();

    // Give role to user that claimed a token
    if (role) {
      interaction.member.roles.add(role);
      await interaction.editReply({
        embeds: [granted],
        ephemeral: true,
      });
    } else {
      interaction.editReply({
        embeds: [error],
        ephemeral: true,
      });
    }
    console.log(`\x1b[32m[${getTimestamp()}][BOT ACCESS]:\x1b[0m ${interaction.user.tag} has claimed a token. (Token: ${usertoken})`);
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('An error has occurred. Please try again later.')
        .setColor('#ff0000')
        .setTimestamp();

      interaction.editReply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
      console.log(error);
    }
  },

  name: 'access',
    description: 'Gives you access to the bot features.',
    options: [
      {
        name: 'token',
        description: 'The token or access key to use this bot.',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
}
