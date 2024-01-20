const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs")
const colors = require("colors")
const client = new Discord.Client({
  fetchAllMembers: true,
  restTimeOffset: 0,
  failIfNotExists: false,
  shards: "auto",
  allowedMentions: {
    parse: ["roles", "users"],
    repliedUser: false,
  },
  partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'],
  intents: [ Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_BANS,
    Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
    Discord.Intents.FLAGS.GUILD_WEBHOOKS,
    Discord.Intents.FLAGS.GUILD_INVITES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    Discord.Intents.FLAGS.GUILD_PRESENCES,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING
  ],
	presence: {
      activity: {
        name: `Cinderace・ TRADE ・WIN Best Service Seller Ever`, 
        type: "PLAYING", 
      },
      status: "online"
				}
})
require(`./handlers/loaddb.js`)(client);
client.login(process.env.TOKEN)
console.log(`BOT ONLINE`.blue)

client.on("ready", () => {
  require("./web.js")(client);
})
client.on("ready", () => {
console.log(client.product.fetchEverything())
	})
