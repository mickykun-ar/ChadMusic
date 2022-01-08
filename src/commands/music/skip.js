const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

module.exports = class CommandSkip extends Command {
  constructor () {
    super('skip', {
      aliases: ['skip', 's'],
      category: '🎶 Music',
      description: {
        text: 'Skips the currently playing song.',
        usage: '|--force/-f|',
        details: '`|--force/-f|` Only a DJ can use this. Bypasses voting and skips the currently playing song.'
      },
      channel: 'guild',
      clientPermissions: ['EMBED_LINKS']
    });
  }

  async exec (message) {
    const djMode = this.client.settings.get(message.guild.id, 'djMode');
    const djRole = this.client.settings.get(message.guild.id, 'djRole');
    const dj = message.member.roles.cache.has(djRole) || message.channel.permissionsFor(message.member.user.id).has(['MANAGE_CHANNELS']);
    if (djMode) {
      if (!dj) return this.client.ui.reply(message, 'no', 'DJ Mode is currently active. You must have the DJ Role or the **Manage Channels** permission to use music commands at this time.', 'DJ Mode');
    }

    const textChannel = this.client.settings.get(message.guild.id, 'textChannel', null);
    if (textChannel) {
      if (textChannel !== message.channel.id) {
        return this.client.ui.reply(message, 'no', `Music commands must be used in <#${textChannel}>.`);
      }
    }

    const vc = message.member.voice.channel;
    if (!vc) return this.client.ui.reply(message, 'error', 'You are not in a voice channel.');

    const queue = this.client.player.getQueue(message.guild);

    const currentVc = this.client.vc.get(vc);
    if (!queue || !currentVc) return this.client.ui.reply(message, 'warn', 'Nothing is currently playing in this server.');
    else if (vc.id !== currentVc.channel.id) return this.client.ui.reply(message, 'error', 'You must be in the same voice channel that I\'m in to use that command.');

    // For breaking use only.
    // this.client.player.skip(message)
    // return this.client.ui.reply(message, '⏭', process.env.COLOR_INFO, 'Skipped!')

    /*
    if (args[1] === ('--force' || '-f')) {
      if (!dj) return this.client.ui.reply(message, 'error', 'You must have the DJ role or the **Manage Channel** permission to use the `--force` flag.')
      this.client.player.skip(message)
      return this.client.ui.custom(message, '⏭', process.env.COLOR_INFO, 'Skipped!')
    }
    */

    if (vc.members.size >= 4) {
      const vcSize = Math.floor(vc.members.size / 2);
      const neededVotes = queue.votes.length >= vcSize;
      const votesLeft = Math.floor(vcSize - queue.votes.length);
      if (queue.votes.includes(message.member.user.id)) return this.client.ui.reply(message, 'warn', 'You already voted to skip.');
      queue.votes.push(message.member.user.id);
      if (neededVotes) {
        queue.votes = [];
        if (!queue.songs[1]) {
          this.client.player.stop(message.guild);
          return this.client.ui.custom(message, '🏁', process.env.COLOR_INFO, "Reached the end of the queue. I'm outta here!");
        }
        this.client.player.skip(message);
        return this.client.ui.custom(message, '⏭', process.env.COLOR_INFO, 'Skipped!');
      } else {
        const prefix = this.client.settings.get(message.guild.id, 'prefix', process.env.PREFIX);
        const embed = new MessageEmbed()
          .setColor(process.env.COLOR_INFO)
          .setDescription('⏭ Skipping?')
          .setFooter({
            text: `${votesLeft} more vote${votesLeft === 1 ? '' : 's'} needed to skip.${dj ? ` Yo DJ, you can force skip the track by using '${prefix}forceskip'.` : ''}`,
            icon_url: message.author.avatarURL({ dynamic: true })
          });
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      }
    } else {
      queue.votes = [];
      if (!queue.songs[1]) {
        this.client.player.stop(message.guild);
        return this.client.ui.custom(message, '🏁', process.env.COLOR_INFO, "Reached the end of the queue. I'm outta here!");
      }
      this.client.player.skip(message);
      return this.client.ui.custom(message, '⏭', process.env.COLOR_INFO, 'Skipped!');
    }
  }
};
