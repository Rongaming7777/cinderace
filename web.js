const express = require("express");
const http = require("http");  
const url = require(`url`);
const path = require(`path`);
const { Permissions } = require("discord.js");
const ejs = require("ejs");
const random = require("randomstring");
const fs = require("fs")
const passport = require(`passport`);
const bodyParser = require("body-parser");
const Strategy = require(`passport-discord`).Strategy;
const Discord = require(`discord.js`);
const Enmap = require("enmap");
const multer = require('multer');
const BotConfig = require("./config.json");
const SharpMulter = require("sharp-multer");

/**
 *  STARTING THE WEBSITE
 * @param {*} client THE DISCORD BOT CLIENT 
 */
module.exports = client => {
		//Start teh website
		console.log("Loading DashBoard settings".green)
		const settings = require("./settings.json");
		// We instantiate express app and the session store.
		const app = express();
	var session = require("express-session");
	const MemoryStore = require(`memorystore`)(session);
	app.use(session({
				store: new MemoryStore({ checkPeriod: 86400000 }),
				secret: `#@%#&^$^$%@$%@#$%#E%hhggkhg#%@$FEErfgr3g#%GT%536c53cc6%5%tv%ufyzrxjchjsgkncxfhbcfgdus4n`,
				resave: false,
				saveUninitialized: false,
		}));
		const httpApp = express();

// Define the storage for uploaded files

		/**
		 * @INFO - Initial the Discord Login Setup!
		 */
		passport.serializeUser((user, done) => done(null, user));
		passport.deserializeUser((obj, done) => done(null, obj));
		passport.use(new Strategy({
			clientID: settings.config.clientID,
			clientSecret: settings.config.secret,
			callbackURL: settings.config.callback,      
			scope: [`identify`, `guilds`, `guilds.join`]
		},
		(accessToken, refreshToken, profile, done) => { 
			process.nextTick(() => done(null, profile));
		}));


		/**
		 * @INFO - ADD A SESSION SAVER
		 */

		// initialize passport middleware.


		app.set('view engine', 'ejs');
		app.set('views', path.join(__dirname, './views'))


		//Those for app.use(s) are for the input of the post method (updateing settings)
	
		app.use(express.json());
		app.use(express.urlencoded({
			extended: true
		}));
		app.use(bodyParser.urlencoded({
			extended: true
		}));
	app.use(bodyParser.json());
		
	app.use(passport.initialize());
	app.use(passport.session());
	// Storage configuration for Multer

	const newFilenameFunction = (og_filename, options) => {
		let nam = random.generate({
		length: 5,
		charset: 'numeric'
	});
		const newname =
				og_filename.split(".").slice(0, -1).join(".") +
				`${options.useTimestamp ? "-" + Date.now() : nam}` +
				"." +
				options.fileFormat;
			return newname;
		};

const storage = SharpMulter({
	destination: (req, file, callback) => callback(null, "uploads"),

  imageOptions: {
    fileFormat: "png",
    quality: 80,
    resize: { width: 480, height: 500, resizeMode: "fill" },
  },
	watermarkOptions: {
    input: "./images/watermark.svg",
    location: "bottom-right",
  },
  filename: newFilenameFunction, // optional
});
	const upload = multer({ storage: storage});
		//LOAD THE ASSETS
		app.use(express.static(path.join(__dirname, './public')));
		//Load .well-known (if available)
		app.use(express.static(path.join(__dirname, '/'), {dotfiles: 'allow'}));

		// We declare a checkAuth function middleware to check if an user is logged in or not, and if not redirect him.
		const checkAuth = (req, res, next) => {
			if (req.isAuthenticated()) return next();
			req.session.backURL = req.url;
			res.redirect("/login");
		};
	const checkAdmin = (req, res, next) => {
  const mrole = client.role.get(req.user.id)
	if (mrole === "Admin" || mrole === "Seller") {
    next(); // User is an admin, proceed to the next middleware/route handler
  } else {
    res.redirct('/'); // Return forbidden status if not an admin
  }
};

	
		//Login endpoint
		app.get(`/login`, (req, res, next) => {
				if (req.session.backURL) {
					req.session.backURL = req.session.backURL; 
				} else if (req.headers.referer) {
					const parsed = url.parse(req.headers.referer);
					if (parsed.hostname === app.locals.domain) {
						req.session.backURL = parsed.path;
					}
				} else {
					req.session.backURL = `/dashboard`;
				}
				next();
			}, passport.authenticate(`discord`, { prompt: `none` })
		);

		//Callback endpoint for the  data
app.get(`/callback`, passport.authenticate(`discord`, { failureRedirect: "/" }), async (req, res) => {
		const userID = req.user.id;
		// Check if the user ID is present in the Enmap database
		if (!client.role.has(userID)) {
				// If it's the first login, set the role for the user in the Enmap
				client.role.set(userID, "Member");
				// Assign the role to the user in Discord here using Discord.js
				// For example:
				// const guild = /* get your guild */;
				// const member = guild.members.cache.get(userID);
				// const role = guild.roles.cache.find(role => role.name === 'YourRoleName');
				// if (member && role) {
				//     member.roles.add(role);
				// }

				// Redirect to the dashboard or any other endpoint after login
			const backURL = req.session.backURL;
			res.redirect(backURL);
			delete req.session.backURL; // Clear the stored URL

		} else {
			const backURL = req.session.backURL;
			res.redirect('/dashboard');
			delete req.session.backURL; // Clear the stored URL
			}

});

		//When the website is loaded on the main page, render the main page + with those variables
		app.get("/", (req, res) => {
				res.render("index", {
					req: req,
					config: settings,
					user: req.isAuthenticated() ? req.user : null,
					//guild: client.guilds.cache.get(req.params.guildID),
					botClient: client,
					Permissions: Permissions,
					bot: settings.website,
					callback: settings.config.callback,
				});
		})
	app.get("/404", (req, res) => {
				res.render("404", {
					req: req,
					config: settings,
					user: req.isAuthenticated() ? req.user : null,
					//guild: client.guilds.cache.get(req.params.guildID),
					botClient: client,
					Permissions: Permissions,
					bot: settings.website,
					callback: settings.config.callback,
				});
		})


		// When the commands page is loaded, render it with those settings
		app.get("/login", (req, res) => {
			res.render("login", {
				req: req,
				user: req.isAuthenticated() ? req.user : null,
				//guild: client.guilds.cache.get(req.params.guildID),
				botClient: client,
				Permissions: Permissions,
				bot: settings.website,
				callback: settings.config.callback,
			})
		})


		//Logout the user and move him back to the main page
	app.get('/logout', function(req, res, next){
		req.logout(function(err) {
			if (err) { return next(err); }
			res.redirect('/');
		});
	});
		// Dashboard endpoint.
	app.get("/dashboard", checkAuth, async (req,res) => {
		const products = client.product.fetchEverything();

const mrole = client.role.get(req.user.id)


			res.render("dashboard", {
				 mrole,
					products,
					config: settings,
					req: req,
					user: req.isAuthenticated() ? req.user : null,
					//guild: client.guilds.cache.get(req.params.guildID),
					botClient: client,
					Permissions: Permissions,
					bot: settings.website,
					callback: settings.config.callback,
				 });
		})


	app.get("/dashboard/accounts", checkAuth, async (req,res) => {
		const products = client.product.fetchEverything();
const mrole = client.role.get(req.user.id)


			res.render("dashboard/accounts", {
					products,
					mrole,
					config: settings,
					req: req,
					user: req.isAuthenticated() ? req.user : null,
					//guild: client.guilds.cache.get(req.params.guildID),
					botClient: client,
					Permissions: Permissions,
					bot: settings.website,
					callback: settings.config.callback,
				 });
		})

	app.get("/dashboard/pokemons", checkAuth, async (req,res) => {
		const products = client.product.fetchEverything();
const mrole = client.role.get(req.user.id)


			res.render("dashboard/pokemons", {
					products,
					mrole,
					config: settings,
					req: req,
					user: req.isAuthenticated() ? req.user : null,
					//guild: client.guilds.cache.get(req.params.guildID),
					botClient: client,
					Permissions: Permissions,
					bot: settings.website,
					callback: settings.config.callback,
				 });
		})

	app.get("/dashboard/dust", checkAuth, async (req,res) => {
		const products = client.product.fetchEverything();
const mrole = client.role.get(req.user.id)


			res.render("dashboard/dust", {
					products,
					mrole,
					config: settings,
					req: req,
					user: req.isAuthenticated() ? req.user : null,
					//guild: client.guilds.cache.get(req.params.guildID),
					botClient: client,
					Permissions: Permissions,
					bot: settings.website,
					callback: settings.config.callback,
				 });
		})

	app.get("/dashboard/other", checkAuth, async (req,res) => {
		const products = client.product.fetchEverything();
		const mrole = client.role.get(req.user.id)



			res.render("dashboard/other", {
					mrole,
					products,
					config: settings,
					req: req,
					user: req.isAuthenticated() ? req.user : null,
					//guild: client.guilds.cache.get(req.params.guildID),
					botClient: client,
					Permissions: Permissions,
					bot: settings.website,
					callback: settings.config.callback,
				 });
		})

	app.get("/dashboard/add/pokemons", checkAuth, checkAdmin, async (req, res) => {
const mrole = client.role.get(req.user.id)
			// Ensure the user is authenticated, and then render the profile page
		const products = client.product.fetchEverything();
			res.render("dashboard/add/pokemon", {
					mrole,
					products,
					config: settings,
					req: req,
					user: req.isAuthenticated() ? req.user : null,
					botClient: client,
					Permissions: Permissions,
					bot: settings.website,
					callback: settings.config.callback,
			});

	});

app.get("/dashboard/add/accounts", checkAuth, checkAdmin, async (req, res) => {
const mrole = client.role.get(req.user.id)
			// Ensure the user is authenticated, and then render the profile page
		const products = client.product.fetchEverything();
			res.render("dashboard/add/account", {
					mrole,
					products,
					config: settings,
					req: req,
					user: req.isAuthenticated() ? req.user : null,
					botClient: client,
					Permissions: Permissions,
					bot: settings.website,
					callback: settings.config.callback,
			});

	});
	
	
app.post('/add/pokemon', upload.array('image', 10), checkAuth, checkAdmin, async (req, res) => {
	let key = random.generate(5);
	let channel = client.channels.cache.get(BotConfig.DbChannel);
	
	
try {
	let pimage = req.files
        const imageUrls = pimage.map(file => file.path);
	
		// Handle other form data here
		const { AddPokemonName, AddPokemonPrice, AddPokemonLevel, AddPokemonInStock, AddPokemonBuyMin, AddPokemonType, AddPokemonDescription } = req.body;

		// Store other form data in a JSON object
		const pokemonData = {
        id: key,
				title: AddPokemonName,
				price: AddPokemonPrice,
				level: AddPokemonLevel,
				instock: AddPokemonInStock,
				min: AddPokemonBuyMin,
				type: AddPokemonType,
				description: AddPokemonDescription.replace(/\r\n/g, '<br>'),
			  author: req.user.id,
			  image: [],
        category: "Pokemon"
		};
	client.product.set(key, pokemonData)
	let dbmsg = channel.send({content: `___${req.user.username}___** Uploaded a Pokemon**\n**Id:** ${key}\n**Name:** ${AddPokemonName}\n**Price:** ${AddPokemonPrice}\n**Level**: ${AddPokemonLevel}\n**In Stock:** ${AddPokemonInStock}\n**Buy Min:** ${AddPokemonBuyMin}\n**Type:** ${AddPokemonType}\n**Description:** ${AddPokemonDescription}`})
pimage.forEach(function(simage) {
		let dbmsg = channel.send({files: [{
				attachment: `./${simage.path}`,
				name: simage.originalname
		}]});
		dbmsg.then(msg => {
		client.product.push(key, msg.attachments.first().url, "image");
		const filePath = `./${simage.path}`; // Replace this with your file path

// Deleting the file
fs.unlink(filePath, (err) => {
  if (err) {
    console.error('Error deleting the file:', err);
    return;
  }
	
});
		}
		)
	});

		}catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Error uploading image. ', error);
	}
		res.redirect(`/dashboard/pokemons/${key}`);

		
		

});

	app.get("/dashboard/pokemons/:id", checkAuth, async (req,res) => {
		const pokemon = client.product.get(req.params.id);
	const mrole = client.role.get(req.user.id)
const seller = client.users.cache.get(pokemon.author)

			res.render("pokemon", {
					pokemon,
				  seller,
					mrole,
					config: settings,
					req: req,
					user: req.isAuthenticated() ? req.user : null,
					//guild: client.guilds.cache.get(req.params.guildID),
					botClient: client,
					Permissions: Permissions,
					bot: settings.website,
					callback: settings.config.callback,
				 });
		})


	
	/*
app.post("/shop/:id", function(req, res) {
		let guild = client.guilds.cache.get("920944376983740446");
	const productId = req.params.id;
		let embed = new Discord.MessageEmbed()
				.setTitle("New Order")
				.addFields({ name: 'Product ', value: `ID: ${productId}`, inline: true })
				.addFields({ name: 'Product Name', value: client.product.get(productId).title, inline: true })
				.addFields({ name: 'Product Quantity', value: `${req.body.quan_}`, inline: true })
				.addFields({ name: 'Product Author', value: 'test', inline: true })
				.addFields({ name: 'Product Price', value: 'test', inline: true })
				.addFields({ name: 'Total Price', value: 'test', inline: true })
				.setColor("#00ffff")
			 var postchannel = client.channels.cache.get("1184386824135770182")
			 postchannel.send({ embeds: [embed] });
				res.redirect('/dashboard');
}
				 ) */
app.use((req, res, next) => {
	const error = new Error(`Cannot GET ${req.originalUrl}`);
	error.status = 404;
	next(error);
});

app.use((err, req, res, next) => {
	if (err.status === 404) {
		res.redirect('/404'); // Redirect to a specific page for Page Not Found
	} else {
		next(err);
	}
});

		/**
		 * @START THE WEBSITE
		 */
		//START THE WEBSITE ON THE DEFAULT PORT (80)
		const http = require(`http`).createServer(app);
		http.listen(settings.config.http.port, () => {
				console.log(`[${settings.website.domain}]: HTTP-Website running on ${settings.config.http.port} port.`)
		});
}
