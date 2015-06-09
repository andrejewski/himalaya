
var himalaya = require('..');
var translations = require('../translate');
var toHTML = translations.toHTML;
var toJade = translations.toJade;
var assert = require('assert');

describe('translations', function() {
	describe('toHTML(ast) html', function() {
		it('should handle simple conversions', function() {
			var str1 = '<h1>Text</h1>';
			assert.equal(toHTML(himalaya.parse(str1)), str1);

			var str2 = 'Text';
			assert.equal(toHTML(himalaya.parse(str2)), str2);

			var str3 = '<!--Comment-->';
			assert.equal(toHTML(himalaya.parse(str3)), str3);
		});

		it('should work for void elements', function() {
			var meta = "<meta charset='utf8'>";
			assert.equal(toHTML(himalaya.parse(meta)), meta);
		
			var link = "<link rel='stylesheet' href='file.css'>";
			assert.equal(toHTML(himalaya.parse(link)), link);
		});

		it('should build data-* attributes properly', function() {
			var elem = "<div data-one='5' data-two='five'></div>";
			assert.equal(toHTML(himalaya.parse(elem)), elem);
		});

		it('should build the style attribute properly', function() {
			var elem = "<div style='color: #fff; font-size: 12px'></div>";
			assert.equal(toHTML(himalaya.parse(elem)), elem);
		});

		it('should preserve whitespace', function() {
			var html = [
				"<html>    ",
				"    <h1>    Document    </h1>",
				"</html>   "
			].join('\n');
			assert.equal(toHTML(himalaya.parse(html)), html);
		});

		it('should close void tags when doctype is xml', function() {
			var html = "<img src='bar.png'>";
			var xml  = "<img src='bar.png'></img>";
			var jsonHTML = himalaya.parse(html);
			var jsonXML = himalaya.parse(xml);

			assert.equal(toHTML(jsonHTML), html);
			assert.equal(toHTML(jsonHTML, {doctype: 'xml'}), xml);

			assert.equal(toHTML(jsonXML), html);
			assert.equal(toHTML(jsonXML, {doctype: 'xml'}), xml);
		});

		it('should write out boolean attributes when doctype is xml', function() {
			var html = "<script src='bar.js' async></script>";
			var xml  = "<script src='bar.js' async='async'></script>";
			var jsonHTML = himalaya.parse(html);
			var jsonXML = himalaya.parse(xml);

			assert.equal(toHTML(jsonHTML), html);
			assert.equal(toHTML(jsonHTML, {doctype: 'xml'}), xml);

			assert.equal(toHTML(jsonXML), html);
			assert.equal(toHTML(jsonXML, {doctype: 'xml'}), xml);
		});
	});

	describe('toJade(ast, options) jade', function() {
		it('should handle plain text', function() {
			var html = 'This is text.';
			var jade = '| This is text.';
			assert.equal(toJade(himalaya.parse(html)), jade);
		});
		it('should handle multi-line plain text', function() {
			var html = 'This is multiline text.\nLook newlines.';
			var jade = '| This is multiline text.\n| Look newlines.';
			assert.equal(toJade(himalaya.parse(html)), jade);
		});
		it('should handle inline comments', function() {
			var html = '<!-- Comment -->';
			var jade = '// Comment ';
			assert.equal(toJade(himalaya.parse(html)), jade);
		});
		it('should handle multi-line comments', function() {
			var html = [
				"<!--",
				"  This is a multiline comment.",
				"  Look newlines.",
				"-->"
			].join('\n');
			var jade = [
				"//",
				"  This is a multiline comment.",
				"  Look newlines."
			].join('\n');
			assert.equal(toJade(himalaya.parse(html)), jade);
		});
		it('should write short-hand tag ids', function() {
			var html = "<article id='story'></article>";
			var jade = "article#story";
			assert.equal(toJade(himalaya.parse(html)), jade);
		});
		it('should write short-hand tag classes', function() {
			var html = "<article class='story story--main'></article>";
			var jade = "article.story.story--main";
			assert.equal(toJade(himalaya.parse(html)), jade);
		});
		it('should ignore `div` if an id or class(es) are provided', function() {
			var htmlId = "<div id='block'></div>";
			var	jadeId = "#block";
			assert.equal(toJade(himalaya.parse(htmlId)), jadeId);

			var htmlClass = "<div class='block'></div>";
			var jadeClass = ".block";
			assert.equal(toJade(himalaya.parse(htmlClass)), jadeClass);

			var htmlClasses = "<div class='block block--jumbo'></div>";
			var jadeClasses = ".block.block--jumbo";
			assert.equal(toJade(himalaya.parse(htmlClasses)), jadeClasses);
		});
		it('should write attributes', function() {
			var html = "<canvas width='500' height='400'></canvas>";
			var jade = "canvas(width='500', height='400')";
			assert.equal(toJade(himalaya.parse(html)), jade);
		});
		it('should write data-* attributes', function() {
			var html = "<div data-one='5' data-two='five'></div>";
			var jade = "div(data-one='5', data-two='five')";
			assert.equal(toJade(himalaya.parse(html)), jade);
		});
		it('should write the style attribute', function() {
			var html = "<b style='font-weight: bold; font-style: italics'>Word</b>";
			var jade = "b(style='font-weight: bold; font-style: italics') Word";
			assert.equal(toJade(himalaya.parse(html)), jade);
		});
		it('should appropriate place tag inner text', function() {
			var htmlInline = "<h1>Hello</h1>";
			var jadeInline = "h1 Hello";
			assert.equal(toJade(himalaya.parse(htmlInline)), jadeInline);

			var htmlMultiline = "<h1>Hello\nWorld</h1>";
			var jadeMultiline = "h1.\n  Hello\n  World";
			assert.equal(toJade(himalaya.parse(htmlMultiline)), jadeMultiline);
		});
		it('should work for script and style tags', function() {
			var htmlScript = "<script type='text/javascript'>console.log('yes');</script>";
			var jadeScript = "script(type='text/javascript').\n  console.log('yes');";
			assert.equal(toJade(himalaya.parse(htmlScript)), jadeScript);

			var htmlStyle = "<style>h1 {color: #fff;} .text {font-size: 12px;}</style>";
			var jadeStyle = "style.\n  h1 {color: #fff;} .text {font-size: 12px;}";
			assert.equal(toJade(himalaya.parse(htmlStyle)), jadeStyle);
		});
	});
});
