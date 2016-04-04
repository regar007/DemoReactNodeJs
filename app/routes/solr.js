var solr = require("solr-client");

var solrClient = solr.createClient();

solrClient.add({id :})

module.exports = {

	search : function(query){
		solrClient.search(query, function())

	}

}