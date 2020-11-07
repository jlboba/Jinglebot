// ==================
// RUN
// ==================
module.exports.run = async (client, msg, args) => {
    // if not server owner, return error 
    if(msg.author.id !== msg.guild.ownerID) {
        return msg.channel.send('You don\'t have permission to use this command')
    }

    // if server owner and no channel specified, set the current channel as the playable channel 
    if(!args[0]) {
        client.playableChannel = msg.channel.id
    }

    // if server owner and channel specified, set as playable channel 
    if(args[0]) {
        client.playableChannel = args[0].replace(/\D/g, '')
    }

    msg.channel.send(`Successfully set <#${client.playableChannel}> as the playable channel!`)

    let gameCmd = client.commands.find(commandKey => commandKey.commandName === 'game')

    return gameCmd.props.run(client)
}

// ==================
// CONFIG & HELP
// ==================
module.exports.help = {
    name: 'enable',
    shortcuts: 'none',
    details: `Server owner use only. Enable a specific channel for the bot to use and spawn villagers in\n\n**Usage:** \`j!enable #channel-name\` or just \`j!enable\` in the channel you want to enable`
}