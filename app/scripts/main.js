/*global _*/
/*jshint camelcase: false*/
(function(window, $, _, undefined) {
  'use strict';

  console.log('Hello, Gene ID to MapMan bin!');

  var appContext = $('[data-app-name="mapman-enrichment-app"]');

  var templates = {
		  resultTable: _.template('<table class="table"><thead><tr><th>Bin code</th><th>Genes of Interest</th><th>Background Genes</th><th>Fisher</th><th>BH Fisher</th></tr></thead><tbody><% _.each(bins, function(r) { %><tr><td><%= r.NODE %></td><td><%= r.GOI %></td><td><%= r.BG %></td><td><%= r.FISHER %></td><td><%= r.BHFISHER %></td></tr><% }) %></tbody></table>'),
		  failGOIList: _.template('<ul><% _.each(undetectedGOI, function(r) { %><li><%= r %></li><% }) %></ul>'),
		  failBGList: _.template('<ul><% _.each(undetectedBG, function(r) { %><li><%= r %></li><% }) %></ul>'),
		  errors: _.template('<ul><% _.each(function(r) { %><li><%= r %></li><% }) %></ul>')
  };

  var form = $('form[name=enrichment_analysis]', appContext);
  form.on('submit', function(e) {
    e.preventDefault();

    var Agave = window.Agave;


    // clear previous results/errors/messages
    $('#mapman_enrichment-table', appContext).empty();
    $('#mapman_enrichment-messages', appContext).empty();
    $('.has-error', appContext).removeClass('has-error');

    var bg = this.backgroundGenes.value.split(/\n/);
    var goi = this.genesOfInterest.value.split(/\n/);


    var bgList=[];
    var goiList=[];
    var hasError = false;

    for (var i=0; i<bg.length; i++){
      if(/\S/.test(bg[i])){
        bgList.push($.trim(bg[i]));
      }
    }

    for (var j=0; j<goi.length; j++){
      if(/\S/.test(goi[j])){
        goiList.push($.trim(goi[j]));
      }
    }


    if(bgList.length === 0 ){
      $(this.backgroundGenes).parent().addClass('has-error');
      $('#mapman_enrichment-messages', this).append('<div class="alert alert-danger">Background Genes cannot be empty</div>');
      hasError = true;
    }


    if(goiList.length === 0 ){
      $(this.genesOfInterest).parent().addClass('has-error');
      $('#mapman_enrichment-messages', this).append('<div class="alert alert-danger">Genes of Interest cannot be empty</div>');
      hasError = true;
    }


   var queryParams ={
     'bg_list':bgList.join(','),
     'goi_list':goiList.join(','),
     'mapman_version':this.version.value
	 //'bg_list': 'AT1G12345,AT1G12346',
     //'goi_list':'AT1G12345,AT1G12346'
   }; 
   
   console.log('list');
   console.log(queryParams);
	
	if (!hasError){
		
		Agave.api.adama.getStatus({}, function(resp) {
			if (resp.obj.status === 'success') {
		
				$.ajax({   
					url: 'https://api.araport.org/community/v0.3/mercator/enrichmentanalysis_v0.1/access/search',
					headers: {'Authorization': 'Bearer ' + Agave.token.accessToken},
					data: queryParams,
					error: function(err) {
			        // handle errors
						console.log(err);
					},
					success: function(data) {
						console.log(data);
						showResults(data);
			        // operate on successful data return
					}
				});
	          
	          }else {
	        	  // ADAMA is not available, show a message
	        	  $('#mapman_enrichment-table', this).append('<div class="alert alert-danger">The Query Service is currently unavailable. Please try again later.</div>');
	          }
	      });
	}

    function showResults ( result ) {
        console.log(JSON.stringify(result, null, 2));
        
        if (result.status === 'success'){
        
			if (result.results.bins.length > 0) {
				$('#mapman_enrichment-table').html(templates.resultTable(result.results));
				$('#mapman_enrichment-table .table').dataTable();
			}
			
			if (result.results.undetectedGOI.length > 0) {
				$('#mapman_enrichment-messages').append('<div class="alert alert-danger">One or more entries in the "Genes of Interest" could not be found - please verfiy that they are valid gene identifiers' + templates.failGOIList(result.results));
			}
			
			if (result.results.undetectedBG.length > 0) {
				$('#mapman_enrichment-messages').append('<div class="alert alert-danger">One or more entries in the "Background genes" could not be found - please verfiy that they are valid gene identifiers' + templates.failBGList(result.results));
			}
        }else{
			$('#mapman_enrichment-messages').append('<div class="alert alert-danger">No valid genes could be found for analysis - please verify the AGI codes<div>');

			if (result.results.undetectedGOI.length > 0) {
				$('#mapman_enrichment-messages').append('<div class="alert alert-danger">One or more entries in the "Genes of Interest" could not be found - please verfiy that they are valid gene identifiers' + templates.failGOIList(result.results));
			}
			
			if (result.results.undetectedBG.length > 0) {
				$('#mapman_enrichment-messages').append('<div class="alert alert-danger">One or more entries in the "Background genes" could not be found - please verfiy that they are valid gene identifiers' + templates.failBGList(result.results));
			}
        }
    }

//   var query ={
//     locus:texts
//   };  
//    if (! hasError) {
//      //$('.results').html('<pre><code>' + JSON.stringify(query, null, 2) + '</code></pre>');
//
//      Agave.api.adama.getStatus({}, function(resp) {
//        if (resp.obj.status === 'success') {
//          Agave.api.adama.search(
//            {'namespace': 'mapman', 'service': 'genelookupflat_v0.1', 'queryParams': query},
//            showResults
//          );
//        } else {
//          // ADAMA is not available, show a message
//          $('.messages', this).append('<div class="alert alert-danger">The Query Service is currently unavailable. Please try again later.</div>');
//        }
//      });
//    }

//    var showResults = function( json ) {
//      //console.log(JSON.stringify(json, null, 2));
//      // show error message for invalid object
//      if ( ! ( json && json.obj ) ) {
//        $( '.results', appContext ).html( '<div class="alert alert-danger">Invalid response!</div>' );
//       return;
//      }
//      
//
//      if (json.obj.result.failedgenes){
//        //console.log('failed genes');
//        $('.messages', appContext).append('<div class="alert alert-danger">One or more entries did not return a result - please verfiy that they are valid AGI codes'+templates.failTable(json.obj.result)+'</div>');
//      }
//
//      if (json.obj.result.genes.length > 0){
//        $( '.results', appContext ).html( templates.resultTable( json.obj.result ) );
//        $( '.results table', appContext ).dataTable();
//      }
//    };

  });

})(window, jQuery, _);

