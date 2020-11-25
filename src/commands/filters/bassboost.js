const { Command } = require('discord-akairo');

module.exports = class CommandBassBoost extends Command
{
    constructor()
    {
        super('bassboost', {
            aliases: ['bassboost', 'bass'],
            category: '🗣 Filter',
            description: {
                text: 'Boosts the bass of the player.',
                filter: 'bass=g=10,dynaudnorm=f=150:g=15'
            },
            channel: 'guild',
            clientPermissions: ['EMBED_LINKS']
        });
    }

    async exec(message)
    {
        const vc = message.member.voice.channel;
        if (!vc) return message.error('You are not in a voice channel.');

        const queue = this.client.player.getQueue(message.guild.id);
        if (!queue) return message.warn('Nothing is currently playing on this server.');

        const currentVc = this.client.voice.connections.get(message.guild.id);
        if (currentVc)
        {
            await this.client.player.setFilter(message.guild.id, 'bassboost');
            return message.ok(`Applied filter: **Bass Boost**`);
        } else {
            if (vc.id !== currentVc.channel.id) return message.error('You must be in the same voice channel that I\'m in to use that command.');
        }
    }
}
