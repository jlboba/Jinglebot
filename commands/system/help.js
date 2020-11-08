// ==================
// RUN
// ==================
module.exports.run = (client, msg, args) => {
    // if no command provided, show all available commands and info about the bot
    if(args.length === 0) {
        return msg.channel.send('placeholder for help')
    }
    
    // if command provided, find the command 
    const cmd = client.commands.find(commandKey => commandKey.commandName === args[0]) || client.aliases.find(alias => alias.aliasName === args[0])

    // if not valid command, send error 
    if(!cmd) {
        return msg.channel.send(`❌🎄 That command does not exist! Please use the \`${client.prefix}help\` command to see what commands are available`)
    }

    // if the command exists, send an information embed 
    if(cmd) {
        const embedOptions = {
            color: 0x89d67e,
            title: `Command  🦌  \`${cmd.commandName}\``,
            description:`
                **Aliases:** ${cmd.props.help.shortcuts}\n
                **Details:** ${cmd.props.help.details}
            `
        }
        msg.channel.send({ embed: embedOptions })
    }
}