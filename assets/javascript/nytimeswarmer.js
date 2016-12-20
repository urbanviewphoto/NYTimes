$(document).ready(function(){
	var apiKey = "b29c6f530cde4cb2b7c6de45520eee27";

	var url = ""; // The url to use in the ajax call.
	var term = ""; // The search-term; corresponds to parameter 'q'.
	var yearStart = ""; // the year to put into parameter 'begin-date'. 
	var yearEnd = ""; // the year to put into parameter 'end-date'.
	var quantityRequested; // The quantity of articles requested by the user
	var params = {}; // we can build the complete url dynamically using this variable. See 'if statements' below.
	var page = 0;
	var itemsFound = 0;
	var itemsMax = 0;
	var item = ""; 
	var lines = "";
	var enable = false;

	function queryApi() {
		lines = "";
		url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";  // the base url to which we add parameters
		params['page'] = page; // sets the url's 'page' parameter equal to the counter-variable 'page'.
		url += '?' + $.param(params); // builds the url based on the user's input.
		console.log("calling api with url: " + url);
		console.log(params);

		//console.log("Begindate param: " + params['begin_date']);
		//console.log("Enddate param: " + params['end_date']);

	    $.ajax({
			url: url,
			method: 'GET',
		}).done(function(result) {
 			// log the entire response object so we can reference it during development.
			console.log(result);
			// Iterate over the array 'docs' (it's in the response object) and
			// (for now, we just) append each article headline to the body. Speak with Frank regarding
			// exactly what info we're gonna display, div IDs, etc. 

			// This code I added to handle the number of items; loop failed for less than 10
			itemsFound = result.response.docs.length; 

			// Handle if no docs found 
			if (itemsFound == 0) {
				lines = "No results"; 
			// Handle if less than quantityRequested (10, 20, 50, 100)
			} else if (itemsFound < quantityRequested) {
				itemsMax = itemsFound; 
			// Only load quantityRequested if there are more 
			} else if (itemsFound >= quantityRequested) {
				itemsMax = quantityRequested; 
			}	

			// Changed i<10; to i<itemsMax.  
			for (var i=0; i<itemsMax; i++) {
				console.log('document number: ' + i + ' on page index: ' + (page));
				console.log(result.response.docs[i]);
				//console.log(result.response.docs[i].headline.main);
				//var item = ('<h2>' + (result.response.docs[i].headline.main) + '</h2>');
				// changed item from <h2> to text with a <br> 
				var item = (result.response.docs[i].headline.main) + '<br>';
				//$('body').append(item);
				// We will append the data to the lines string & append to div later 
				lines = lines + item; 					
			} // end for i

			// Let's talk about this code and how to handle
			page++; // That page is done, so increment the counter variable 'page'.
			// IF there is a 'next page' ... WAIT 1 SECOND TO AVOID error429...
			if (page < (quantityRequested / 10)) {
				// ... THEN QUERY THE API FOR THE NEXT PAGE.
				setTimeout(queryApi, 1000);
			}
			// show the results
			setTimeout(showResults, 1000);

		}).fail(function(err) {
			throw err;
		}); // end of .fail;
	} // end of function queryApi()

	// function to show the results
	// uses an enable var to determine what to do
	// if enable is false, we load #resultsText with lines and toggle displays & enable
	// if enable is true, we clear #resultsText and toggle displays & enable 
	function showResults(){
		if (enable == false){
			$('#resultsText').html(lines); 				
			$('#search').css('display', 'none');
			$('#results').css('display', 'inline-block');
			enable = true;
		} else {
			$('#resultsText').html('');
			$('#results').css('display', 'none');
			$('#search').css('display', 'inline-block');		
			enable = false;
		}				
	} // end of function showResults

	// simple ok button to bounce out of results 
	$(document).on ('click', '#okButton', function(){
		
		setTimeout(showResults, 1000);			

		return false;	
	}); // on click		

	// clear function - just clears the search div elements 
	$(document).on ('click', '#clearButton', function(){

		$("#recordsToRetrieve").val(10);
		$("#startYear").val('');
		$("#endYear").val('');	
		$("#searchText").val('');

		return false;	
	}); // on click							

	//$('#searchButton').on('click', function(event){
	// Modified to document on so it would loop 
	$(document).on('click', '#searchButton', function(){
		//event.preventDefault(); // prevents form from submittimg http request/reloading page.
		term = $('#searchText').val().trim();
		quantityRequested = $('#recordsToRetrieve').val().trim();
		yearStart = $('#startYear').val().trim();
		yearEnd = $('#endYear').val().trim();
		console.log("Search term is: " + term);
		console.log("retrieve this many: " + quantityRequested);
		console.log(yearStart);
		console.log(yearEnd);

		// we'll always need the apiKey in the url.
		params['api-key'] = apiKey;
		// if the user sets a value for a given parameter, then include that parameter in the url.
		if (term != "") { params['q'] = term; }
		if (yearStart != "") { params['begin_date'] = (yearStart + '0101'); }
		if (yearEnd != "") { params['end_date'] = (yearEnd + '0101'); }

		queryApi();	

		return false;	// since we switched to document on, use return false 
	}); // on click

}); // document.ready