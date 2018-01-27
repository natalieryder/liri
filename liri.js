require("dotenv").config();
var keys = require("./keys.js");
var Twitter = require("twitter");
var inquirer = require('inquirer');
var Spotify = require('node-spotify-api');
var request = require('request');
var fs = require("fs");


var client = new Twitter(keys.twitter);

var spotify = new Spotify(keys.spotify);

//`my-tweets`

// This will show your last 20 tweets and when they were created at in your terminal/bash window.

inquirer.prompt([{
      type: "list",
      message: "What do you want to do?",
      choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"],
      name: "command",
    }]).then(answers => {
    	executeCommand(answers.command);

    });

function executeCommand(argument,searchParam) {
	switch(argument) {
		case "my-tweets":
    		getTweets(searchParam,20);
    		break;
    	case "spotify-this-song":
    		getSong(searchParam);
    		break;
    	case "movie-this":
    		getMovie(searchParam);
    		break;
    	case "do-what-it-says":
    		doWhatItSays();
    		break;

		default:
			console.log("How did you do that?");
	}
}
function getTweets(sn, count) {
	// if no username, set it
	if (!sn) {
		sn = "TheBananaFacts";
	}
	
	var params = {screen_name: sn, count: count};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
	  if (!error) {
	  	//map to just text and created_at and the index
	  	var scraped = tweets.map(function(tweet, index){
	    	var newObj = {};
	    	newObj.number = index + 1;
	    	newObj.tweet = tweet.text;
	    	newObj.time = tweet.created_at;
	    	return newObj;
	    });
	    console.log(JSON.stringify(scraped, null, ' '));
	  }
	});
};

function getSong(song) {
	// if no song passed in, ask
	if (!song) {
		inquirer.prompt([{
			type: "text",
			name: "song",
			message: "what song do you want to look up?"
		}]).then(answers => {
			if (!answers.song) {
				//if they don't answer
				answers.song = "All The Small Things";
			}
			showSong(answers.song);
		})
	} else {
		showSong(song);
	}

	function showSong(song) {
		var params = {
			type: 'track',
			query: song,
			limit: 1,
		}
		spotify
		  .search(params)
		  .then(function(response) {
		  	var songs = response.tracks.items;
		    var scraped = songs.map(function(song, index) {
		    	var newObj = {};
		    	newObj.artistNames = [];
		    	var artists = song.artists;
		  		for (var i = 0; i < artists.length; i++) {
		  			newObj.artistNames.push(artists[i].name)
			  	};
			  	newObj.songName = song.name;
			  	newObj.albumName = song.album.name;
			  	newObj.link = song.external_urls.spotify;
			  	return newObj;
		    })

		    console.log(JSON.stringify(scraped, null, '\t'));
		  })
		  .catch(function(err) {
		    console.log(err);
		});
	}
};

function getMovie(movie) {
	//if no movie passed in, ask
	if (!movie) {

		movie = "Mr-Nobody";

		inquirer.prompt([{
			message: "What movie would you like to look up",
			name: "movie"
		}]).then(answers => {
			if (answers.movie) {
				//replace all the spaces with -
				movie = answers.movie.replace(/ /g,"-");
			}
			getMovie(movie);
		});

	} else {
		getMovie(movie);
	}

	function getMovie(movie) {
		request('http://www.omdbapi.com/?t=' + movie + '&apikey=trilogy', function (error, response, body) {
			if (error) {
		  		console.log('error:', error); // Print the error if one occurred
		  		console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			}

			if (!body) {
				console.log("That's not a movie");
				return;
			}

		  	movieObj = JSON.parse(body);

		  	var IMDBRating = "none found";
		  	var RTRating = "none found"
		  	for (i = 0; i < movieObj.Ratings.length; i++) {
		  		if (movieObj.Ratings[i].Source === "Internet Movie Database") {
		  			IMDBRating = movieObj.Ratings[i].Value;
		  		};
		  		if (movieObj.Ratings[i].Source === "Rotten Tomatoes") {
		  			RTRating = movieObj.Ratings[i].Value;
		  		};
		  	}
		  	console.log("Title: " + movieObj.Title);
		  	console.log("Year Released: " + movieObj.Year);
		  	console.log("IMDB Rating: " + IMDBRating);
		  	console.log("Rotten Tomatoes Rating: " + RTRating);
		  	console.log("Country Produced: " + movieObj.Country);
		  	console.log("Language: " + movieObj.Language);
		  	console.log("Plot: " + movieObj.Plot);
		  	console.log("Actors: " + movieObj.Actors);

		});
	}


};

function doWhatItSays() {
	fs.readFile("random.txt", "utf8", function(error, data) {

		// If the code experiences any errors it will log the error to the console.
		if (error) {
		  return console.log(error);
		}
		// We will then print the contents of data

		var dataArr = data.split(",");

		var command = dataArr[0];
		//get rid of quotes
		var argument = dataArr[1].replace(/"/g, '');
		//pass the command and argument to the execute function
	  	executeCommand(command,argument);

	});

}
