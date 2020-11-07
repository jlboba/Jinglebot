// ==================
// DEPENDENCIES
// ==================
const axios = require('axios');
const config = require('../../config')
const villagers = require('../../data/villagersSample')

// ==================
// RUN
// ==================
module.exports.run = async (client) => {
    // find the playable channel
    const giftChannel = client.channels.cache.find(channel => channel.id === client.playableChannel)

    // send a random villager every x minutes
    setInterval(async () => {
        // get a random villager 
        let randomVillager = villagers[Math.floor(Math.random() * villagers.length)]
        let vilPersonality  
        let vilImage

        // api call to get image and personality 
        await axios.get('http://acnhapi.com/v1/villagers/1').then(vilData => {
            vilPersonality = vilData.data.personality.toLowerCase()
            vilImage = vilData.data.image_uri
        })
        
        // create the embed 
        embedOptions = {
            color: config.personalityColors[vilPersonality],
            title: `🎁  ${randomVillager.name} wants a gift!`,
            description: `Jingle's not sure what kind of gift **${randomVillager.name}** wants. Can you help him? \nReact to the color you think **${randomVillager.name}** likes best!`,
            image: {
                url: vilImage
            }
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

                // shuffle again lol 
                shuffledChoices.sort(() => .5 - Math.random())

                // react to the message 
                shuffledChoices.forEach(emoji => sentMessage.react(emoji))

                 // filter for checking reactions  
                const filter = (reaction, user) => {
                    return shuffledChoices.includes(reaction.emoji.name) && !user.bot
                }

                // reaction collector - will collect up to 10 seconds 
                const collector = sentMessage.createReactionCollector(filter, { time: 10000 })

                // when someone reacts 
                collector.on('collect', (collectedReaction, reactingUser) => {
                    // stop the collector when the right color is first clicked and save the person's id
                    if(collectedReaction.emoji.name === randomColor.emoji) {
                        gifter = reactingUser.id
                        collector.stop()
                    }
                })

                // when collector stops
                collector.on('end', collected => {
                    // select a random gift 
                    let randomGift = randomColor.gifts[Math.floor(Math.random() * randomColor.gifts.length)]

                    // edit the embed 
                    embedOptions.color = '0x84f542'
                    embedOptions.title = `${randomColor.emoji}  ${randomVillager.name} has been gifted`
                    embedOptions.description = `<@${gifter}> gifted **${randomVillager.name}**: ${randomGift}!`

                    sentMessage.edit({ embed: embedOptions })
                })
            })
    }, 10000);
}