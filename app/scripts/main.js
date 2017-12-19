/* globals window, $ */
  'use strict';
  window.addEventListener('Agave::ready', function() {



var appContext = $('[data-app-name="mapman-enrichment-app"]');  

var form = $('form[name=enrichment_analysis]', appContext);

  form.on('submit', function(e) {
    e.preventDefault();

    var Agave = window.Agave;

    // clear previous results/errors/messages
    $('.mapman_enrichment-table', appContext).empty();
    $('.mapman_enrichment-messages', this).empty();
    $('.has-error', this).removeClass('has-error');

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


   var query ={
     bglist:bgList,
     //goilist:goiList
   }; 
   console.log('list');
   console.log(query);
   
 
    if (! hasError) {

      Agave.api.adama.getStatus({}, function(resp) {
        if (resp.obj.status === 'success') {
        	   console.log(query);

          Agave.api.adama.search(
            {'namespace': 'mercator', 'service': 'enrichmentanalysis_v0.1', 'queryParams': query},
            showResults
          );
        } else {
          // ADAMA is not available, show a message
          $('.messages', this).append('<div class="alert alert-danger">The Query Service is currently unavailable. Please try again later.</div>');
        }
      });
    }
    
    var showResults = function( json ) {
        console.log(JSON.stringify(json, null, 2));
     };
    
  });

});
