/* main.js 
 
 * Copyright (C) 2015 Eterna Commons at Stanford University
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD-3-Clause license.  See the LICENSE.md file for details.
 */

var NODE_R = 3;
var PRIMARY_SPACE = 8;
var PAIR_SPACE = 10;
var CELL_PADDING = 15;

var NUCL_COLORS = [ [255, 51, 51], [51, 255, 51], [255, 255, 51], [119, 119, 255] ];
var PAIRED_COLOR_1 = [[250,144,68], [0,101,164]];
var PAIRED_COLOR_2 = [[128,128,128],[250,144,68]];
var PAIRBOND_COLOR = [120, 120, 120];

var RENDER_LETTERS = false, DRAW_PAIRS = false, COLOR_SCHEME = NUCL_COLORS;


function renderRNA (sequence, secstruct, docElement) {

    var pairmap = getPairmapFromSecstruct(secstruct);
    var pairs = [];
    for(var i = 0; i < pairmap.length; i++) {
        if(pairmap[i] > i) {
            pair_obj = {"from":i, "to":pairmap[i], "p":1.0};
            pairs.push(pair_obj);
        }
    }

    var renderer = new RNARenderer();
    renderer.setupTree(secstruct, NODE_R, PRIMARY_SPACE, PAIR_SPACE);
    
    var size = renderer.getSize();
    var cell_size = Math.max(size[0], size[1]) + CELL_PADDING * 2;

    var svgobj = new SVG(docElement, cell_size, cell_size);
    svgobj.clear();

    for(var i = 0; i < pairs.length; i++) {
        pairs[i]['color'] = convertColor(PAIRBOND_COLOR);
    }

    var colors = [];
    for(var i = 0; i < secstruct.length; i++) {
        var color = "";

        if (COLOR_SCHEME.length == 4) {
            if (!sequence || i >= sequence.length) color = PAIRED_COLOR_2[0]; // a default gray
            else if (sequence.charAt(i) == 'G') color = COLOR_SCHEME[0];
            else if (sequence.charAt(i) == 'C') color = COLOR_SCHEME[1];
            else if (sequence.charAt(i) == 'A') color = COLOR_SCHEME[2];
            else if (sequence.charAt(i) == 'U') color = COLOR_SCHEME[3];
        } else if (COLOR_SCHEME.length == 2) {
            if (secstruct.charAt(i) == '.') color = COLOR_SCHEME[0];
            else color = COLOR_SCHEME[1];
        }
        colors.push(color);
    }

    var x_offset = (cell_size - size[0]) / 2;
    var y_offset = (cell_size - size[1]) / 2;

    if (!DRAW_PAIRS) {
        pairs = false;
    }

    renderer.draw(svgobj, x_offset, y_offset, colors, pairs, sequence, RENDER_LETTERS);
    svgobj.finish();
    console.log("SVG size (" + cell_size + ", " + cell_size + ")");
}

console.log("Preferences + main successfully loaded.");