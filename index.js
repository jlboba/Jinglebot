// ================
// DEPENDENCIES
// ================
// PACKAGES
const Discord = require('discord.js') 
const config = require('./config.json')
const mongoose = require('mongoose')
const fs = require('fs')

// DISCORD CLIENT
const client = new Discord.Client()
client.config = config

// DATABASE 
// models here

// ================
// MONGO CONNECTION
// ================
const uri = config.mongoURI
const db = mongoose.connection

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

db.on('open', () => {
    console.log('conected to mongoose')
})

// ================
// INITIALIZING 
// ================
client.on('ready', () => {
    console.log('\x1b[32m%s\x1b[0m','\n\n 🦌  Jinglebot ready to spread cheer! \n\n')
    const guild = client.guilds.cache.first()
    // set activity 
    client.user.setActivity(`with ${guild.memberCount} users! 🦌 `)
    // set prefix 
    client.prefix = config.prefix
})

// load all the events
fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err)
    files.forEach(file => {
      const event = require(`./events/${file}`)
      let eventName = file.split(".")[0]
      client.on(eventName, event.bind(null, client))
    })
})

// load all the commands
fs.readdir("./commands/", (err, folders) => {
    if (err) return console.error(err)
    // initializing commands and aliases array 
    client.commands = []
    client.aliases = []
    // loop through the command folders and push each one into the commands array 
    folders.forEach(folder => {
      fs.readdir(`./commands/${folder}/`, (error, files) => {
        // for each command 
        files.forEach(file => {
          if (!file.endsWith(".js")) return;
          let props = require(`./commands/${folder}/${file}`)
          let commandName = file.split(".")[0];
          console.log(`Attempting to load command ${commandName}`)
          client.commands.push({
            commandName,
            props
          })
          // if the command has aliases, push those into the alias array 
          if(props.conf && props.conf.aliases) {
            props.conf.aliases.forEach(alias => {
              client.aliases.push({
                aliasName: alias,
                commandName,
                props
              })
            })
          }
        })
      })
    })
})

client.login(config.token)