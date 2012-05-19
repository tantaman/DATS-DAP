/**
* @author Matt Crinklaw-Vogt
*/

var util = require("util");

var whitespaceReg = /\s+/g;

function Stack() {
	this._arr = [];
}

Stack.prototype = {
	push: function(elem) {
		this._arr.push(elem);
		return this;
	},

	pop: function() {
		return this._arr.pop();
	},

	last: function() {
		return this._arr[this._arr.length - 1];
	},

	first: function() {
		return this._arr[0];
	}
};


function ApproxOp() { this.type = "approx"; }
ApproxOp.prototype = {
	evaluate: function(properties) {
		var val = properties[this.attr];
		if (val == null)
			return false;
		
		return properties[this.attr].toLowerCase().replace(whitespaceReg, "") == 
			this.value.toLowerCase().replace(whitespaceReg, ""); // More robust impl?
	}
};

function LteOp() { this.type = "lte"; }
LteOp.prototype = {
	evaluate: function(properties) {
		return properties[this.attr] <= this.value;
	}
};

function GteOp() { this.type = "gte"; }
GteOp.prototype = {
	evaluate: function(properties) {
		return properties[this.attr] >= this.value;
	}
};

function EqualOp(attr, value) { this.type = "equal"; this.attr = attr; this.value = value; }
EqualOp.prototype = {
	evaluate: function(properties) {
		return properties[this.attr] == this.value;
	}
};

var replaceReg = /[*]/g
function SubstrOp(attr, value) {
 	this.type = "substr"; 
 	this.attr = attr; 
 	this.value = value;
 	this.value = this.value.replace(replaceReg, ".*");

 	this.value = new RegExp(this.value);
}

SubstrOp.prototype = {
	evaluate: function(properties) {
		var val = properties[this.attr];
		if (val != null) {
			return this.value.exec(val) != null;
		} else {
			return false;
		}
	}
}

function PresentOp() { this.type = "present"; }
PresentOp.prototype = {
	evaluate: function(properties) {
		// Is a null property a present property?
		return properties[this.attr] !== undefined;
	}
}

function EqualOrSubstrOp() { this.type = "equalOrSubstr"; }
EqualOrSubstrOp.prototype = {
	setValue: function(value) {
		for (var i = 0; i < value.length; ++i) {
			if (value[i] == "*" &&  (i == 0 || value[i-1] != "\\"))
				return new SubstrOp(this.attr, value);
		}

		return new EqualOp(this.attr, value);
	}
};

function FilterList() {
	this.filters = [];
}

FilterList.prototype = {
	push: function(filter) {
		this.filters.push(filter);
	},

	prepend: function(filter) {
		this.filters.unshift(filter);
	}
};

function LogicalAnd() { this.type = "and"; }
LogicalAnd.prototype = {
	evaluate: function(properties) {
		return this.args.filters[0].evaluate(properties) && this.args.filters[1].evaluate(properties);
	}
}

function LogicalOr() { this.type = "or"; }
LogicalOr.prototype = {
	evaluate: function(properties) {
		return this.args.filters[0].evaluate(properties) || this.args.filters[1].evaluate(properties);
	}
};


function LogicalNot() { this.type = "not"; }
LogicalNot.prototype = {
	evaluate: function(properties) {
		return !!!this.args.evaluate(properties);
	}
};

function Filter(comp) {
	this.comp = comp;
}

Filter.prototype = {
	evaluate: function(properties) {
		return this.comp.evaluate(properties);
	}
}

function createOperation(type) {
	switch (type) {
		case "gte":
			return new GteOp();
		case "lte":
			return new LteOp();
		case "approx":
			return new ApproxOp();
		case "present":
			return new PresentOp();
		case "equalOrSubstr":
			return new EqualOrSubstrOp();
		default:
			throw "Unkown operation: " + type;
	}
}

function createFilterList(filter) {
	var f = new FilterList();
	f.push(filter);
	return f;
}

function createFilter(comp) {
	return new Filter(comp);
}

function createLogical(type) {
	switch (type) {
		case "not":
			return new LogicalNot();
		case "or":
			return new LogicalOr();
		case "and":
			return new LogicalAnd();
		default:
			throw "Unkown logical: " + type;
	}
}

// TODO: we need to make jison return stuff... instead of registering crap into globals...
var resultHolder = {};

function complete(filter) {
	resultHolder.result = filter;
}

exports.createOperation = createOperation;
exports.createFilterList = createFilterList;
exports.createLogical = createLogical;
exports.createFilter = createFilter;
exports.complete = complete;
exports.resultHolder = resultHolder;