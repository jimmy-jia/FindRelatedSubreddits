/*
function: findRelated
input: 	subreddit - target subreddit to find relations with
		limit - maximum number of matches to return
output: returns a promise with the array of matches, # of elements is up to the limit
*/

function findRelated(subreddit, limit){

	//return a promise to deal with async request
	return new Promise(function(resolve, reject){
		var target = subreddit.toLowerCase();
		var oReq = new XMLHttpRequest();
		oReq.onload = function (e) {
			var matches = [];
			var treeData = JSON.parse(this.responseText);

			//walk through data to find connected subreddits
			for(var key in treeData.edges){
				if((treeData.edges[key].source).toLowerCase() === target){
					matches.push((treeData.edges[key].target).toLowerCase());
				}
			}
			//randomize the array and limit the # of returned elements
			returnArray = shuffle(matches).slice(0, limit);

			//if request is successful, resolve the promise, else return error
			if(oReq.status == 200){
				resolve(returnArray);
			}
			else{
				reject(Error(oReq.statusText));
			}
		};
		oReq.open("get", "data.json", true);
		oReq.onerror = function(){
			reject(Error("Network Error"));
		}
		oReq.send();
	})
}


/*
function: shuffle
input: 	array - the array to randomly shuffle, uses Knuth Shuffle algorithm
output: the shuffled array
*/
function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex ;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

/*
function: findCombinedRelated
input: 	subreddits - array of subreddits to find relations for
		limit - maximum number of matches to return 
output: returns a promise with the array of matches, which is calculated with highest frequency of incidence
*/
function findCombinedRelated(subreddits, limit){
	return new Promise(function(resolve, reject){
		for(var i = 0; i < subreddits.length; i++){
			subreddits[i] = subreddits[i].toLowerCase();
		}
		var oReq = new XMLHttpRequest();
		oReq.onload = function(e){
			var matches = {};
			var treeData = JSON.parse(this.responseText);
			for(var key in treeData.edges){
				for(var i = 0; i < subreddits.length; i++){
					if((treeData.edges[key].source).toLowerCase() === subreddits[i]){
						if(subreddits[i] in matches){
							matches[(treeData.edges[key].target).toLowerCase()]++;
						}
						else
							matches[(treeData.edges[key].target).toLowerCase()] = 1;
					}
				}
			}
			var sortArray = [];
			for(var key in matches)
				sortArray.push([key, matches[key]]);
			
			sortArray.sort(function(a, b){
				return b[1] - a[1];
			});

			var returnArray = [];

			for(var i = 0; i < limit; i++)
				returnArray.push(sortArray[i][0]);

			if(oReq.status == 200){
				resolve(returnArray);
			}
			else{
				reject(Error(oReq.statusText));
			}
		}
		oReq.open("get", "data.json", true);
		oReq.onerror = function(){
			reject(Error("Network Error"));
		}
		oReq.send();
	});
}

/*https://www.reddit.com/subreddits/mine/subscriber.json

function parseRedditData(limit){


	var subredditList = [];
	for(var i = 0; i < object.data.children.length; i++){
		var currSub = object.data.children[i];
		subredditList.push(currSub.data.display_name);
	}
	findCombinedRelated(subredditList, limit).then(function(response){
		console.log(response);
	});
}
*/


var accessReddit = (function() {
	var modhash, cookie;
	return {
		login: function(user, pass, callback) {
			var xhr = new XMLHttpRequest();
			xhr.open('POST', 'http://www.reddit.com/api/login?op=login-main&api_type=json&rem=true&user=' +
					user + '&passwd=' + pass);
			xhr.addEventListener('readystatechange', function() {
				if (xhr.readyState === 4 && xhr.status === 200) {
					var res = JSON.parse(xhr.responseText).json.data;
					modhash = res.modhash;
					cookie = res.cookie;
					callback();
				}
			});
			xhr.send();
		},
		parse: function(callback) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'https://www.reddit.com/subreddits/mine/subscriber.json');
			xhr.setRequestHeader('X-Modhash', modhash);
			document.cookie = cookie;
			xhr.addEventListener('readystatechange', function() {
				if (xhr.readyState === 4 && xhr.status === 200) {
					callback(xhr.responseText);
				}
			});
			xhr.send();
		}
	};

})();