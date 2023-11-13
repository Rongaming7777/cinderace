const Discord = require(`discord.js`);
const Enmap = require("enmap");
const express = require("express");
var reload = require('reload');
const colors = require("colors")
const http = require("http");  
const randomstring = require("randomstring");
const url = require(`url`);
const path = require(`path`);
const { Permissions } = require("discord.js");
const ejs = require("ejs");
const fs = require("fs")
const passport = require(`passport`);
const bodyParser = require("body-parser");
const Strategy = require(`passport-discord`).Strategy;
const BotConfig = require("./config.json");
module.exports = client => {

    //Start teh website
    console.log("Loading Website".yellow)
    const settings = require("./settings.json");
    // We instantiate express app and the session store.
    const app = express();
    const httpApp = express();
    const session = require(`express-session`);
    const MemoryStore = require(`memorystore`)(session);

    /**
     * @INFO - Initial the Discord Login Setup!
     */
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));
    passport.use(new Strategy({
      clientID: settings.config.clientID,
      clientSecret: settings.config.secret,
      callbackURL: settings.config.callback,      
      scope: [`identify`, `email`, `guilds`, `guilds.join`]
    },
    (accessToken, refreshToken, profile, done) => { 
      process.nextTick(() => done(null, profile));
    }));

    
    /**
     * @INFO - ADD A SESSION SAVER
     */
const oneDay = 1000 * 60 * 60 * 24;
    app.use(session({
        store: new MemoryStore({ checkPeriod: 86400000 }),
        secret: randomstring.generate(20),
        cookie: { maxAge: oneDay },
        resave: false,
        saveUninitialized: true,
    }));

    // initialize passport middleware.
    app.use(passport.initialize());
    app.use(passport.session());


    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, './views'))


    //Those for app.use(s) are for the input of the post method (updateing settings)
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({
      extended: true
    }));

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

    //Login endpoint
    app.get(`/sign`, (req, res, next) => {
        if (req.session.backURL) {
          req.session.backURL = req.session.backURL; 
        } else if (req.headers.referer) {
          const parsed = url.parse(req.headers.referer);
          if (parsed.hostname === app.locals.domain) {
            req.session.backURL = parsed.path;
          }
        } else {
          req.session.backURL = `/`;
        }
        next();
      }, passport.authenticate(`discord`, { prompt: `none` })
    );


    //Callback endpoint for the login data
    app.get(`/callback`, passport.authenticate(`discord`, { failureRedirect: "/" }), async (req, res) => {
        let banned = false // req.user.id
        if(banned) {
                req.session.destroy(() => {
                res.json({ login: false, message: `You have been blocked from the Dashboard.`, logout: true })
                req.logout();
            });
        } else {
            res.redirect(`/dashboard`)
        }
    });



    //When the website is loaded on the main page, render the main page + with those variables
    app.get("/", (req, res) => {
        res.render("index", {
          req: req,
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
    app.get(`/logout`, function (req, res) {
      req.session.destroy(() => {
        req.logout();
        res.redirect(`/`);
      });
    });
    // Dashboard endpoint.
	app.get("/dashboard", checkAuth, async (req,res) => {
      if(!req.isAuthenticated() || !req.user) 
      return res.redirect("/?error=" + encodeURIComponent("Login First!"));
      if(!req.user.guilds)
      return res.redirect("/?error=" + encodeURIComponent("Unable to get your Guilds!"));
		const products = client.product.fetchEverything();
			res.render("dashboard", {
				  products,
					req: req,
          user: req.isAuthenticated() ? req.user : null,
          //guild: client.guilds.cache.get(req.params.guildID),
          botClient: client,
          Permissions: Permissions,
          bot: settings.website,
          callback: settings.config.callback,
         });
    })
	
app.post("/dashboard/shop/buy", function(req, res) {
    let guild = client.guilds.cache.get("1107326185597308972");
    let embed = new Discord.MessageEmbed()
        .setTitle("New Order")
        .addFields({ name: 'Order Id', value: 'test', inline: true })
        .addFields({ name: 'Product Id', value: 'test', inline: true })
        .addFields({ name: 'Product Name', value: 'test', inline: true })
        .addFields({ name: 'Product Quantity', value: req.body.quantity, inline: true })
			  .addFields({ name: 'Product Author', value: 'test', inline: true })
			  .addFields({ name: 'Product Price', value: 'test', inline: true })
        .addFields({ name: 'Total Price', value: 'test', inline: true })
        .setColor("#00ffff")
       var postchannel = client.channels.cache.get("1119947526041239663")
       postchannel.send({ embeds: [embed] });
        res.redirect('/dashboard');
}
				 )
    /**
     * @START THE WEBSITE
     */
    //START THE WEBSITE ON THE DEFAULT PORT (80)
    const http = require(`http`).createServer(app);
    http.listen(settings.config.http.port, () => {
        console.log(`[${settings.website.domain}]: HTTP-Website running on ${settings.config.http.port} port.`.red)
    });
	
				
}
