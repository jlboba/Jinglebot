// ==================
// DEPENDENCIES
// ==================
const axios = require('axios')
const User = require('../../models/user')
const villagers = require('../../data/villagersSample')

// ==================
// RUN
// ==================
module.exports.run = async (client) => {
    // find the playable channel
    const giftChannel = client.channels.cache.find(channel => channel.id === client.playableChannel)

    // send a random villager every x minutes
    client.enableGame = setInterval(async () => {
        // get a random villager 
        let randomVillager = villagers[Math.floor(Math.random() * villagers.length)]
        let villagerData

        // api call to get extra villager data  
        await axios.get(`https://api.nookipedia.com/villagers?name=${randomVillager.name}`, {
            headers: { 'X-API-KEY': process.env.NOOKIPEDIA_KEY }
        }).then(vilData => {
            villagerData = vilData.data[0]
        })
        
        // create the embed 
        embedOptions = {
            color: `0x${villagerData.title_color}`,
            title: `🎁  ${villagerData.name} wants a gift, ${villagerData.phrase}!`,
            description: `Jingle's not sure what kind of gift **${villagerData.name} the ${villagerData.personality} ${villagerData.species}** wants.\n Can you help him? React to the color you think **${villagerData.name}** likes best!`,
            image: {
                url: villagerData.image_url
            },
            footer: { text: 'Image provided by Nookipedia' }
        }

        // send the embed
        giftChannel.send({embed: embedOptions})
            .then(sentMessage => {
                const emojiChoices = ["❤️", "🧡", "💛", "💚", "💙", "💜", "💗", "🤍", "🤎", "🖤", "🌈"] // squares are white, brown 
                let gifter

                // remove the 2 emojis that the villager likes 
                randomVillager.colors.forEach(color => {
                    let emojiId = emojiChoices.findIndex(emoji => emoji == color.emoji)
                    emojiChoices.splice(emojiId, 1)
                })

                // shuffle the array and slice the first two
                let shuffledChoices = emojiChoices.sort(() => .5 - Math.random()).slice(0, 2) 

                // add a random emoji the villager likes 
                let randomColor = randomVillager.colors[Math.floor(Math.random() * randomVillager.colors.length)]
                shuffledChoices.push(randomColor.emoji)

                // shuffle again
                shuffledChoices.sort(() => .5 - Math.random())

                // react to the message 
                shuffledChoices.forEach(emoji => sentMessage.react(emoji))

                 // filter for checking reactions  
                const filter = (reaction, user) => {
                    return shuffledChoices.includes(reaction.emoji.name) && !user.bot
                }

                // reaction collector - will wait up to 60 seconds 
                const collector = sentMessage.createReactionCollector(filter, { time: 60000 })

                // when someone reacts 
                collector.on('collect', async (collectedReaction, reactingUser) => {
                    // when the wrong color is clicked, apply a 1min cooldown to the user 
                    if(collectedReaction.emoji.name !== randomColor.emoji) {
                        reactingUser.giftCooldown = Date.now() + 60000
                    }

                    // when right color is clicked and user is not on cd, stop the collector
                    if(collectedReaction.emoji.name === randomColor.emoji && (!reactingUser.giftCooldown || reactingUser.giftCooldown < Date.now())) {
                        gifter = reactingUser
                        collector.stop()
                    }
                })

                // when collector stops
                collector.on('end', () => {
                    // silently return if no reactors
                    if(!gifter) return 
                    
                    // select a random gift 
                    let randomGift = randomColor.gifts[Math.floor(Math.random() * randomColor.gifts.length)]

                    // create the gifted villager object 
                    let giftedVillager = {
                        name: villagerData.name,
                        emoji: randomColor.emoji,
                        gift: randomGift,
                        dateGifted: new Date()
                    }

                    // find the gifting user 
                    User.findOne({ discordId: gifter.id }, (err, foundUser) => {
                        // if error, return 
                        if(err) return console.log('in error')
                        
                        // if gifter doesn't have an entry yet, create one 
                        if(!foundUser) this.methods.createUser(gifter.id, `${gifter.username}#${gifter.discriminator}`, giftedVillager)

                        // if gifter has an entry, update their gifted array 
                        if(foundUser) this.methods.updateUser(foundUser, giftedVillager)
                    })

                    // edit the embed
                    embedOptions.color = '0x84f542'
                    embedOptions.title = `${randomColor.emoji}  ${villagerData.name} has been gifted, ${villagerData.phrase}!`
                    embedOptions.description = `<@${gifter.id}> gifted **${villagerData.name}**: ${randomGift}!`

                    sentMessage.edit({ embed: embedOptions })
                })
            })
    }, 60000);
}

// ==================
// STOP GAME
// ==================
module.exports.stop = (client) => {
    if(client.enableGame) clearInterval(client.enableGame)
}

// ==================
// METHODS
// ==================
module.exports.methods = {
    createUser: (userID, username, villager) => {
        User.create({
            discordId: userID,
            username: username,
            gifted: [ villager ]
        }, (err, createdUser) => { return createdUser })
    },
    updateUser: (foundUser, villager) => {
        foundUser.gifted.unshift(villager)
        foundUser.save()
    }
}