A library for compiling and evaluating LDAP style filters in Javascript.

This code was freshly written (May, 19 2012) and is not yet fully tested.
You can see what tests are currently implemented by browsing the test folder.

Big glaring issue: I still need to figure out how to create new instances of Jison parsers...
right now there is one jison generate parser that modifies a few globals... yeah.. you can see where
that is going to cause some nightmares down the road.

Usage
=====

```javascript
var FilterParser = require("DatsDap").FilterParser;
var parser = new FilterParser();

var filter = parser.compile('(&(type=Person)(|(sn=Jensen)(cn=Babs J*)))');
var properties = {
	type: "Person",
	sn: "Jensen",
	cn: "Baby"	
};

if (filter.evaluate(properties)) {
	... play some music ...
}
```

Compiling
=====

The parser is written using jison.
To compile the parser:
```jison FilterParserJison.jison```