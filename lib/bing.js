
/*********************************************************
 *  Simple Node.js module for using the Bing Search API  *
 *********************************************************/

// Require dependencies
var request = require('request'),
    url = require('url'),
    _ = require('underscore'),
    debug = require('debug')('Bing'),
    qs = require('querystring');

/**
 * @param {Object} options  Options to all Bing calls, allows overriding of rootUri,
 *  accKey (Bing API key), userAgent, reqTimeout
 * @returns {Bing}
 * @constructor
 */
var Bing = function( options ) {

    if( !(this instanceof Bing) ) return new Bing( options );

    var defaults = {

        //Bing Search API URI
        rootUri: "https://api.datamarket.azure.com/Bing/Search/",

        //Account Key
        accKey: null,
 
        //Bing UserAgent
        userAgent: 'Bing Search Client for Node.js',

        //Request Timeout
        reqTimeout: 5000
    };

    //merge options passed in with defaults
    this.options = _.extend(defaults, options);

    this.searchVertical = function(query, vertical, callback, options) {
        if(typeof callback != 'function') {
            throw "Error: Callback function required!";
        }

        // TODO check if valid options

        var opts = this.options;

        if (options !== null) {
            opts = _.extend(this.options, options);
        }

        var reqUri = opts.rootUri + vertical +
            "?$format=json&" + (opts.additionalUriParams ? opts.additionalUriParams + '&' : '') +
            qs.stringify({ "Query": "'" + query + "'" });

        debug('Requesting '+reqUri);
        request({
            uri: reqUri,
            method: opts.method || "GET",
            headers: {
                "User-Agent": opts.userAgent
            },
            auth: {
                user: opts.accKey,
                pass: opts.accKey
            },
            timeout: opts.reqTimeout

        }, function(err, res, body){
            // Parse body, if body
            if (typeof body === 'string') {
                try {
                    body = JSON.parse(body);
                } catch (exception) {
                    debug('Failed to parse result '+body);
                    // Non-JSON results are typically errors.  If the error is not set, set it to the error string
                    //  that was returned as the body.
                    err = err || body;
                }
            }

            callback(err, res, body);
        });
    };

};

/**
 * @callback requestCallback
 * @param {String} error        Error evaluates to true when an error has occurred.
 * @param {Object} response     Response object from the Bing call.
 * @param {Object} body         JSON of the response.
 */

/**
 * Performs a Bing search in the Web vertical.
 *
 * @param {String} query                Query term to search for.
 * @param {requestCallback} callback    Callback called with (potentially json-parsed) response.
 * @param {Object} options              Options to command, allows overriding of rootUri,
 *  accKey (Bing API key), userAgent, reqTimeout
 * @function
 */
Bing.prototype.search = function(query, callback, options) {
    this.searchVertical(query, "Web", callback, options);
};

/**
 * Performs a Bing search in the Images vertical.
 *
 * @param {String} query                Query term to search for.
 * @param {requestCallback} callback    Callback called with (potentially json-parsed) response.
 * @param {Object} options              Options to command, allows overriding of rootUri,
 *  accKey (Bing API key), userAgent, reqTimeout
 * @function
 */
Bing.prototype.images = function(query, callback, options) {
    this.searchVertical(query, "Image", callback, options);
};

module.exports = Bing;
