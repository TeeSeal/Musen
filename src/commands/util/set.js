const { Command, Argument } = require('discord-akairo')
const { stripIndents } = require('../../util')

const { Guild } = require('../../db')

class SetCommand extends Command {
  constructor () {
    super('set', {
      aliases: ['default', 'def', 'set'],
      channelRestriction: 'guild',
      userPermissions: ['MANAGE_GUILD'],
      args: [
        {
          id: 'maxSongDuration',
          match: 'option',
          flag: ['--duration', '--length', '-d'],
          type: Argument.range('integer', 1, 240, true)
        },
        {
          id: 'defaultVolume',
          match: 'option',
          flag: ['--default-volume', '--volume', '-v'],
          type: Argument.range('integer', 1, 100, true)
        },
        {
          id: 'maxVolume',
          match: 'option',
          flag: ['--max-volume', '--max-vol', '-m'],
          type: Argument.range('integer', 1, 100, true)
        },
        {
          id: 'trackLimit',
          match: 'option',
          flag: ['--track-limit=', '--tracks', '--max-tracks', '-l'],
          type: Argument.range('integer', 1, 100, true)
        }
      ],
      description: stripIndents`
        Set some default values for the guild.
        **Optional arguments:** (must have at least 1)
        \`duration\` - the maximum track duration for this guild (in minutes).
        \`volume\` - the default track volume for this guild (in %).
        \`maxVolume\` - the maximum track volume for this guild (in %).
        \`trackLimit\` - the maximum amount of tracks one can have in a playlist.

        **Usage:**
        \`set --duration 20 --default-volume 30 --max-volume 70\` => sets the values.
        \`set --duration 20 -v 30 -m 70\` => shortcuts.
      `
    })
  }

  exec (msg, args) {
    const { maxSongDuration, defaultVolume, maxVolume, trackLimit } = args
    if (!Object.keys(args).some(key => args[key])) {
      return msg.util.error('what are you trying to update?')
    }

    const {
      defaultVolume: dbDefaultVolume,
      maxVolume: dbMaxVolume
    } = Guild.get(msg.guild.id)
    const playlist = this.client.music.getPlaylist(msg.guild.id)
    const obj = {}

    if (maxSongDuration) {
      if (playlist) playlist.maxSongDuration = maxSongDuration
      obj.maxSongDuration = maxSongDuration
    }

    if (defaultVolume) {
      if ((maxVolume ?? Infinity) < defaultVolume || dbMaxVolume < defaultVolume) {
        return msg.util.error(
          'default volume can\'t be bigger than the maximum one.'
        )
      }
      if (playlist) playlist.defaultVolume = playlist.convertVolume(defaultVolume)
      obj.defaultVolume = defaultVolume
    }

    if (maxVolume) {
      if ((defaultVolume ?? 0) > maxVolume || dbDefaultVolume > maxVolume) {
        return msg.util.error(
          'maximum volume can\'t be smaller than the default one.'
        )
      }
      if (defaultVolume && maxVolume < defaultVolume) {
        if (playlist && playlist.volume > maxVolume) {
          playlist.setVolume(maxVolume)
        }
      }
      obj.maxVolume = maxVolume
    }

    if (trackLimit) {
      if (playlist) playlist.trackLimit = trackLimit
      obj.trackLimit = trackLimit
    }

    const expression = getExpression(obj)
    Guild.set(msg.guild.id, obj)

    return msg.util.success(`updated ${expression}.`)
  }
}

function getExpression (obj) {
  const arr = Object.keys(obj).map(key => `**${key}**(${obj[key]})`)
  if (arr.length === 1) return arr[0]
  const last = arr.pop()
  return `${arr.join(', ')} and ${last}`
}

module.exports = SetCommand
