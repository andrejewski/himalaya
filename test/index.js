
var h = require('../');
var assert = require('assert');

function print(s) {
	console.log(JSON.stringify(s, null, 2));
}

// README demo
// print(h.parse(["<div class='post post-featured'><p>Himalaya parsed me...</p><!-- ...and I liked it. --></div>"]));
// return;

describe('html-parser', function() {

	describe('parse(String) Object', function() {
		it('should return the AST of given HTML', function() {
			var h1 = "<html><h1>Hello, World</h1></html>";
			var d1 = [{
				type: 'Element',
				tagName: 'html',
				attributes: {},
				children: [{
					type: 'Element',
					tagName: 'h1',
					attributes: {},
					children: [{
						type: 'Text',
						content: 'Hello, World'
					}]
				}]
			}];
			assert.deepEqual(d1, h.parse(h1));

			var h2 = "<div class='section widget'><b disabled>Poop</b><p>Pee</p></div>";
			var d2 = [{
				type: 'Element',
				tagName: 'div',
				attributes: {
					className: ['section', 'widget']
				},
				children: [{
					type: 'Element',
					tagName: 'b',
					attributes: {
						disabled: 'disabled'
					},
					children: [{
						type: 'Text',
						content: 'Poop'
					}]
				}, {
					type: 'Element',
					tagName: 'p',
					attributes: {},
					children: [{
						type: 'Text',
						content: 'Pee'
					}]
				}]
			}];
			assert.deepEqual(d2, h.parse(h2));

			var h3 = "<b><!--comment text-->words</b>";
			var d3 = [{
				type: 'Element',
				tagName: 'b',
				attributes: {},
				children: [{
					type: 'Comment',
					content: 'comment text'
				}, {
					type: 'Text',
					content: 'words'
				}]
			}];
			assert.deepEqual(d3, h.parse(h3));

			var h4 = "<div style='width: 360px; height: 120px; background-color: #fff'></div>";
			var d4 = [{
				type: 'Element',
				tagName: 'div',
				attributes: {
					style: {
						width: '360px',
						height: '120px',
						backgroundColor: '#fff'
					}
				},
				children: []
			}];
			assert.deepEqual(d4, h.parse(h4));

			var h5 = "<div data-num=0 data-word='poop' data-cake='2'></div>";
			var d5 = [{
				type: 'Element',
				tagName: 'div',
				attributes: {
					dataset: {
						num: 0,
						word: 'poop',
						cake: 2
					}
				},
				children: []
			}];
			assert.deepEqual(d5, h.parse(h5));

			var h6 = "<p>One two<p>three four";
			var d6 = [{
				type: 'Element',
				tagName: 'p',
				attributes: {},
				children: [{
					type: 'Text',
					content: 'One two'
				}]
			}, {
				type: 'Element',
				tagName: 'p',
				attributes: {},
				children: [{
					type: 'Text',
					content: 'three four'
				}]
			}];
			assert.deepEqual(d6, h.parse(h6));
		});
	});

	describe('parseTag(String, Array[String]) Object', function() {
		describe('return {stack: Array[Name]}', function() {
			it('should be the given stack for void elements', function() {
				var text = '<meta charset="utf8">';
				var s1 = [];
				var s2 = ['root'];
				assert.deepEqual(s1, h.parseTag(text, s1).stack);
				assert.deepEqual(s2, h.parseTag(text, s2).stack);
			});
			it('should be the given stack for childless elements', function() {
				var text = '<script type="text/javascript">kill(9);</script>';
				var s1 = [];
				var s2 = ['root'];
				assert.deepEqual(s1, h.parseTag(text, s1).stack);
				assert.deepEqual(s2, h.parseTag(text, s2).stack);
			});
			it('should be the correct stack for nested elements', function() {
				var text = '<p>Peanuts</div>';
				var s1 = ['root', 'div'];
				var s2 = ['div', 'span'];
				var s3 = ['div', 'div', 'table'];

				function x(s) {
					return h.parseTag(text, s.concat('div')).stack;
				}

				assert.deepEqual(s1, x(s1));
				assert.deepEqual(s2, x(s2));
				assert.deepEqual(s3, x(s3));
			});
		});
		describe('return {tag: Object}', function() {
			it('should have the correct `tagName` property', function() {
				var text1 = '<p>Words and letters</p>';
				var name1 = h.parseTag(text1, []).tag.tagName;
				assert.equal('p', name1);

				var text2 = '<ng-element>Words and letters</ng-element>';
				var name2 = h.parseTag(text2, []).tag.tagName;
				assert.equal('ng-element', name2);
			});
		});

	});

	describe('parseAttrs(String) Object', function() {
		it('should return {str:String} starting at the end of attributes', function() {
			var text1 = ' data-attr=0 type="text" disabled />...';
			var results = h.parseAttrs(text1);
			assert.equal('/>...', results.str);

			var text2 = '    />...';
			var results = h.parseAttrs(text2);
			assert.equal('/>...', results.str);

			var text3 = ' data-attr=0 type="text" disabled >...';
			var results = h.parseAttrs(text3);
			assert.equal('>...', results.str);

			var text4 = '    >...';
			var results = h.parseAttrs(text4);
			assert.equal('>...', results.str);
		});
		describe('return {attributes:Object}', function() {
			it('should have all attributes', function() {
				var text = ' data-attr=0 type="text" disabled >...'
				var data = {
					dataset: {attr: 0},
					type: 'text',
					disabled: 'disabled'
				};
				assert.deepEqual(data, h.parseAttrs(text).attributes);
			});
			it('should group all data-* in the `dataset` Object', function() {
				var text = ' data-attr=0 data-name="Chris" type="text" disabled >...';
				var data = h.parseAttrs(text).attributes;
				assert.equal(0, data.dataset.attr);
				assert.equal('Chris', data.dataset.name);
				assert(!data.dataset.type);
				assert(!data.dataset.disabled);
			});
			it('should put parsed styles in the `style` attribute', function() {
				var text = 'style="width: 20px; height: 40px; font-size: 12px" >';
				var data = {
					style: {
						width: '20px',
						height: '40px',
						fontSize: '12px'
					}
				};
				assert.deepEqual(data, h.parseAttrs(text).attributes);
			});
		});
	});

	describe('parseStyle(String) Object', function() {
		it('should return an hashmap of style declarations', function() {
			var style = 'color: #000; height: 80px';
			var data = {
				color: '#000',
				height: '80px'
			};
			assert.deepEqual(data, h.parseStyle(style));
		});
		it('should camelCase CSS properties', function() {
			var style = [
				'background-color: #fff',
				'border-right: 1px solid #000',
				'border-top-left-radius: 4px'
			].join(';');
			var data = {
				backgroundColor: '#fff',
				borderRight: '1px solid #000',
				borderTopLeftRadius: '4px'
			};
			assert.deepEqual(data, h.parseStyle(style));
		});
	});
});
