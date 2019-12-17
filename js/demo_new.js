/* demo_new.js 
 *
 * Copyright (C) 2015 Eterna Commons at Stanford University
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD-3-Clause license.  See the LICENSE.md file for details.
 */


// use JS instead of flash <iframe> for 2D
var iframe_flag = false;
// turn off sele/order/sort event reports in console
var DEBUG = true;

// hardcoded puzzle_id and target structures
function getStr1(idx) { return table.row(idx).data()[gDataColumnIndex["Structure_1"]]; }
function getStr2(idx) { return table.row(idx).data()[gDataColumnIndex["Structure_2"]]; }

var server_base = ['localhost', '127.0.0.1'].includes(location.hostname) ? 'https://eternagame.org' : '';

// ------------ Puzzle specification -------------------
//
function getPuzzleQuery(){
    return server_base + "/get/?type=data_browser_puzzles";
}

function normalizePuzzleResponse( data ) {
    data = data["data"];
    gaPuzzles = data["rows"];
    var temp = data["columns"];
    for (i = 0; i < temp.length; i++) {
	gPuzzleIndex[temp[i]] = i;
    }
}

var fakePuzzleResponse = {
    columns: 
        ["Puzzle_ID", "Puzzle_Name",], 
    rows: [
        ["1111111",   "Puzzle 1",],
    ]
}

// ------------ (available) Column specification -------------------
//

function getColumnQuery() {
    // Column_Name _must_ be first column in response. // TODO: still?  (see below)  If so, relax this
    var legacyColunmnColumnNames = ["Column_Name", "Column_Label", "Siqi_sub_1", "Siqi_sub_2", "Siqi_sub_3", "Siqi_sub_4", "Sort_Order"];

    // Special canned examples
    if (gOptions.example) {
        switch (gOptions.example[0]) {
          case '1':
            return server_base + "/get/?type=data_browser_columns&columns=" + legacyColunmnColumnNames.join(",") + "&project_ids=5962968"
          case '2':
            return server_base + "/get/?type=data_browser_columns&project_ids=5962968"
            //gProjectIDs = ["5962968"];
            //break;
        }
    }

    // Create the WHERE clause for column specifications, calculated from project IDs for selected puzzles
    var aRowSelection = [];
    for (p in gProjectIDs) {
        aRowSelection.push( p );
    }

    return server_base + "/get/?type=data_browser_columns&project_ids=" + aRowSelection.join(",");
}


function normalizeColumnResponse( data ) {
    data = data['data'];

    // Index the column names field
    gColumnsRowIndex = {};
    for ( i = 0; i < data.columns.length; i++) {
        gColumnsColumnIndex[data.columns[i]] = i;
    }
    if (gColumnsColumnIndex["Column_Name"] === undefined)
        throw( 'The DB query for column specifications must contain a field named "Column_Name"' );


    gaColumns = data.rows || [];

    //             
    gaColumnSpecification = [];
    gAvailableColumns = [];
    var columnsColumnNameIndex = gColumnsColumnIndex["Column_Name"];
    for (i = 0; i < gaColumns.length; i++) {
        // We want just one of potentially many copies of the column specification
        var columnName = gaColumns[i][columnsColumnNameIndex];
        if (gColumnsRowIndex[columnName] === undefined) {
            gColumnsRowIndex[columnName] = gAvailableColumns.length;
            gAvailableColumns.push( columnName ); 
            //gaColumnSpecification[parseInt(i)] = gaColumns[i].slice( columnsColumnNameIndex ); // Discarding any columns prior to "Column_Name";
            gaColumnSpecification.push( gaColumns[i] );
        }
        
    }
   
}

// Specific columns for right-panel
function getColNums() {
    return {
        "designer": gDataColumnIndex["Designer_Name"],
        "title": gDataColumnIndex["Design_Name"],
        "sequence": gDataColumnIndex["Sequence"],
        "id": gDataColumnIndex["Design_ID"],
        "round": gDataColumnIndex["Synthesis_Round"],
        "description": gDataColumnIndex["Description"],
        "score": gDataColumnIndex["Eterna_Score"],
        "flag": -1
    };
}

var fakeColumnResponse = {
    columns:
        ["Column_Name", "Column_Label",], 
    rows: [
        ["Design_ID",   "Design ID",], 
        ["Design_Name", "Design Name",],
        ["Sequence",   "Sequence",],
        ["Structure_1", "Structure 1",], 
        ["Structure_2", "Structure 2",],
    ] 
}

// ------------ Data specification -------------------
//
// compose query of selected puzzle_id as WHERE Puzzle_ID IN (xxx, yyy)
function getDataQuery() {
    // create SELECT list from gaColumnsToDownload array
    var column_selection = "*";	// Not really a supported query, but occasionally useful for debugging
    if (gaColumnsToDownload.length > 0) {
        column_selection = gaColumnsToDownload.join(",");
    }

    // Special canned examples
    if (gOptions.example) {
        switch (gOptions.example) {
          case '1':
              // TODO: Original example Fusion table didn't have IDs. What should this do?
            return server_base + "/get/?type=data_browser_data&columns=Design_Name,Design_ID,Designer_Name,Eterna_Score,Sequence";
          case '2':
            gaSelectedPuzzles = [5962966];
            break;
        }
    }

    return server_base + "/get/?type=data_browser_data&columns=" + column_selection + "&puzzle_ids=" + gaSelectedPuzzles.join(',');
}

function dataAjaxSuccess(data) {
    data = data['data'];

    gTableData = data['rows'];
    //$("#lab-title").html(data['kind']);
    gaDownloadedColumns = data['columns'];


    for ( i = 0; i < gaDownloadedColumns.length; i++) {
        gaDownloadedColumnIndex[gaDownloadedColumns[i]] = i;	// Column name --> original index
        gDataColumnIndex[gaDownloadedColumns[i]] = i;		// Column name --> current table column index
 
    }

    updateColumnTracking();
}

var fakeDataResponse = { 
    columns: 
        ["Design_ID", "Design_Name", "Sequence_",  "Structure_1", "Structure_2"], 
    rows: [
        ["1111111",   "Design 1",    "AAAAAAAAAA", ".(((...)))",  "(((....)))",], 
        ["2222222",   "Design 2",    "AAAAAAAAAA", "(((....)))",  "(((...))).",],
    ] 
}



