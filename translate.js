
var paul = require('paul');

// c/p'd from ../index.js
var voidTags = [
	"!doctype", "area", "base", "br", "col", "command", 
	"embed", "hr", "img", "input", "keygen", "link", 
	"meta", "param", "source", "track", "wbr"];

function serializeAttr(attr, value, isXml) {
	if(!isXml && attr === value) return attr;
	var quote = typeof value === 'string' && ~value.indexOf('"')
		? '"' : "'";
	return attr + '=' + quote + value + quote;
}

// stolen from underscore.string
function dasherize(str) {
	return str.trim()
		.replace(/([A-Z])/g, '-$1')
		.replace(/[-_\s]+/g, '-')
		.toLowerCase();
}

function inlineStyle(style) {
	return Object.keys(style).reduce(function(css, key) {
		return css + '; ' + dasherize(key) + ': '+ style[key];
	}, '').slice(2);
}

var toHTML = function(tree, options) {
	options = options || {};
	var dtype = options.doctype;
	var html = paul.walk(tree, function _html(node, walk) {
		if(node.type === 'Text') return node.content;
		if(node.type === 'Comment') {
			return '<!--' + node.content + '-->';
		}
		var tag = '<' + node.tagName;
		var attrs = node.attributes;
		for(var attr in attrs) {
			if(attrs.hasOwnProperty(attr)) {
				var val = attrs[attr];
				if(attr === 'dataset') {
					for(var prop in val) {
						if(val.hasOwnProperty(prop)) {
							var key = 'data-'+dasherize(prop);
							tag += ' ' + serializeAttr(key, val[prop], dtype === 'xml');
						}
					}
				} else if(attr === 'style') {
					tag += ' ' + serializeAttr(attr, inlineStyle(val));
				} else if(attr === 'className'){
					tag += ' ' + serializeAttr('class', val.join(' '));
				} else {
					tag += ' ' + serializeAttr(dasherize(attr), val, dtype === 'xml');
				}
			}
		}
		
		var lowTagName = node.tagName.toLowerCase();
		if(dtype !== 'xml' && ~voidTags.indexOf(lowTagName)) {
			if(!dtype && lowTagName === '!doctype') {
				dtype = doctypeShortcut(tag);
			}
			return tag + '>';
		}
		tag += '>';
		var innerds = typeof node.content === 'string'
			? node.content
			: walk(node.children || []).join('')
		return tag + innerds + '</'+node.tagName+'>';
	});
	if(html.join) html = html.join('');
	return html;
}

var newline = '\n';
var toJade = function(tree, options) {
	options = options || {};
	var dtype = options.doctype;
	var ident = options.indentation || '  ';
	var multi = multilineText(ident);

	function isWhitespaceNode(node) {
		return !(node.type === 'Text' && !node.content.trim());
	}

	if(tree.filter) tree = tree.filter(isWhitespaceNode);
	var jade = paul.walk(tree, function(node, walk, depth) {
		if(node.type === 'Text') {
			return multi(node.content, depth, '| ');
		}
		if(node.type === 'Comment') {
			var text = node.content;
			return ~text.indexOf(newline)
				? multi('//', depth) + newline + multi(text, depth + 1)
				: multi('//'+text, depth);
		}
		var tag = node.tagName;
		if(node.attributes.id) {
			tag += '#' + node.attributes.id;
		}
		if(node.attributes.className) {
			tag += '.' + node.attributes.className.join('.');
		}
		if(node.tagName === 'div' && tag.length > 3) {
			tag = tag.slice(3);
		}
		tag = multi(tag, depth);
		var attrs = node.attributes;
		var props = Object.keys(attrs).filter(function(key) {
			return key !== 'className' && key !== 'id';
		});
		if(props.length) {
			tag += '(';
			tag += props.map(function(prop) {
				var val = attrs[prop];
				if(prop === 'dataset') {
					return Object.keys(val).map(function(attr) {
						return serializeAttr('data-'+dasherize(attr), val[attr], dtype === 'xml');
					}).join(', ');
				} else if(prop === 'style') {
					return serializeAttr(prop, inlineStyle(val));
				} else {
					return serializeAttr(dasherize(prop), val, dtype === 'xml');
				}
			}).join(', ');
			tag += ')';
		}
		var lowTagName = node.tagName.toLowerCase(); 
		if(~voidTags.indexOf(lowTagName)) {
			if(lowTagName === '!doctype') {
				if(!dtype) dtype = doctypeShortcut(tag);
				return multi('doctype '+dtype, depth);
			}
			return tag;
		} else if(typeof node.content === 'string') {
			if(!node.content) return tag;
			return tag + '.' + newline + multi(node.content, depth + 1);
		} else {
			if(!node.children.length) return tag;
			if(node.children.length === 1 && node.children[0].type === 'Text') {
				var text = node.children[0].content;
				return ~text.indexOf(newline)
					? tag + '.' + newline + multi(text, depth + 1)
					: tag + ' ' + text;
			}
			return tag + newline + 
				walk(node.children.filter(isWhitespaceNode), depth + 1).join(newline);
		}
	}, 0);
	if(jade.join) jade = jade.join(newline);
	return jade;
}

function multilineText(ident) {
	var fmt = !~ident.indexOf('\t')
		? function(line) {return line.replace(/\t/g, ident);}
		: function(line) {return line;};

	function indent(depth, str) {
		while(depth--) {
			str = ident + str;
		}
		return str;
	}

	return function(str, depth, lead) {
		lead = lead || '';
		var lines = str
			.split(newline).map(fmt)
			.filter(function(line) {
				return !!line.trim();
			});

		var start = maxSharedIndent(lines);
		return lines.map(function(line) {
			return indent(depth, lead + line.slice(start));
		}).join(newline);
	}
}

function maxSharedIndent(lines) {
	return lines.reduce(function(num, line) {
		return Math.min(num, line.length - line.trimLeft().length);
	}, Infinity);
}

// see http://jade-lang.com/reference/doctype/
function doctypeShortcut(str) {
	function has(q) {
		return ~str.indexOf(q);
	}

	if(has('Transitional')) return 'transitional';
	if(has('Strict')) return 'strict';
	if(has('Frameset')) return 'frameset';
	if(has('Basic')) return 'basic';
	if(has('1.1')) return '1.1';
	if(has('Mobile')) return 'mobile';
	return 'html';
}

module.exports = {
	toHTML: toHTML,
	toJade: toJade
};
