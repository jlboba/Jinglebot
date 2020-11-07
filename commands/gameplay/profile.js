// ==================
// DEPENDENCIES
// ==================
const Discord = require('discord.js')
const data = require('../../data/profileSample')

// ==================
// RUN
// ==================
module.exports.run = (client, msg, args, originalEmbed) => {
    // find the page
    let page = args[0] || 1 

    // set the initial embed 
    const embedOptions = {
        color: 0x6fe3f2,
        title: `:christmas_tree: ${msg.author.username}'s Profile`,
        thumbnail: { url: msg.author.avatarURL() },
        description: `<@${msg.author.id}> has spread holiday cheer to the following villagers\n\n`
    }

    // slice the array to collect just the current page 
    let currentPage = data.slice((page - 1) * 10, page * 10)
    
    // loop through the current page of the user's gifted villagers and add them onto the description 
    currentPage.forEach(villager => {
        embedOptions.description += `${villager.emoji} · \`${villager.dateGifted}\` · **${villager.name}** · ${villager.gift}\n`
    })

    // set the embed footer 
    embedOptions.footer = {
        text: `Viewing villagers ${((page - 1) * 10) + 1} - ${(((page - 1) * 10) + 1) + (currentPage.length - 1)} of ${data.length}`
    }

    // send the embed (on first run of the command) 
    if(!originalEmbed) {
        msg.channel.send({ embed: embedOptions })
        .then(sentMessage => {
            // if more than one page, react with arrows, if not silently return
            if(data.length > 10) {
                sentMessage.react('⬅️')
                sentMessage.react('➡️')
            } else return

            // filter for checking reactions  
            const filter = (reaction, user) => {
                return ['⬅️', '➡️'].includes(reaction.emoji.name) && !user.bot
            }

            // reaction collector - will collect up to 60 seconds 
            const collector = sentMessage.createReactionCollector(filter, { time: 60000 })

            // when someone reacts 
            collector.on('collect', async (collectedReaction) => {
                // find the profile command from the client 
                let profileCmd = client.commands.find(commandKey => commandKey.commandName === 'profile')

                 // go backwards or forwards a page if possible, if not do nothing 
                 if(collectedReaction.emoji.name === '➡️' && data.length > (((page - 1) * 10) + 1) + (currentPage.length - 1)) {
                    page += 1 
                    profileCmd.props.run(client, msg, [page], sentMessage)
                 } else if(collectedReaction.emoji.name === '⬅️' && page !== 1) { 
                    page -= 1 
                    profileCmd.props.run(client, msg, [page], sentMessage)
                 }
            })
        })
    } else { // edit the embed (on changing page)
        const editedEmbed = new Discord.MessageEmbed(embedOptions)
        originalEmbed.edit(editedEmbed)
    }
    
}

// ==================
// CONFIG & HELP
// ==================
module.exports.conf = {
    aliases: ['pro']
}

module.exports.help ={
    name: 'profile',
    shortcuts: '`pro`',
    details: `Check how many villagers you've gifted and your current rank`
}