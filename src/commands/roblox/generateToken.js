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
      await interaction.deferReply({ ephemeral: true });

      function getTimestamp() {
        const currentDate = new Date();
        return currentDate.toLocaleTimeString();
      }
    
      function generateToken() {
        // Random token generator algorithm
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = 'Chronics-Publisher_';
        for (let i = 0; i < 12; i++) {
          token += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return token;
      }
    
    // Generate token
    const genToken = generateToken();

    const newToken = new Token({ token: genToken });
    await newToken.save();

    // Embed
    const embed = new EmbedBuilder()
      .setTitle('New Access Token Generated')
      .setDescription(`**Token:** ${genToken}`)
      .setFooter({ text: `${config.footerText}`, iconURL: config.footerImage })
      .setColor('#00ff00')
      .setTimestamp();
      

    interaction.editReply({ 
        embeds: [embed],
        ephemeral: true
    });
    console.log(`\x1b[32m[${getTimestamp()}][TOKEN GENERATOR]:\x1b[0m ${interaction.user.tag} generated a token. (Token: ${genToken})`);
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

  name: 'generate',
    description: 'Generate an access token.',
    permissionsRequired: [PermissionFlagsBits.ManageGuild],

}
