A library for compiling and evaluating LDAP style filters in Javascript.

Big glaring issue: I still need to figure out how to create new instances of Jison parsers...
right now there is one jison generated parser that modifies a few globals...  You can see where
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

if (filter.matches(properties)) {
	... play some music ...
}
```

Compiling
=====

The parser is written using jison.
To compile the parser:
```jison FilterParserJison.jison```