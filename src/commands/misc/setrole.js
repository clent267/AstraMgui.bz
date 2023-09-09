const { ApplicationCommandOptionType, Client, EmbedBuilder, Interaction, PermissionFlagsBits } = require('discord.js');
const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');
const AccessRole = require('../../models/AccessRole');

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

    const currentDate = new Date();

    try {
      await interaction.deferReply({ ephemeral: true });

      function getTimestamp() {
        const currentDate = new Date();
        return currentDate.toLocaleTimeString();
      }

      if (await AccessRole.exists({ guildId: interaction.guild.id })) {
        interaction.editReply('Access role already set for this server.');
        return;
      }
    
    // Embeds
    const success = new EmbedBuilder()
    .setTitle('Success')
    .setDescription('Access role has been set.')
    .setColor('#00ff00')
    .setTimestamp();

    const loading = new EmbedBuilder()
    .setTitle('Loading')
    .setDescription('Please wait...')
    .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/ad/YouTube_loading_symbol_3_%28transparent%29.gif')
    .setColor('#FFFF00')
    .setTimestamp();

    // Save roleId to database
    const roleId = interaction.options.get('role').value;

    const saveRole = new AccessRole({ guildId: interaction.guild.id,  roleId: roleId, });
    await saveRole.save();
    interaction.editReply({ embeds: [loading] });
    await new Promise((resolve) => setTimeout(resolve, 10000));
    interaction.editReply({ embeds: [success] });
    console.log(`\x1b[32m[${getTimestamp()}][SETROLE COMMAND]:\x1b[0m Saved access role to database. (RoleID: ${roleId}) (GuildID: ${interaction.guildId})`);
    } catch (error) {
      console.log(error);
    }
  },

// Set access role to this server
  name: 'accessrole',
    description: 'Save what role do you want to give access to bot features.',
    options: [
        {
            name: 'role',
            description: 'The role that you want to give access to bot features.',
            type: ApplicationCommandOptionType.Role,
            required: true,
        },
    ],
};
