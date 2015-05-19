
var tagStart = '<';
var tagEnd = '>';

var commentStart = '<!--';
var commentEnd = '-->';

var voidTags = [
	"!doctype", "area", "base", "br", "col", "command", 
	"embed", "hr", "img", "input", "keygen", "link", 
	"meta", "param", "source", "track", "wbr"];
var closingTags = [
	"colgroup", "dd", "dt", "li", "options", "p", 
	"td", "tfoot", "th", "thead", "tr"];
var childlessTags = ['style', 'script', 'template'];

function parse(str) {
	return parseUntil(str+'</root>', ['root']).nodes;
}

function Node(kind, data) {
	data.type = kind;
	return data;
}

function parseUntil(str, stack) {
	var nodes = [];

	while(str.length) {
		var nextTag = str.indexOf(tagStart);
		if(!~nextTag) {
			// only text left
			nodes.push(Node('Text', {content: str}));
			str = "";
		} else if(nextTag) {
			// text before tag
			nodes.push(Node('Text', {
				content: str.slice(0, nextTag)
			}));
			str = str.slice(nextTag);
		} else {
			if(startsWithCommentStart(str)) {
				// comment
				var end = str.indexOf(commentEnd);
				nodes.push(Node('Comment', {
					content: str.slice(commentStart.length, end)
				}));
				str = str.slice(end + commentEnd.length);
			} else if(str.charAt(nextTag + 1) !== '/') {
				// open tag
				var results = parseTag(str, stack);
				if(results.tag) {
					nodes.push(Node('Element', results.tag));
					str = results.str;
				}
				if(results.stack.length !== stack.length) {
					stack = results.stack;
					break;
				}
			} else {
				// close tag
				var endTagEnd = str.indexOf(tagEnd);
				var tagName = str.slice(2, endTagEnd)
					.trim().split(' ')[0];
				str = str.slice(endTagEnd + 1);
				var loc = stack.lastIndexOf(tagName);
				if(~loc) {
					stack = stack.slice(0, loc);
					break;
				}
			}
		}
	}

	return {nodes: nodes, stack: stack, str: str};
}

function parseTag(str, stack) {
	var idxTagEnd = str.indexOf(tagEnd);
	var idxSpace = str.indexOf(' ');
	var tagNameEnd = ~idxSpace 
		? Math.min(idxTagEnd, idxSpace)
		: idxTagEnd;
	var tagName = str.slice(1, tagNameEnd);
	var lowTagName = tagName.toLowerCase();

	if(stack[stack.length - 1] === tagName && ~closingTags.indexOf(lowTagName)) {
		return {stack: stack.slice(0, -1)};
	}

	var attrs = parseAttrs(str.slice(tagNameEnd));
	var tag = {
		tagName: tagName,
		attributes: attrs.attributes
	};
	str = attrs.str;

	if(startsWithSelfClose(str)) {
		str = str.slice(2);
	} else {
		str = str.slice(1);
		
		if(~childlessTags.indexOf(lowTagName)) {
			var end = '</'+tagName+'>';
			var idx = str.indexOf(end);
			if(!~idx) idx = Infinity;
			tag.content = str.slice(0, idx);
			str = str.slice(idx);
		} else if(!~voidTags.indexOf(lowTagName)) {
			var results = parseUntil(str, stack.concat(tagName));
			tag.children = results.nodes;
			str = results.str;
			stack = results.stack;
		}
	}

	return {tag: tag, str: str, stack: stack};
}

function parseAttrs(str) {
	var results = tagPairs(str.trim());
	var str = results.str;
	var attributes = results.kvs.map(function(pair) {
		var kv = splitHead(pair.trim(), '=');
		kv[1] = kv[1] ? unquote(kv[1]) : kv[0];
		return kv;
	}).reduce(function(attrs, kv) {
		var property = kv[0];
		var value = kv[1];
		if(property === 'class') {
			attrs.className = value.split(' ');
		} else if(property === 'style') {
			attrs.style = parseStyle(value);
		} else if (startsWithDataDash(property)) {
			attrs.dataset = attrs.dataset || {};
			var key = camelCase(property.slice(5));
			attrs.dataset[key] = castValue(value);
		} else {
			attrs[camelCase(property)] = castValue(value);
		}
		return attrs;
	}, {});
	return {str: str, attributes: attributes};
}

function splitHead(str, sep) {
	var idx = str.indexOf(sep);
	if(!~idx) return [str];
	return [str.slice(0, idx), str.slice(idx + sep.length)];
}

function tagPairs(str) {
	var parts = [];
	var start = 0;
	var finish = 0;
	var quote = null;
	for(var i = start; i < str.length; i++) {
		var c = str.charAt(i);
		if(!quote && (c === '/' || c === tagEnd)) {
			if(start !== i) parts.push(str.slice(start, i));
			finish = i;
			break;
		} else if(c === ' ' && !quote) {
			parts.push(str.slice(start, i));
			start = i + 1;
		} else if(c === quote) {
			quote = null;
		} else if(!quote && (c === '"' || c === "'")) {
			quote = c;
		}
	}
	return {kvs: parts, str: str.slice(finish)};
}

function unquote(str) {
	var car = str.charAt(0);
	var end = str.length - 1;
	if(car === '"' || car === "'" && car === str.charAt(end)) {
		return str.slice(1, end);
	}
	return str;
}

function parseStyle(str) {
	return str.trim().split(';').map(function(statement) {
		return statement.trim().split(':');
	}).reduce(function(styles, kv) {
		if(kv[1]) styles[camelCase(kv[0].trim())] = castValue(kv[1].trim());
		return styles;
	}, {});
}

function camelCase(str) {
	return str.split('-').reduce(function(str, word) {
		return str + word.charAt(0).toUpperCase() + word.slice(1);
	});
}

function castValue(str) {
	if(typeof str !== 'string') return str;
	var num = +str;
	if(!isNaN(num)) return num;
	return str;
}

function startsWithCommentStart(s) {
	return (
		s.charAt(0) === '<' &&
		s.charAt(1) === '!' &&
		s.charAt(2) === '-' &&
		s.charAt(3) === '-');
}

function startsWithSelfClose(s) {
	return (
		s.charAt(0) === '/' &&
		s.charAt(1) === '>');
}

function startsWithDataDash(s) {
	return (
		s.charAt(0) === 'd' &&
		s.charAt(1) === 'a' &&
		s.charAt(2) === 't' &&
		s.charAt(3) === 'a' &&
		s.charAt(4) === '-');
}

module.exports = {
	parse: parse,
	parseTag: parseTag,
	parseUntil: parseUntil,
	parseAttrs: parseAttrs,
	parseStyle: parseStyle,
}
