
$(document).ready(function(){
	var url = ""; // The url to use in the ajax call.
	var apiKey = "b29c6f530cde4cb2b7c6de45520eee27";
	var term = ""; // The search-term; corresponds to parameter 'q'.
	var yearStart = ""; // the year to put into parameter 'begin-date'. 
	var yearEnd = ""; // the year to put into parameter 'end-date'.
	var quantityRequested; // The quantity of articles requested by the user
	var params = {}; // we can build the complete url dynamically using this variable. See 'if statements' below.
	var page = 0;
	var articleNumber = 1;


	var itemsFound = 0;
	var itemsMax = 0;
	var item = ""; 
	var lines = "";
	var enable = false;



	function queryApi() {
		url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";  // the base url to which we add parameters
		params['page'] = page; // sets the url's 'page' parameter equal to the counter-variable 'page'.
		url += '?' + $.param(params); // builds the url based on the user's input.
		console.log("calling api with url: " + url);

		console.log("Begindate param: " + params['begin_date']);
		console.log("Enddate param: " + params['end_date']);

	    $.ajax({
			url: url,
			method: 'GET',
		}).done(function(result) {
			// $("#results").show();
 			// log the entire response object so we can reference it during development.
			console.log(result);
			
			
			//  itemsFound should be in increments of 10
			//  This needs to be worked on since a request of 20 requires 2 API calls

			itemsFound = result.response.docs.length; 
			// Handle if no docs found 
			if (itemsFound == 0) {
				lines = "No results"; 
			}

			$('#results').css('display', 'inline-block');
			$('#search').css('display', 'none');
	// 			$('#results').css('display', 'inline-block');
			// Handle if less than quantityRequested (10, 20, 50, 100)
			// } else if (itemsFound < quantityRequested) {
			// 	itemsMax = itemsFound; 
			// // Only load quantityRequested if there are more 
			// } else if (itemsFound >= quantityRequested) {
			// 	itemsMax = quantityRequested; 
			// }	

			// Iterate over the array 'docs' (it's in the response object) and
			// (for now, we just) append each article headline to the body.
			$("#results").show();
			for (var i=0; i<itemsFound-1; i++) {
					console.log('document number: ' + i + ' on page index: ' + (page));
					console.log(result.response.docs[i].headline.main);

					// some articles do not have an author - this checks for it
					if (result.response.docs[i].byline == null) {
						articlefrom = ""
					}
					else {
						articlefrom = result.response.docs[i].byline.original      // Handle if no docs found 
					}
					console.log("article from:  " + articlefrom)

					// Update this so the headline is the hyperlink

					var a = $("<a />");
					a.attr("href", result.response.docs[i].web_url);
					a.text(result.response.docs[i].headline.main);
					
					var item = (articleNumber + " - " + a);
					var item2 = ('<p>       '  + articlefrom + '</p><br>')
					
					// $('#resultsText').append(item);
					$('#resultsText').append(a);
					// $('#resultsText').append(item);
					$('#resultsText').append(item2);
					articleNumber++
			} // end for i
			page++; // That page is done, so increment the counter variable 'page'.
			// IF there is a 'next page' ... WAIT 1 SECOND TO AVOID error429...
			if (page < (quantityRequested / 10)) {
				// ... THEN QUERY THE API FOR THE NEXT PAGE.
				setTimeout(queryApi, 500);   // I haven't gotten any 429 errors with .5 second delay
			}

		}).fail(function(err) {
			console.log(url)
			throw err;
		}); // end of .fail;
	} // end of function queryApi()


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





		$(document).on ('click', '#okButton', function(){
			// why to we need a timeout????  We already have this in the function that calls the API
			// setTimeout(showResults, 1000);
			show();			
			return false;	
		}); // on click		

		
		$(document).on ('click', '#clearButton', function(){

			$("#recordsToRetrieve").val(10);
			$("#startYear").val('');
			$("#endYear").val('');	
			$("#searchText").val('');

			return false;	
		}); // on click		




	$(document).on('click','#searchButton', function(event){
		event.preventDefault(); // prevents form from submittimg http request/reloading page.
		term = $('#searchText').val().trim();
		quantityRequested = $('#recordsToRetrieve').val().trim();
		yearStart = $('#startYear').val().trim();
		yearEnd = $('#endYear').val().trim();
		console.log("Search term is: " + term);
		console.log("retrieve this many: " + quantityRequested);
		console.log("Year start is interger? " + Number.isInteger(parseInt(yearStart)) + "length = " + yearStart.length);
		console.log(yearEnd);

		// we'll always need the apiKey in the url.
		params['api-key'] = apiKey;
		// if the user sets a value for a given parameter, then include that parameter in the url.
		if (term != "") { params['q'] = term; }
		if (yearStart != "") {
			// Make sure the user entered a YEAR correctly, and...
			if ((Number.isInteger(parseInt(yearStart))) && (yearStart.length == 4)) {
			params['begin_date'] = (yearStart + '0101');

			// ... if they didnt --> add a message into the text input field, and AVOID API ERROR.
			} else {
				$('#startYear').attr("placeholder", " Please enter a four digit year").val("").blur();
				return false;
			} // if-else isInteger
		}
		if (yearEnd != "") {
			// Make sure the user entered a YEAR correctly, and...
			if ((Number.isInteger(parseInt(yearEnd))) && (yearEnd.length == 4)) {
			params['end_date'] = (yearEnd + '0101');

			// ... if they didnt --> add a message into the text input field, and AVOID API ERROR.
			} else {
				$('#endYear').attr("placeholder", " Please enter a four digit year").val("").blur();
				return false;
			} // if-else isInteger
		}
		if (yearEnd < yearStart) {
			Alert("The End Year must be >= Start Year")
			return false;
		}

		queryApi();
	}); // on click
}); // document.ready

