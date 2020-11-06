// ==================
// DATA
// ==================
const prefix = require("../../config.json").prefix

// ==================
// RUN
// ==================
module.exports.run = (client, msg, args) => {
    msg.channel.send('profile command')
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