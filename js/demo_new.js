// this script contains "temporary" variables for the demo; should be replaced in prod

// use JS instead of flash <iframe> for 2D
var iframe_flag = false;
// turn off sele/order/sort event reports in console
var DEBUG = true;

// hardcoded puzzle_id and target structures
function getStr1(idx) { return table.row(idx).data()[gColumnIndex["Structure_1"]]; }
function getStr2(idx) { return table.row(idx).data()[gColumnIndex["Structure_2"]]; }

// Fusion table IDs
var PuzzleTableID = "1U8t1qye2beaSl70XMTDHYoDznRWeopnOt1eoJy4T";
//var ColumnTableID = "11uTF1m16NsZ0Eg5h6HJ5g6LQzDEXGkHIIyOvZPHT";
var ColumnTableID = "16Ue5edl-AkRXyxlsTw9BC1ZRNakrgR6f5GEos75L";
var DataTableID   = "1kMFbEh1W-Q0GyY2CCJP1lxSWZpuspjdqDUzHMKAJ";

var APIkey = "AIzaSyD6cZ6iB7D1amG_DQfRjvCCXSlEeZrPiGE";

// ------------ Puzzle specification -------------------
//
function getPuzzleQuery(){
    return "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT * FROM " + PuzzleTableID + " &key=" + APIkey;
}

function normalizePuzzleResponse( data ) {
    gaPuzzles = data["rows"];
    var temp = data["columns"];
    for (i = 0; i < temp.length; i++) {
	gPuzzleIndex[temp[i]] = i;
    }
}

// ------------ (available) Column specification -------------------
//

function getColumnQuery() {
    // Column_Name _must_ be first column selected.
    return "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT Column_Name,Column_Label,Siqi_sub_1,Siqi_sub_2,Siqi_sub_3,Siqi_sub_4 FROM " + ColumnTableID + " WHERE Temp = '_temp_' &key=" + APIkey;
}


function normalizeColumnResponse( data ) {
    // convert fusion table results to internal data structures
    // Find the index of the "Column_Name" field
    var columns = data.columns;
    columnNameIndex = -1;
    for ( i = 0; i < columns.length; i++) {
        if (columns[i] == "Column_Name") {
            columnNameIndex = i;
        }
    }
    if (columnNameIndex == -1)
	throw( 'The DB query for column specifications must contain a field named "Column_Name"' );
            
    columnSpecification = {};
    col_names = {};
    gaColumns = data.rows;
    for (i = 0; i < gaColumns.length; i++) {
	gColumnIndex[gaColumns[i][columnNameIndex]] = i; //
        col_names[parseInt(i)] = gaColumns[i][0]; 
        columnSpecification[parseInt(i)] = gaColumns[i].slice( 1 ); 
    }   
}

// hardcoded function of specific columns for right-panel
function getColNums() {
    return {
        "designer": gColumnIndex["Designer_Name"],
        "title": gColumnIndex["Design_Name"],
        "sequence": gColumnIndex["Sequence_"],
        "id": gColumnIndex["Design_ID"],
        "round": gColumnIndex["Synthesis_Round"],
        "description": gColumnIndex["Description_"],
        "score": gColumnIndex["Eterna_Score"],
        "flag": -1
    };
}

// ------------ Data specification -------------------
//
// compose query of selected puzzle_id as WHERE Puzzle_ID IN (xxx, yyy)
function getDataQuery() {
    // Create WHERE list from gaSelectedPuzzles array
    var puzzle_ids = '';
    for (var i = 0; i < gaSelectedPuzzles.length; i++) {
        puzzle_ids += "%20%27" + gaSelectedPuzzles[i] + "%27%20,";
    }
    puzzle_ids = puzzle_ids.substring(0, puzzle_ids.length - 1);

    // create SELECT list from gaColumnsToDownload array
    var column_selection = "*";
    if (gaColumnsToDownload.length > 0) {
	var tmp = [];
	for (var i = 0; i < gaColumnsToDownload.length; i++) tmp[i] = "'" + gaColumnsToDownload[i] + "'";
	column_selection = tmp.join(",");
    }
    // construct URL

    var dataURL =  "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT " + column_selection + " FROM " + DataTableID + " WHERE 'Puzzle_ID' IN(" + puzzle_ids + ") &key=" + APIkey;
    return dataURL;
}

function dataAjaxSuccess(data) {
    synthesized = data['rows'];
    $("#lab-title").html(data['kind']);
    var downloadedColumns = data['columns'];


/* This doesn't seem to make any sense !!!
    var columnNameIndex = -1;
    for ( i = 0; i < downloadedColumns.length; i++) {
        if (downloadedColumns[i] == "Column_Name") {
            columnNameIndex = i;
        }
    }
//    if (columnNameIndex == -1)
//	throw( 'The DB query for the experimental data must contain a field named "Column_Name"' );

*/
    columnSpecification = {};
    col_names = {};
    for (i = 0; i < downloadedColumns.length; i++) {
	gColumnIndex[gaColumns[i][columnNameIndex]] = i;
        col_names[i] = downloadedColumns[i]; 
        columnSpecification[i] = gaColumns[gColumnIndex[gaColumnsToDownload[i]]].slice(1); 
    }   
}



