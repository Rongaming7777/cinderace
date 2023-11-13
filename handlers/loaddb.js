const Enmap = require("enmap");
module.exports = client => {
    let dateNow = Date.now();
    console.log(`${String("[x] :: ".blue)}Now loading the Database...`.red)
	client.product = new Enmap({
        name: "product",
        dataDir: "./data/products"
    });
	console.log(`[x] :: `.blue + `LOADED THE DATABASES after: `.brightGreen + `${Date.now() - dateNow}ms`.green)
}