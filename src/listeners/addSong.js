const { Listener } = require('discord-akairo')
const prettyms = require('pretty-ms')

module.exports = class ListenerAddSong extends Listener {
  constructor () {
    super('addSong', {
      emitter: 'player',
      event: 'addSong'
    })
  }

  async exec (message, queue, song) {
    const djRole = await this.client.djRole.get(message.guild.id)
    const maxTime = await this.client.maxTime.get(message.guild.id)
    const dj = message.member.roles.cache.has(djRole) || message.channel.permissionsFor(message.member.user.id).has(['MANAGE_CHANNELS'])
    if (maxTime) {
      if (!dj) {
        if (parseInt(song.duration + '000') > maxTime) { // DisTube omits the last three digits in the songs duration.
          queue.songs.pop()
          return message.say('no', `You cannot add this song to the queue since the duration of this song exceeds the max limit of \`${prettyms(maxTime, { colonNotation: true })}\` for this server.`)
        }
      }
    }
    message.say('ok', `Added **${song.name}** to the queue.`)
  }
}
