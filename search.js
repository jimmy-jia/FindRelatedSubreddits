/*
function: findRelated
input: 	subreddit - target subreddit to find relations with
		limit - number of matches to return
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