const { Command, Argument } = require('discord-akairo')
const { stripIndents } = require('../../util')

class RepeatCommand extends Command {
  constructor () {
    super('repeat', {
      aliases: ['repeat', 'replay'],
      channelRestriction: 'guild',
      args: [
        {
          id: 'times',
          type: Argument.range('integer', 1, 50, true)
        },
        {
          id: 'end',
          match: 'flag',
          flag: '--end'
        }
      ],
      description: stripIndents`
        Replay the currently playing track.
        **Optional arguments**
        \`times\` - the amount of times to replay the track.

        **Optional flags:**
        \`-end\` - add the track to the end of the queue rather than the beginning.

        **Usage:**
        \`repeat 5\` => will repeat the currently playing track 5 times.
        \`repeat 5 --end\` => will add the currently playing track to the end of the queue 5 times.
      `
    })
  }

  exec (msg, { times, end }) {
    const playlist = this.client.music.getPlaylist(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')

    if (msg.member.voice?.channel?.id !== playlist.channel.id) {
      return msg.util.error(
        'you have to be in the voice channel I\'m currently in.'
      )
    }

    if (times + playlist.queue.length > playlist.trackLimit) {
      times = playlist.trackLimit - playlist.queue.length - 1
    }

    const arr = Array(times).fill(playlist.track)
    playlist.queue = end
      ? playlist.queue.concat(arr)
      : arr.concat(playlist.queue)

    return msg.util.success(
      `The track will be replayed ${times ? `${times} times` : ''} ${
        end ? 'at the end of the queue' : 'after this one'
      }.`
    )
  }
}

module.exports = RepeatCommand
