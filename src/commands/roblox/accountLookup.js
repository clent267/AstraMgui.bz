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

    // get roblox user id
    const requestBody = {
      usernames: [`${interaction.options.getString('username')}`],
      excludeBannedUsers: true
    };

    const user = await axios.post("https://users.roblox.com/v1/usernames/users", requestBody);
    const userData = user.data.data[0];
    const userId = userData.id;
    const usrname = userData.displayName;

    // roblox rest api
    const avatarAPI = axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=true`);
    const usernameAPI = axios.get(`https://users.roblox.com/v1/users/${userId}`);
    const followersAPI = axios.get(`https://friends.roblox.com/v1/users/${userId}/followers/count`);
    const followingAPI = axios.get(`https://friends.roblox.com/v1/users/${userId}/followings/count`);
    const friendsAPI = axios.get(`https://friends.roblox.com/v1/users/${userId}/friends/count`);
    const gamesAPI = axios.get(`https://games.roblox.com/v2/users/${userId}/games`);

    const [avatar, username, followers, following, friends, games] = await Promise.all([avatarAPI, usernameAPI, followersAPI, followingAPI, friendsAPI, gamesAPI]);

    const usernameData = username.data.name;
    const usernameData2 = username.data.displayName;
    const usernameData4 = username.data.created;
    const usernameData5 = username.data.isBanned;
    const avatarData = avatar.data.data[0].imageUrl;
    const followersData = followers.data.count;
    const followingData = following.data.count;
    const friendsData = friends.data.count;
    const gamesData = games.data.data[0].name;

    const success = new EmbedBuilder()
    .setTitle(`Account Lookup For ${usrname}`)
    .setThumbnail(`${avatarData}`)
    .addFields({ name: 'Username', value: `${usernameData}`, inline: true })
    .addFields({ name: 'Display Name', value: `${usernameData2}`, inline: true })
    .addFields({ name: 'Created', value: `${usernameData4}`, inline: true })
    .addFields({ name: 'Banned', value: `${usernameData5}`, inline: true })
    .addFields({ name: 'Followers', value: `${followersData}`, inline: true })
    .addFields({ name: 'Following', value: `${followingData}`, inline: true })
    .addFields({ name: 'Friends', value: `${friendsData}`, inline: true })
    .addFields({ name: 'Games', value: `${gamesData}`, inline: true })
    .setFooter({ text: `${config.footerText}`, iconURL: config.footerImage })
    .setColor('#00ff00')
    .setTimestamp();

        interaction.editReply({ embeds: [success] });
    
    console.log(`\x1b[32m[${getTimestamp()}][ACCOUNT LOOKUP]:\x1b[0m ${interaction.user.tag} looked up the account ${usernameData} with the id ${userId}`);

    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('An error has occurred. Please try again later.')
        .setFooter({ text: `${config.footerText}`, iconURL: config.footerImage })
        .setColor('#ff0000')
        .setTimestamp();

      interaction.editReply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
      console.log(error);
    }
  },

  name: 'check',
    description: 'Check account details!',
    options: [
      {
        name: 'username',
        description: 'The username of the account you want to check!',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
}
