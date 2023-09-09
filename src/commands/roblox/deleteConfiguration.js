const { ApplicationCommandOptionType, Client, EmbedBuilder, Interaction, PermissionFlagsBits } = require('discord.js');
const Setup = require('../../models/Setup');
const Token = require('../../models/Token');
const WebhookData = require('../../models/WebhookData');
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

    const targetRoleId = interaction.user.id;

    try {
      await interaction.deferReply({ ephemeral: true });

      function getTimestamp() {
        const currentDate = new Date();
        return currentDate.toLocaleTimeString();
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

      async function deleteWebhook(gameId) {
        try {
          const result = await WebhookData.findOneAndDelete({ gameId: gameId });
      
          if (result) {
            console.log(`[${getTimestamp()}][REMOVE CONFIG]: Webhooks has been removed.`);
          } else {
            console.log(`[${getTimestamp()}][REMOVE CONFIG]: No matching webhook found.`);
          }
        } catch (error) {
          console.error('Error:', error);
        } 
      }

      const successembed = new EmbedBuilder()
        .setTitle('Your webhooks has been removed!')
        .setThumbnail('https://th.bing.com/th/id/R.313d9b5a0dcd849ddf83ff5216915668?rik=%2f%2ftO3VpPmEMe8Q&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2017%2f07%2fColor-Roblox-Logo.png&ehk=HuF5BjSgs0WJah0NlaV9%2f3tr2Ec%2bECijA6z3H5Bn8c4%3d&risl=&pid=ImgRaw&r=0')
        .setDescription('We have successfully removed your configurations. Please use `/setwebhook` to set your webhooks again.')
        .setColor('#00FF00')
        .setTimestamp()
        .setFooter({ text: `${config.footerText}`, iconURL: config.footerImage })

      if(!(await WebhookData.exists({ gameId: interaction.options.getString('game-id') }))) {
        interaction.editReply('You have not configured your webhooks yet. Please use `/setup` to set your webhooks.')
        return;
      }

      await deleteWebhook(interaction.options.getString('game-id'));
      interaction.editReply({ embeds: [successembed] })
      console.log(`\x1b[32m[${getTimestamp()}][REMOVE CONFIG]:\x1b[0m ${interaction.user.tag} has successfully removed their webhooks! (Game ID: ${interaction.options.getString('game-id')})`)
    } catch (error) {

      const failedembed = new EmbedBuilder()
      .setTitle('We have failed to remove your webhooks!')
      .setDescription('We encounter some minor error. Please contact an admin for more info. If you have, please contact CarlR#0001')
      .setColor('#FF0000')
      .setTimestamp()
      .setFooter({ text: 'Chronics Publisher'})

      console.log(error);
      interaction.editReply({ embeds: [failedembed] })
    }
  },

  name: 'delete',
    description: 'Delete your configurations.',
    options: [
      {
        name: 'game-id',
        description: 'Your roblox game id.',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
};
