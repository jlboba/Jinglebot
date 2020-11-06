// ==================
// DEPENDENCIES
// ==================
const Discord = require('discord.js')
const config = require('../config')

// on message
module.exports = (client, msg) => {
    // break if no prefix 
    if(!msg.content.toLowerCase().startsWith(config.prefix) || msg.author.bot) return
    // get args 
    let args = msg.content.slice(config.prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()
    // if no command following the prefix, silently return
    if(!command) return
    // set command
    const cmd = client.commands.find(commandKey => commandKey.commandName === command) || client.aliases.find(alias => alias.aliasName === command)
    // if no matching command, return error message 
    if(!cmd) return msg.channel.send(`<@${msg.author.id}> that is not a command! Check \`j!help\` to find out what commands are available to use.`)
    // run the command 
    cmd.props.run(client, msg, args)
}