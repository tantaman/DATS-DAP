/**
* @author Matt Crinklaw-Vogt
*/

var util = require("util");

var whitespaceReg = /\s+/g;

function AbstractOp() {}
AbstractOp.prototype = {
	matches: function(properties) {
		var propertyValue = properties[this.attr];
		if (propertyValue instanceof Array) {
			for (var i = 0; i < propertyValue.length; ++i) {
				if (this.__match(propertyValue[i]))
					return true;
			}
		} else {
			if (propertyValue instanceof Object) {
				var constructor = propertyValue.constructor;
				if (constructor.length === 1 && constructor.name !== "Object") {
					if (typeof propertyValue.compareTo === "function") {
						var myValue = new constructor(this.value);
						return propertyValue.compareTo(myValue) === 0;
					} else if (typeof propertyValue.equals === "function") {
						var myValue = new constructor(this.value);
						return propertyValue.equals(myValue);
					}
				}
			} else {
				return this.__match(propertyValue);
			}
		}

		return false;
	},

	canCompare: function(obj) {
		return typeof obj.equals === "function" || typeof obj.compareTo === "function";
	}
};

function ApproxOp() { this.type = "approx"; }
ApproxOp.prototype = Object.create(AbstractOp.prototype);
ApproxOp.prototype.__match = function(val) {
	if (val == null)
		return false;

	return val.toLowerCase().replace(whitespaceReg, "") == 
		this.value.toLowerCase().replace(whitespaceReg, ""); // More robust impl?
};

function LteOp() { this.type = "lte"; }
LteOp.prototype = Object.create(AbstractOp.prototype);
LteOp.prototype.__match = function(val) {
	return val <= this.value;
}

function GteOp() { this.type = "gte"; }
GteOp.prototype = Object.create(AbstractOp.prototype);
GteOp.prototype.__match = function(val) {
	return val >= this.value;
}

function EqualOp(attr, value) { this.type = "equal"; this.attr = attr; this.value = value; }
EqualOp.prototype = Object.create(AbstractOp.prototype);
EqualOp.prototype.__match = function(val) {
	return val == this.value;
}

var replaceReg = /[*]/g
function SubstrOp(attr, value) {
 	this.type = "substr"; 
 	this.attr = attr; 
 	this.value = value;
 	this.value = this.value.replace(replaceReg, ".*");

 	this.value = new RegExp(this.value);
}

SubstrOp.prototype = Object.create(AbstractOp.prototype);
SubstrOp.prototype.__match = function(val) {
	if (val != null) {
		return this.value.exec(val) != null;
	} else {
		return false;
	}
}

function PresentOp() { this.type = "present"; }
PresentOp.prototype = {
	matches: function(properties) {
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
	matches: function(properties) {
		return this.args.filters[0].matches(properties) && this.args.filters[1].matches(properties);
	}
}

function LogicalOr() { this.type = "or"; }
LogicalOr.prototype = {
	matches: function(properties) {
		return this.args.filters[0].matches(properties) || this.args.filters[1].matches(properties);
	}
};


function LogicalNot() { this.type = "not"; }
LogicalNot.prototype = {
	matches: function(properties) {
		return !!!this.args.matches(properties);
	}
};

function Filter(comp) {
	this.comp = comp;
}

Filter.prototype = {
	matches: function(properties) {
		return this.comp.matches(properties);
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
	//return new Filter(comp);
	return comp;
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