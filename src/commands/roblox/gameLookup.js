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
      console.log(`\x1b[31m[${getTimestamp()}][DENIED ACCESS]:\x1b[0m ${interaction.user.tag} tried to run the command /gamelookup but they do not have access to this command.`);
      return;
    }
      const eypiay = await axios.get(`https://apis.roblox.com/universes/v1/places/13727453306/universe`);
      const eypiayData = eypiay.data.universeId;

      const gameAPIS = await axios.get(`https://games.roblox.com/v1/games?universeIds=${eypiayData}`);
      const gameThumbnail = await axios.get(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${eypiayData}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=true`)
      
      const gameData = gameAPIS.data.data[0];
      const gameThumbnailData = gameThumbnail.data.data[0];

      const rplaceid = gameData.rootPlaceId;
      const thumbnail = gameThumbnailData.imageUrl;
      const name = gameData.name;
      const description = gameData.description;
      const creator = gameData.creator.name;
      const creatorid = gameData.creator.id;
      const playing = gameData.playing;
      const visits = gameData.visits;
      const created = gameData.created;
      const updated = gameData.updated;
      const maxplayers = gameData.maxPlayers;
      const favoritedCount = gameData.favoritedCount; 


      const embed = new EmbedBuilder()
        .setTitle(`🎮 Game Lookup for game id: ${rplaceid}`)
        .setThumbnail(`${thumbnail}`)
        .addFields({ name: 'Name', value: `${name}`, inline: true })
        .addFields({ name: 'Description', value: `${description}`, inline: true })
        .addFields({ name: 'Creator', value: `${creator}(${creatorid})`, inline: true })
        .addFields({ name: 'Playing', value: `${playing}`, inline: true })
        .addFields({ name: 'Visits', value: `${visits}`, inline: true })
        .addFields({ name: 'Created', value: `${created}`, inline: true })
        .addFields({ name: 'Updated', value: `${updated}`, inline: true })
        .addFields({ name: 'Max Players', value: `${maxplayers}`, inline: true })
        .addFields({ name: 'Favorited Count', value: `${favoritedCount}`, inline: true })
        .addFields({ name: 'Game Link', value: `https://www.roblox.com/games/${rplaceid}`, inline: true })
        .setFooter({ text: `${config.footerText}`, iconURL: config.footerImage })
        .setColor(getRandomColor())
        .setTimestamp();

    interaction.editReply({ embeds: [embed] });
    console.log(`\x1b[32m[${getTimestamp()}][GAME LOOKUP]:\x1b[0m ${interaction.user.tag} requested the game lookup for game id: ${rplaceid}.`);
    } catch (error) {
      console.log(error);
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

  name: 'gamelookup',
    description: 'Checks game details.',
    options: [
        {
            name: 'game-id',
            description: 'The game id to lookup',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],

}
