A library for compiling and evaluating LDAP style filters in Javascript.

This code was freshly written (May 19 2012) and is not yet fully tested.
You can see what tests are currently implemented by browsing the test folder.

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
	
}
```

Compiling
=====

The parser is written using jison.
To compile the parser:
```jison FilterParserJison.jison```