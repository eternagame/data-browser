/* svg.js 
 
 * Copyright (C) 2015 Eterna Commons at Stanford University
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD-3-Clause license.  See the LICENSE.md file for details.
 */

/* Simple Testing/Usage Code:
 * var myObj = new SVG(document.getElementById("test"), 500, 500); // new object instance
 * myObj.line(0, 10, 50, 100, [180, 50, 10]);
 * myObj.finish();
*/


// Converts a single R,G,B color component to a hex value, including 0 padding.
function componentToHex (c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

// Converts a color object (whether tupule-like, or string) to a SVG readable color string
function convertColor(color) {
    if ( typeof color == 'string' ) {
        return color;
    } else {
        return "#" + componentToHex(color[0]) + componentToHex(color[1]) + componentToHex(color[2]);
    }
};

// Escapes a HTML string for use in SVG. Focuses on only a few main characters.
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function SVG (outputField, width, height) {
    this.outputField = outputField;
    this.writeBuffer = "";
    this.circlecount = 0;

    this.write = function(str) {
        this.writeBuffer += str;
    };

    this.write('<?xml version="1.0" encoding="utf-8"?>\n  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"\n  x="0px" y="0px"\n  width="' + width + 'px" height="' + height + 'px"\n  viewBox="0 0 ' + width + ' ' + height + '"\n  enable-background="new 0 0 247.44 234.492"\n  xml:space="preserve">\n');

}

SVG.prototype.clear = function() {
    this.outputField.innerHTML = "";
};

SVG.prototype.line = function(x1, y1, x2, y2, stroke, width) {

    // Set the default value of the width to 2
    width = typeof width !== 'undefined' ? width : 2;
    stroke = convertColor(stroke);

    this.write('<line fill="none" stroke="' + stroke + '" stroke-width="' + width + 'px" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" x3="0.0" y3="0.0"/>\n');

};

SVG.prototype.circle = function(x, y, radius, fill, stroke) {
    stroke = convertColor(stroke);
    fill = convertColor(fill);
    this.write('<circle id="c_' + this.circlecount + '" cx="' + x + '" cy="' + y + '" r="' + radius + '" fill="' + fill + '" stroke="' + stroke + '"/>\n');
    this.circlecount++;
};

SVG.prototype.text = function(x, y, size, fill, align, str) {
    fill = convertColor(fill);
    str = htmlEntities(str);

    var fontFamily = "Calibri";

    if(navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
        fontFamily = "Helvetica Neue";
    }

    this.write('<text x="' + x + '" y="' + y + '" font-family="' + fontFamily + '" font-weight="200" font-size="' + size + '" fill="' + fill + '" text-anchor="' + align + '">' + str + '</text>\n');

};

SVG.prototype.finish = function() {
    this.write("</svg>\n");
    this.outputField.innerHTML += this.writeBuffer;
};

console.log("SVG utilities successfully loaded.");