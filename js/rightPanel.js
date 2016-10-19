/* rightPanel.js 
 
 * Copyright (C) 2015 Eterna Commons at Stanford University
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD-3-Clause license.  See the LICENSE.md file for details.
 */

// global setTimeout timers to reduce event handling overlapping fire
var timer_right_pane = 0, timer_right_resize = 0;
var sele_indexes = [];

// Aspect ratio for 2D structure flash app frames = 3:2.  Note that an arbitrary aspect ratio may cause Chrome to require the user click to start the app.
var _2dAspectRatio = 1.5;

// text content (title, designer, etc.) for each row in right-panel
function fillDesignText(row, col_num) {
    var html = '';
    html += '<div class="ui-tabs-panel outline" id="right_panel_' + row[col_num["id"]] + '" style="clear:both;">';
    html += '<p><b>' + row[col_num["title"]] + '</b> by <u>' + (col_num["designer"] ? row[col_num["designer"]] : '(not in query)') + '</u></p>';
    html += '<p>ID: <i style="color:#fff;">' + (col_num["id"] ? row[col_num["id"]] : '(not in query)') + '</i>  Eterna Score: <span class="light-green-font">' 
               + (col_num["score"] ? row[col_num["score"]] : '(not in query)') + '</span> <span style="color:#888">/ 100</span></p>';
    html += '<p class="txt-hover"><i>' + (col_num["description"] ? row[col_num["description"]] : '') + '</i></p>';
    return html;
}

// update content for each row in right-panel 2D JS
function drawSecStr(row, col_num) {
    var html = fillDesignText(row, col_num);
    // <iframe> mode (obsolete) or 2D JS
    if (iframe_flag) {
        html += '<iframe src="http://www.eternagame.org/game/solution/' + id + '/' + row[col_num["id"]] + '/copyandview/" style="width:100%; height:300px"></iframe>';
    } else {
        html += '<div id="svg_container_0_' + row[col_num["id"]] + '" style="width:50%; float:left; display:inline-block;"></div>';
        html += '<div id="svg_container_1_' + row[col_num["id"]] + '" style="width:50%; float:right; display:inline-block;;"></div>';
    }
    html += '</div>';
    return html;
}

// update contents of right-panel 2D JS
function updateSele2SecStr(ids, col_num) {
    var iframeHeight = $("#tabs-east").width() / _2dAspectRatio; // It's voodoo, but some aspect ratios cause Chrome to require the user to click to "play" the app.
    var html = '';
    for (var i = 0; i < ids.length; i++) {
        var row = table.row([ids[i]]).data();
        // Change to use copyandview URL to take advantage of pre-computed folding
        // Omiting the domain doesn't woek well for testing on the dev server, because it lacks an up-to-date Eterna database
        html += '<iframe src="http://eternagame.org/game/solution/' + row[gDataColumnIndex['Puzzle_ID']] + '/'  + row[gDataColumnIndex['Design_ID']] +
                '/copyandview/?databrowser=true" style="width:99%; height:' + iframeHeight + 'px"></iframe>';  // width=100% => horizontal scroll bars

/*
        html += '<iframe src="http://staging.eternagame.org/lab/2D_structure.html?puzzleid=' + row[gDataColumnIndex['Puzzle_ID']] +
                '&sequence=' + row[gDataColumnIndex['Sequence']] + '&title=' + row[gDataColumnIndex['Design_Name']] +
                '&data_browser=true" style="width:99%; height:' + iframeHeight + 'px"></iframe>';  // width=100% => horizontal scroll bars
*/
    }
    $("#tab-panel-east-1").html(html);
}

// update contents of right-panel histograms
function updateSele2Hist(ids, col_num) {
    var designIDIndex = gDataColumnIndex["Design_ID"]
    var projectIDIndex = gPuzzleIndex["Project_ID"]
    var templateIndex = gPuzzleIndex["Histogram_URL_Template"]
    
    var html = '';
    for (var i = 0; i < ids.length; i++) {
        var row = table.row([ids[i]]).data();
        html += fillDesignText(row, col_num);
/*
        // get S3 image depending on whether row is gTableData
        if (row[col_num["flag"]] == "Yes" || col_num["flag"] == -1) {
            var round = row[col_num["round"]];
            if (!round) { round = col_num["round"]; }
            html += '<img src="https://s3.amazonaws.com/eterna/labs/histograms_R' + round + '/' + row[col_num["id"]] + '.png" width="100%" style="padding-bottom:10px;"/></div>';
        } else {
            html += '<p style="color:#000; background-color:#fff;"><i><u>Not gTableData. Switch data not available.</u></i></p></div>';
        }
*/
        //var puzzleID = row[gDataColumnIndex["Puzzle_ID"]];
        //var template = gaPuzzles[gPuzzlesRowIndex[puzzleIF]][gPuzzlesColumnIndex["Histogram_URL_Template"]];
        var projectID = row[gDataColumnIndex["Project_ID"]] 
        var template;
        gaPuzzles.map(function(value) {if (value[projectIDIndex] == projectID) template = value[templateIndex]})
        //var template = 'https://s3.amazonaws.com/eterna/labs/histograms_R97/{Design_ID}.png'; // !!! temp
        var designID = row[designIDIndex];
        var URL = template.replace('{Design_ID}', designID)
        html += '<img src=' + URL + ' width="100%" style="padding-bottom:10px;" alt="The switch graph is not available"/></div>';
    }
    $("#tab-panel-east-2").html(html);
}

// update contents of right-panel
function syncSele2D() {
    // get related columns' current index, e.g. title, designer, etc.
    var col_num = getColNums();
    updateSele2SecStr(sele_indexes, col_num);
    updateSele2Hist(sele_indexes, col_num);
}

// initiate right-panel
function initStr2D() {
    // need to be separated, otherwise jquery misfires/delays event
    $("#center-table").on("select.dt", function( e, dt, type, indexes ) { 
        sele_indexes = table.rows(".selected").indexes();
        syncSele2D();
        clearTimeout(timer_right_pane);
        timer_right_pane = setTimeout(function() {
            if (pageLayout.state.east.isClosed && !pageLayout.state.east.isHidden && sele_indexes.length) { pageLayout.open("east"); }
        }, 200);
    });
    $("#center-table").on("deselect.dt", function( e, dt, type, indexes ) { 
        // updates global sele_indexes, and redraw right-panel
        sele_indexes = table.rows(".selected").indexes();
        syncSele2D();
        // prevent frequent open/close when selecting/deselecting
        clearTimeout(timer_right_pane);
        timer_right_pane = setTimeout(function() {
            // close right panel if non selected
            if (!sele_indexes.length) { pageLayout.close("east"); }
        }, 200);
    });
}

// resize 2D JS Str when right-panel resize
function resize2DStructure() {
    var iframeHeight = $("#tabs-east").width() / _2dAspectRatio;
    $("#tabs-east iframe").height(iframeHeight);
}
