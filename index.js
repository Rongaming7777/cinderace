const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs")
const colors = require("colors")
const client = new Discord.Client({
  fetchAllMembers: false,
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

  try {
	const key = 'test1';
const items = {"id": 1,
		image: "https://cdn.discordapp.com/avatars/1120305721418981396/c680f95f2a94a1111b3af4b60fc02d23.webp",
		instock: 10,
		min: 1,
		title: "Cinderace",
		description: "test shsghd sjsbs sus sbhs shs shsbs sus ehe shs hshstest shsghd sjsbs sus sbhs shs shsbs sus ehe shs hshstest shsghd sjsbs sus sbhs shs shsbs sus ehe shs hshstest shsghd sjsbs sus sbhs shs shsbs sus ehe shs hshs",
		author: "Ron",
		price: 999
												
}
		client.product.set(key, items);
			const key1 = 'test2';
const items1 = {"id": 2,
		image: "https://cdn.discordapp.com/avatars/1120305721418981396/c680f95f2a94a1111b3af4b60fc02d23.webp",
		instock: 1,
		min: 2,
		title: "Cinderace1",
		description: "test shsghd sjsbs sus sbhs shs shsbs sus ehe shs hshstest shsghd sjsbs sus sbhs shs shsbs sus ehe shs hshstest shsghd sjsbs sus sbhs shs shsbs sus ehe shs hshstest shsghd sjsbs sus sbhs shs shsbs sus ehe shs hshs",
		author: "lol",
		price: 110
												
}
		client.product.set(key1, items1);
	} catch (error) {
    console.error('Error parsing json', error);
  }
});

