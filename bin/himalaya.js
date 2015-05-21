#!/usr/bin/env node

function help() {
/*	
    Usage: himalaya src [dest]
    
    src: HTML file
    dest: (optional) JSON file destination

    --help, -h: displays this
    --version, -v: prints himalaya's version

    if dest is not provided, himalaya prints to stdout
*/
}

var fs = require('fs');
var path = require('path');
var himalaya = require('..');

var args = process.argv.slice(2);
var root = process.cwd();

var flag = args[0].toLowerCase();

if(flag === '-h' || flag === '--help') {
	var h = help.toString();
	var msg = h.substring(h.indexOf('*') + 2, h.lastIndexOf('*'));
	return console.log(msg);
}

if(flag === '-v' || flag === '--version') {
	var pkg = require('../package.json');
	return console.log(pkg.version);
}

var src  = path.join(root, args[0]);
var dest = args[1] 
	? path.join(root, args[1])
	: null;

var text = fs.readFileSync(src);
var data = himalaya.parse(text);
var cout = JSON.stringify(data, null, 2);

if(dest) {
	fs.writeFileSync(dest, cout);
} else {
	console.log(cout);
}
