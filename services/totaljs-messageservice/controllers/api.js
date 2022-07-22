exports.install = function() {

	// Total.js API - https://docs.totaljs.com/total4/407ff001jy51c/#api-routing
	// ROUTE('API   /api/      -connections_query          *Connections --> query');
	// ROUTE('API   /api/      -connections_read/id        *Connections --> read');
	// ROUTE('API   /api/      +connections_insert/id      *Connections --> insert');
	// ROUTE('API   /api/      +connections_update/id      *Connections --> update');
	// ROUTE('API   /api/      -connections_remove/id      *Connections --> remove');

	// REST API
	ROUTE('GET       /api/connections/           *Connections --> query');
	ROUTE('GET       /api/connections/{id}/      *Connections --> read');
	ROUTE('POST      /api/connections/           *Connections --> insert');
	ROUTE('PUT       /api/connections/{id}/      *Connections --> update');
	ROUTE('DELETE    /api/connections/{id}/      *Connections --> remove');

}
