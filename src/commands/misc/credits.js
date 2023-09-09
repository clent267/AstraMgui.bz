const { ApplicationCommandOptionType, ActionRowBuilder, Client, ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, Interaction, PermissionFlagsBits } = require('discord.js');
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

    // buttons
    const gitlink = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('GitHub Repository')
        .setURL('https://github.com/QuantumSynergy-Labs/QuantumBot-MGUI')
        .setEmoji('🔗');

    const supportlink = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Support Server')
        .setURL('https://support.quantumsynergylabs.tech')
        .setEmoji('🎮');    

    const botinvite = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Bot Invite')
        .setURL('https://discord.com/api/oauth2/authorize?client_id=1106966401488527440&permissions=8&scope=bot')
        .setEmoji('🔨');

    const row = new ActionRowBuilder()
        .addComponents(gitlink, supportlink, botinvite);

        const embed = new EmbedBuilder()
            .setTitle('Project Credits and Acknowledgements')
            .setDescription('This is the list of credits and acknowledgements for the bot.')
            .setThumbnail(interaction.user.avatarURL())
            .addFields({ name: 'Discord.JS', value: 'A open source Node.JS library for discord bots', inline: true })
            .addFields({ name: 'Mongoose', value: 'A MongoDB object modeling tool designed to work in an asynchronous environment.', inline: true })
            .addFields({ name: 'Axios', value: 'Promise based HTTP client for the browser and node.js', inline: true })
            .addFields({ name: 'Roblox.JS', value: 'A Node.JS library for the Roblox API.', inline: true })
            .addFields({ name: 'Discord.JS Buttons', value: 'A simple package to create a Discord buttons.', inline: true })
            .addFields({ name: 'Discord.JS Slash Commands', value: 'A simple package to create a Discord slash commands.', inline: true })
            .addFields({ name: 'Discord.JS Utils', value: 'A simple package to create a Discord utils.', inline: true })
            .addFields({ name: 'Discord.JS Pagination', value: 'A simple package to create a Discord pagination.', inline: true })
            .addFields({ name: 'Discord.JS Embeds', value: 'A simple package to create a Discord embeds.', inline: true })
            .addFields({ name: 'Discord.JS Buttons Pagination', value: 'A simple package to create a Discord buttons pagination.', inline: true })
            .addFields({ name: 'Discord.JS Buttons Embeds', value: 'A simple package to create a Discord buttons embeds.', inline: true })
            .addFields({ name: 'Discord.JS Buttons Utils', value: 'A simple package to create a Discord buttons utils.', inline: true })
            .setFooter({ text: `${config.footerText}`, iconURL: config.footerImage })
            .setColor(getRandomColor())
            .setTimestamp();

    interaction.editReply({
        embeds: [embed],
        components: [row]
    });
    console.log(`\x1b[32m[${getTimestamp()}][CREDITS COMMAND]:\x1b[0m ${interaction.user.tag} used the command /credits in ${interaction.guild.name}.`);
    } catch (error) {
      console.log(error);
    }
  },

  name: 'credits',
    description: 'Shows the list of credits and acknowledgements for the bot.',

}
