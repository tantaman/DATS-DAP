/**
* @author Matt Crinklaw-Vogt (tantaman)
* Tests RFC 1960 LDAP search string parsing and evaluation
*/

/*
(cn=Babs Jensen)
(!(cn=Tim Howes))
(&(" + Constants.OBJECTCLASS + "=Person)(|(sn=Jensen)(cn=Babs J*)))
(o=univ*of*mich*)
*/

var vows = require("vows"),
assert = require("assert"),
FilterParser = require("../DatsDap").FilterParser;

var tests = vows.describe("ServiceRegistry").addBatch({
	"comparison operators": {
		topic: new FilterParser(),

		"equality": function(parser) {
			var testString = "(cn=Hello there)";
			var filter = parser.compile(testString);

			var testMap = {
				cn: "Hello there"
			};

			var result = filter.evaluate(testMap);
			assert.isTrue(result);

			testMap = {
				cn: "Goodbye there"
			};

			result = filter.evaluate(testMap);
			assert.isFalse(result);

			testString = "(a=1)";
			testMap = {
				a: 1
			};

			filter = parser.compile(testString);
			result = filter.evaluate(testMap);
			assert.isTrue(result);

			testMap = {
				a: 10
			};

			result = filter.evaluate(testMap);
			assert.isFalse(result);
		},

		"approx": function(parser) {
			var testString = "(a~=WeAreWonDerFul)";
			var filter = parser.compile(testString);

			var testMap = {
				a: "We are wonderful"
			};

			var result = filter.evaluate(testMap);
			assert.isTrue(result);

			testMap = {
				a: "wearewonderful"
			};

			result = filter.evaluate(testMap);
			assert.isTrue(result);

			testMap = {
				a: "wearewonderfu"
			};

			result = filter.evaluate(testMap);
			assert.isFalse(result);
		},

		"exists": function(parser) {
			var testString = "(a=*)";
			var filter = parser.compile(testString);

			var testMap = {
				a: "present"
			};

			var result = filter.evaluate(testMap);
			assert.isTrue(result);

			testMap = {
				b: "present"
			};

			result = filter.evaluate(testMap);
			assert.isFalse(result);

			testMap = {
				a: 1
			};

			result = filter.evaluate(testMap);
			assert.isTrue(result);
		},

		"less than or equal to": function(parser) {
			var string = "(a<=5)";
			var filter = parser.compile(string);

			var map = {
				a: 4
			};

			var result = filter.evaluate(map);
			assert.isTrue(result);

			map = {
				a: 5
			};
			result = filter.evaluate(map);
			assert.isTrue(result);

			map = {
				a: 6
			};
			result = filter.evaluate(map);
			assert.isFalse(result);

			string = "(a<=f)";
			filter = parser.compile(string);
			map = {
				a: "a"
			};

			result = filter.evaluate(map);
			assert.isTrue(result);

			map = {
				a: "f"
			};
			result = filter.evaluate(map);
			assert.isTrue(result);

			map = {
				a: "g"
			};
			result = filter.evaluate(map);
			assert.isFalse(result);
		},

		"greater than or equal to": function(parser) {
			var string = "(a>=0)";
			var filter = parser.compile(string);

			var map = {
				a: -1
			};
			var result = filter.evaluate(map);
			assert.isFalse(result);

			map = {
				a: 0
			};
			result = filter.evaluate(map);
			assert.isTrue(result);

			map = {
				a: 1
			};
			result = filter.evaluate(map);
			assert.isTrue(result);

			string = "(a>=b)";
			filter = parser.compile(string);

			map = {
				a: "a"
			};
			result = filter.evaluate(map);
			assert.isFalse(result);

			map = {
				a: "b"
			};
			result = filter.evaluate(map);
			assert.isTrue(result);

			map = {
				a: "c"
			};
			result = filter.evaluate(map);
			assert.isTrue(result);
		},

		"is a substring": function(parser) {
			var string = "(a=some*)";
			var filter = parser.compile(string);

			var map = {
				a: "something"
			};
			result = filter.evaluate(map);
			assert.isTrue(result);

			string = "(o=the*movie*is*)";
			filter = parser.compile(string);
			map = {
				o: "the best movie ever is conan the barbarian \\(Arnold version\\)"
			}
			result = filter.evaluate(map);
			assert.isTrue(result);
		}
	},

	"logical operators": {
		topic: new FilterParser(),
		"not": function(parser) {
			var string = "(!(a=jacob))";
			var filter = parser.compile(string);

			var map = {
				a: "jacob"
			};
			var result = filter.evaluate(map);
			assert.isFalse(result);

			map = {
				a: "jack"
			};
			result = filter.evaluate(map);
			assert.isTrue(result);
		},

		"and": function(parser) {
			var string = "(&(a=jack)(b=sawyer))";
			var filter = parser.compile(string);

			var plane = {
				a: "jack",
				b: "sawyer",
				c: "kate"
			};
			var result = filter.evaluate(plane);
			assert.isTrue(result);

			plane = {
				a: "rose",
				b: "bernard"
			};
			result = filter.evaluate(plane);
			assert.isFalse(result);
		},

		"or": function(parser) {
			var string = "(|(a=locke)(b=flocke))";
			var filter = parser.compile(string);

			var map = {
				a: "flocke",
				b: "flocke"
			};
			var result = filter.evaluate(map);
			assert.isTrue(result);

			map = {
				a: "locke",
				b: "mystery matt"
			};
			result = filter.evaluate(map);
			assert.isTrue(result);

			map = {
				a: "echo",
				b: "desmond"
			};
			result = filter.evaluate(map);
			assert.isFalse(result);
		}
	},

	"nested logic": {
		topic: new FilterParser(),
		"omgnuts": function() {

		}
	},

	"attributes can have a variety of characters": {

	},

	"values can too": {

	},

	"alltogethernow": {

	}
}).run();