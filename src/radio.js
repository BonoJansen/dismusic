/**
 * IMPORTANT! READ BEFORE PROCEEDING
 * 
 * Radio Client is not the main module of dismusic thus it will not be getting a lot of future support.
 * If you want to maintain the radio module, please submit a pull request.
 * 
 */

const {
    joinVoiceChannel,
    createAudioResource,
    getVoiceConnection,
    createAudioPlayer,
    NoSubscriberBehavior,
    StreamType,
    AudioPlayer,
    VoiceConnection
} = require('@discordjs/voice')
class RadioClient {
    /**
     * Create a new radio Client
     * @param {object} client The discord.js client
     */
    constructor(client) {
        if(!client) throw new Error('[ Dismusic Error ] A valid discord client is required to create a player')
        this.client = client
    }
    /**
     * Join a voice channel
     * @param {object} voice The member's voice state <member>.voice
     * @param {object} guild The discord.js guild
     * @returns {VoiceConnection}
     */
    async connectTo(voice, guild) {
        const connection = joinVoiceChannel({
            channelId: voice.channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator
        })
        return connection
    }
    /**
     * Start playing a station in your voice channel
     * @param {string} resource The MP3 link of your radio channel.
     * @param {object} guild the guild
     * @param {boolean} volume set the volume of the stream. (max = 1) 
     * @returns {AudioPlayer}
     */
    async startPlaying(resource, guild, volume) {
        const connection = getVoiceConnection(guild.id)
        let res 
        if(volume){
            res = createAudioResource(resource, {
                inputType: StreamType.Arbitrary,
                inlineVolume : true
            })
            if(volume > 1 || volume <= 0){
                throw new Error('[ Dismusic Error ] A valid volume value (0.1 - 1) has to be given.')
            }
            res.volume.setVolume(volume)
            
        } else {
            res = createAudioResource(resource, {
                inputType: StreamType.Arbitrary,
                inlineVolume : false
            })
        }
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        })
        connection.subscribe(player)
        player.play(res)
        player.on('stateChange', (_oldState, newState) => {
            const state = newState.status
            if(state === "idle") {
                const res = createAudioResource(resource, {
                    inputType: StreamType.Arbitrary
                })
                player.play(res)
            }
        })
        return player
    }
}

module.exports = RadioClient