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
				cn: ["Hello", "Hello there"]
			};

			var result = filter.matches(testMap);
			assert.isTrue(result);

			testMap = {
				cn: "Goodbye there"
			};

			result = filter.matches(testMap);
			assert.isFalse(result);

			testString = "(a=1)";
			testMap = {
				a: 1
			};

			filter = parser.compile(testString);
			result = filter.matches(testMap);
			assert.isTrue(result);

			testMap = {
				a: 10
			};

			result = filter.matches(testMap);
			assert.isFalse(result);
		},

		"approx": function(parser) {
			var testString = "(a~=WeAreWonDerFul)";
			var filter = parser.compile(testString);

			var testMap = {
				a: "We are wonderful"
			};

			var result = filter.matches(testMap);
			assert.isTrue(result);

			testMap = {
				a: "wearewonderful"
			};

			result = filter.matches(testMap);
			assert.isTrue(result);

			testMap = {
				a: "wearewonderfu"
			};

			result = filter.matches(testMap);
			assert.isFalse(result);
		},

		"exists": function(parser) {
			var testString = "(a=*)";
			var filter = parser.compile(testString);

			var testMap = {
				a: "present"
			};

			var result = filter.matches(testMap);
			assert.isTrue(result);

			testMap = {
				b: "present"
			};

			result = filter.matches(testMap);
			assert.isFalse(result);

			testMap = {
				a: 1
			};

			result = filter.matches(testMap);
			assert.isTrue(result);
		},

		"less than or equal to": function(parser) {
			var string = "(a<=5)";
			var filter = parser.compile(string);

			var map = {
				a: 4
			};

			var result = filter.matches(map);
			assert.isTrue(result);

			map = {
				a: 5
			};
			result = filter.matches(map);
			assert.isTrue(result);

			map = {
				a: 6
			};
			result = filter.matches(map);
			assert.isFalse(result);

			string = "(a<=f)";
			filter = parser.compile(string);
			map = {
				a: "a"
			};

			result = filter.matches(map);
			assert.isTrue(result);

			map = {
				a: "f"
			};
			result = filter.matches(map);
			assert.isTrue(result);

			map = {
				a: "g"
			};
			result = filter.matches(map);
			assert.isFalse(result);
		},

		"greater than or equal to": function(parser) {
			var string = "(a>=0)";
			var filter = parser.compile(string);

			var map = {
				a: -1
			};
			var result = filter.matches(map);
			assert.isFalse(result);

			map = {
				a: 0
			};
			result = filter.matches(map);
			assert.isTrue(result);

			map = {
				a: 1
			};
			result = filter.matches(map);
			assert.isTrue(result);

			string = "(a>=b)";
			filter = parser.compile(string);

			map = {
				a: "a"
			};
			result = filter.matches(map);
			assert.isFalse(result);

			map = {
				a: "b"
			};
			result = filter.matches(map);
			assert.isTrue(result);

			map = {
				a: "c"
			};
			result = filter.matches(map);
			assert.isTrue(result);
		},

		"is a substring": function(parser) {
			var string = "(a=some*)";
			var filter = parser.compile(string);

			var map = {
				a: "something"
			};
			result = filter.matches(map);
			assert.isTrue(result);

			string = "(o=the*movie*is*)";
			filter = parser.compile(string);
			map = {
				o: "the best movie ever is conan the barbarian \\(Arnold version\\)"
			}
			result = filter.matches(map);
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
			var result = filter.matches(map);
			assert.isFalse(result);

			map = {
				a: "jack"
			};
			result = filter.matches(map);
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
			var result = filter.matches(plane);
			assert.isTrue(result);

			plane = {
				a: "rose",
				b: "bernard"
			};
			result = filter.matches(plane);
			assert.isFalse(result);
		},

		"or": function(parser) {
			var string = "(|(a=locke)(b=flocke))";
			var filter = parser.compile(string);

			var map = {
				a: "flocke",
				b: "flocke"
			};
			var result = filter.matches(map);
			assert.isTrue(result);

			map = {
				a: "locke",
				b: "mystery matt"
			};
			result = filter.matches(map);
			assert.isTrue(result);

			map = {
				a: "echo",
				b: "desmond"
			};
			result = filter.matches(map);
			assert.isFalse(result);
		}
	},

	"nested logic": {
		topic: new FilterParser(),
		"two levels of ands and ors": function(parser) {
			var string = "(&(a=1)(|(b=2)(c=3)))";
			var filter = parser.compile(string);

			var map = {
				a: 1,
				b: 2,
				c: 5
			};
			var result = filter.matches(map);
			assert.isTrue(result);

			map.b = 3;
			result = filter.matches(map);
			assert.isFalse(result);

			map.c = 3;
			result = filter.matches(map);
			assert.isTrue(result);

			map.a = 2;
			result = filter.matches(map);
			assert.isFalse(result);

			string = "(|(&(a=1)(b=2))(c=3))";
			filter = parser.compile(string);

			map = { a: 1, b: 2, c: 3 };
			result = filter.matches(map);
			assert.isTrue(result);

			map.a = 2;
			result = filter.matches(map);
			assert.isTrue(result);

			map.c = 4;
			result = filter.matches(map);
			assert.isFalse(result);

			map.a = 1;
			result = filter.matches(map);
			assert.isTrue(result);

			map.b = 3;
			result = filter.matches(map);
			assert.isFalse(result);
		},

		"two levels of ands, ors, nots": function(parser) {
			var string = "(&(!(a=james*))(|(b=jerome)(c=3)))";
			var filter = parser.compile(string);

			var map = {
				a: "james",
				b: "jerome",
				c: 3
			};
			var result = filter.matches(map);
			assert.isFalse(result);

			
		},

		"arbitrary levels of ands, ors, nots": function() {
			
		}
	},

	"attributes can have a variety of characters": {

	},

	"values can too": {

	},

	"arrays work for attribute values": {

	},

	"some object work for attribute values": {

	},

	"alltogethernow": {

	}
}).run();