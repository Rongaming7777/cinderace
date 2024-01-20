const fs = require('fs');

// Read the contents of the file
fs.readFile('Pokemons.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Split the data by new lines to get an array of Pokémon names
  const pokemonArray = data.trim().split('\n');

  // Create an object with the Pokemon array
  const pokemonObject = { "Pokemon": pokemonArray };

  // Convert the object to JSON format
  const jsonPokemon = JSON.stringify(pokemonObject, null, 2);

  // Write the JSON to a new file
  fs.writeFile('pokemon.json', jsonPokemon, 'utf8', (err) => {
    if (err) {
      console.error('Error writing JSON to file:', err);
      return;
    }
    console.log('Conversion successful. Pokemon names have been written to pokemon.json.');
  });
});
