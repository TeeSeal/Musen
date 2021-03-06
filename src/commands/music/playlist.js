const { Command, Argument } = require('discord-akairo')
const Embed = require('../../struct/MusenEmbed')

class PlaylistCommand extends Command {
  constructor () {
    super('playlist', {
      aliases: ['playlist', 'playlists', 'queue', 'q'],
      channelRestriction: 'guild',
      args: [
        {
          id: 'page',
          match: 'option',
          flag: ['--page', '-p'],
          type: Argument.range('integer', 0, Infinity),
          default: 0
        }
      ],
      description: 'Shows the current playlist.'
    })
  }

  exec (msg, { page }) {
    const playlist = this.client.music.getPlaylist(msg.guild.id)
    if (!playlist) {
      return msg.util.error('nothing is currently playing.')
    }

    const { track, queue } = playlist
    const items = [`🔊 ${track.formattedTitle}`].concat(
      queue.map(s => `• ${s.formattedTitle}`)
    )

    return new Embed(msg.channel)
      .setTitle('Playlist:')
      .setDescription(items)
      .setIcon(Embed.icons.LIST)
      .setColor(Embed.colors.BLUE)
      .setPage(page)
      .send()
  }
}

module.exports = PlaylistCommand
