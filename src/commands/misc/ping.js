const { EmbedBuilder } = require('discord.js');
const Token = require('../../models/Token');

module.exports = {
  name: 'ping',
  description: 'Replies with the bot ping!',

  callback: async (client, interaction) => {
    await interaction.deferReply();

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

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(
      `Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`
    );
  },
};
