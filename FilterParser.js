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


//jisonParser.parse('(&(type=Person)(|(sn=Jensen)(cn=Babs J*)))');

//console.log(util.inspect(ast.resultHolder.result, false, null));

// var result = ast.resultHolder.result;
// var matched = result.evaluate({
// 	type: "Person",
// 	sn: "Jensen",
// 	cn: "Babs Jr"
// });

// console.log("Matched? " + matched);

// matched = result.evaluate({
// 	type: "Dog",
// 	sn: "Jensen",
// 	cn: "Babs Jr"
// });

// console.log("Matched? " + matched);

// matched = result.evaluate({
// 	type: "Person",
// 	sn: "Jen",
// 	cn: "Babs J"
// });

// console.log("Matched? " + matched);