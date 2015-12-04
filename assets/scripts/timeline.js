var width = document.getElementById("timelineModule").offsetWidth - 30;
var height = 300;
var margin = 20;
var evoKeyWidth = 120;
    
var pokeID = pokemon.Number;
var nameData, moveData, pokeMoveData, speciesData, evolutionData, triggerData;

var xScale = d3.scale.linear()
    .domain([0, 100])
    .range([evoKeyWidth, width - margin]);
var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

var yScale = d3.scale.ordinal()
    .domain([0, 3])
    .range([margin, height - margin]);
    
var svg = d3.select("#timelineModule").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");

svg.append("g")
    .attr("class", "axis")
    .call(xAxis)
    .attr("transform", "translate(0," + (height - 2 * margin) + ")");
    

//loads in data about pokemon names
d3.csv("/assets/data/pokemon_stats.csv", function(data) {
    nameData = data;
});


//loads in data about all moves
d3.csv("/assets/data/moves.csv", function(data) {
    moveData = data;
});


//loads in data about individual pokémon's moves
d3.csv("/assets/data/pokemon_moves.csv", function(data) {
    pokeMoveData = data;
    var moves = getPokeMoves(pokeID);
    for (var i = 0; i < moves.length; i++) {
        console.log(getMoveData(moves[i].move_id).identifier, moves[i].level);
    }
});

//loads in data about pokémon's evolutions
d3.csv("/assets/data/pokemon_evolution.csv", function(data) {
    evolutionData = data;
});

//loads in data about evolution triggers
d3.csv("/assets/data/evolution_triggers.csv", function(data) {
    triggerData = data;
});

//loads in data about pokémon's evolution chains
d3.csv("/assets/data/pokemon_species.csv", function(data) {
    speciesData = data;
    
    var chain = orderIDSBasedOnChain(getAllPokemonInChain(pokeID));
    
    for (var i = 0; i < chain.length; i++) {
        svg.append("text")
            .attr("class", "timeline-text")
            .attr("x", 0)
            .attr("y", (height - margin) / chain.length * i + (.5 * ((height - margin) / chain.length)))
            .text(getPokemonName(chain[i]));
    }
});

//returns the moveset of a pokémon based on its numerical id
function getPokeMoves(id) {
     var pokeMoves = new Array();

    for(var i = 0; i < pokeMoveData.length; i++){
       if (pokeMoveData[i].pokemon_id == pokeID && pokeMoveData[i].version_group_id == 16 && pokeMoveData[i].level != 0) {
           pokeMoves.push(pokeMoveData[i]);
       } 
   }

    return pokeMoves;
}

//returns the evolution chain of a pokémon based on its numerical id
function getEvolutions(id) {

    var evolutionIDs = getAllPokemonInChain(id);
    
    var evolutions = new Array();
    
    for (var i = 0; i < evolutionData.length; i++) {
        for (var j = 0; j < evolutionIDs.length; j++) {
            if (evolutionData[i].evolved_species_id == evolutionIDs[j]) {
                evolutions.push(evolutionData[i]);
            }
        }
    }
    
    return evolutions;
    
}

//returns the evolution trigger text based on the trigger id
function getEvolutionTrigger(id) {
    for (var i = 0; i < triggerData.length; i++) {
        if (triggerData[i].id == id) {
            return triggerData[i].identifier;
        }
    }
}

function getAllPokemonInChain(id){
     var speciesID;
    
    for (var i = 0; i < speciesData.length; i++) {
        if (speciesData[i].id == id) {
            speciesID = speciesData[i].evolution_chain_id;
        }
    }
    
    var evolutionIDs = new Array();
    
    for (var i = 0; i < speciesData.length; i++) {
        if (speciesData[i].evolution_chain_id == speciesID) {
           evolutionIDs.push(speciesData[i].id);
            
        }
    }
    
    return evolutionIDs;
    
}

//returns the information about a move based on its numerical id
function getMoveData(id) {
    var move;
    for (var i = 0; i < moveData.length; i++) {
        if (moveData[i].id == id) {
            move = moveData[i];
        }
    }
    return move;
    
}

//returns the pokemon's name based on its numerical id
function getPokemonName(id) {
    var name;
    for (var i = 0; i < nameData.length; i++) {
        if (nameData[i].Number == id) {
            name = nameData[i].Name;
        }
    }
    return name;
}

function orderIDSBasedOnChain(ids) {
    var expectedPrev = "";
    for (var i = 0; i < ids.length; i++) {       
        var prevPokemon;
        for (var j = 0; j < speciesData.length; j++) {
            if (ids[i] == speciesData[j].id) {
                prevPokemon = speciesData[j].evolves_from_species_id;
            }
        }      
        if (prevPokemon != expectedPrev) {
            for (var k = 0; k < ids.length; k++) {
                if (ids[k] == prevPokemon) {
                    ids.splice(k, 1);
                }
            }
            ids.splice(i, 0, prevPokemon);
            expectedPrev = prevPokemon;
        } else {
            expectedPrev = ids[i];
        }
    }
    return ids;
}