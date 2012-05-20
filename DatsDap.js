/**
@author Matt Crinklaw-Vogt
*/

var jisonParser = require("./FilterParserJison"),
ast = require("./ast"),
util = require("util");

function FilterParser() {
	this.parser = jisonParser.parser;
}

// TODO: how can we new up a new jison parser?
// and pass it an object to fill out...
FilterParser.prototype = {
	compile: function(filterStr) {
		this.parser.parse(filterStr);
		var result = ast.resultHolder.result;
		ast.resultHolder.result = null;
		return result;
	}
}

exports.FilterParser = FilterParser;