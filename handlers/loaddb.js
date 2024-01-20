const Enmap = require("enmap");
module.exports = client => {
    let dateNow = Date.now();
    console.log(`${String("[x] :: ".blue)}Now loading the Database...`.red)
	client.product = new Enmap({
        name: "product",
        dataDir: "./data/products"
    });
	client.role = new Enmap({
        name: "role",
        dataDir: "./data/role"
    });
	console.log(`[x] :: `.blue + `LOADED THE DATABASES after: `.green + `${Date.now() - dateNow}ms`.green)
}