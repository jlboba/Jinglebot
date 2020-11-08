// ==================
// RUN
// ==================
module.exports.run = async (client, msg, args) => {
    const pong = await msg.channel.send('Pinging Jinglebot')
    const time = pong.createdTimestamp - msg.createdTimestamp
    pong.edit(`Pong! \`${time}\`ms`)
}

// ==================
// CONFIG & HELP
// ==================
module.exports.help = {
    name: 'leaderboard',
    shortcuts: 'lb',
    details: `Check the current leaderboard ranking of who has gifted the most villagers`
}