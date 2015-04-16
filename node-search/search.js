var when = require( "when" );
var stringify = require( "csv-stringify" );
var LeanKitClient = require( "leankit-client" );
var _ = require( "lodash" );
var options = require( "yargs" )
	.usage( "Usage: $0 -h \"hostname\" -u \"email\" -p \"password\" -b [\"name\" or 1234] [options]" )
	.option( "h", { alias: "host", demand: true, describe: "Host name (e.g. mycompany)", type: "string" } )
	.option( "u", { alias: "user", demand: true, describe: "Account email (e.g. me@company.com)", type: "string" } )
	.option( "p", { alias: "password", demand: true, describe: "Account password", type: "string" } )
	.option( "b", { alias: "board-id", demand: true, describe: "Board name or ID" } )
	.option( "s", { alias: "search", describe: "Search terms", type: "string" } )
	.option( "board", { describe: "Search board", type: "boolean" } )
	.option( "backlog", { describe: "Search backlog", type: "boolean" } )
	.option( "archive", { describe: "Search recent archive", type: "boolean" } )
	.option( "old", { describe: "Search old archive (> 14 days)", type: "boolean" } )
	.option( "comments", { describe: "Search comments", type: "boolean" } )
	.option( "tags", { describe: "Search tags", type: "boolean" } )
	.option( "csv", { alias: "csv", describe: "CSV output", "type": "boolean" } )
	.option( "json", { alias: "json", describe: "JSON output", "type": "boolean" } )
	.help( "?" )
	.alias( "?", "help" )
	.epilog( "Copyright 2015 LeanKit" )
	.argv;


if ( !options.backlog && !options.board && !options.archive && !options.old )
	options.board = true;

if ( !options.csv && !options.json )
	options.csv = true;

var client = LeanKitClient.createClient( options.host, options.user, options.password );

var searchOptions = {
	SearchTerm: options.search || "",
	SearchInBacklog: options.backlog,
	SearchInBoard: options.board,
	SearchInRecentArchive: options.archive,
	SearchInOldArchive: options.old,
	IncludeComments: options.comments,
	IncludeTags: options.tags
};

getBoardId( options.b )
	.then( function( boardId ) {
		return getCardsBySearch( boardId, searchOptions );
	}, function( err ) {
			console.error( "Error getting board by id or name:", err );
		} )
	.then( function( cards ) {
		if ( options.json ) {
			console.log( JSON.stringify( cards ) );
		} else {
			stringify( cards, { header: true }, function( err, csvOutput ) {
				if ( err ) console.error( "err:", err );
				console.log( csvOutput );
			} );
		}
	}, function( err ) {
			console.error( "Error searching cards:", err );
		} );


function getBoardId( idOrName ) {
	return when.promise( function( resolve, reject ) {
		if ( typeof (idOrName) === "number" ) {
			resolve( idOrName );
		} else {
			client.getBoards( function( err, boards ) {
				if ( err ) {
					return reject( err );
				}

				var board = null;
				for (var i = 0; i < boards.length; i++) {
					if ( boards[ i ].Title === idOrName )
						board = boards[ i ];
				}
				if ( board ) {
					resolve( board.Id );
				} else {
					reject( "Board named [" + idOrName + "] not found" );
				}
			} );
		}
	} );
}

function getCardsBySearch( boardId, searchOptions ) {
	return when.promise( function( resolve, reject ) {
		var cards = [];
		searchOptions.Page = 1;
		searchOptions.MaxResults = 20;
		var counter = 0;
		var maxRecursion = 10;

		var recurse = _.throttle( function( boardId, searchOptions ) {
			counter++;
			client.searchCards( boardId, searchOptions, function( err, res ) {
				if ( err ) return done( err );
				if ( res && res.Results && res.Results.length > 0 ) {
					cards.push.apply( cards, res.Results );

					if ( cards.length >= res.TotalResults || counter >= maxRecursion ) {
						return done();
					} else {
						searchOptions.Page++;
						recurse( boardId, searchOptions );
					}
				} else {
					return done();
				}
			} );
		}, 500 );

		function done( err ) {
			if ( err ) {
				return reject( err );
			}
			return resolve( cards );
		}

		recurse( boardId, searchOptions );

	} );
}
