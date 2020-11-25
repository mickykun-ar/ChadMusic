const { Listener } = require('discord-akairo');

module.exports = class ListenerInitQueue extends Listener
{
    constructor()
    {
        super('initQueue', {
            emitter: 'player',
            event: 'initQueue'
        });
    }

    async exec(queue)
    {
        queue.autoplay = false;
        queue.volume = 100;
    }

};
