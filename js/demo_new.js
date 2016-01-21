// this script contains "temporary" variables for the demo; should be replaced in prod

// use JS instead of flash <iframe> for 2D
var iframe_flag = false;
// turn off sele/order/sort event reports in console
var DEBUG = true;

// hardcoded puzzle_id and target structures
function getStr1(idx) { return table.row(idx).data()[gDataColumnIndex["Structure_1"]]; }
function getStr2(idx) { return table.row(idx).data()[gDataColumnIndex["Structure_2"]]; }

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
    // Column_Name _must_ be first column selected.
    return "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT Column_Name,Column_Label,Siqi_sub_1,Siqi_sub_2,Siqi_sub_3,Siqi_sub_4 FROM " + ColumnTableID + " WHERE Temp = '_temp_' &key=" + APIkey;
}


function normalizeColumnResponse( data ) {
    // convert fusion table results to internal data structures
    // Find the index of the "Column_Name" field
    gColumnsColumnIndex = {};
    for ( i = 0; i < data.columns.length; i++) {
        gColumnsColumnIndex[data.columns[i]] = i;
    }
    if (!!gColumnsColumnIndex["Column_Name"])
	throw( 'The DB query for column specifications must contain a field named "Column_Name"' );

    gaColumns = data.rows;

// Is this irrelevant until data is loaded?            
    columnSpecification = {};
    gAvailableColumns = {};
    columnsColumnNameIndex = gColumnsColumnIndex["Column_Name"]
    for (i = 0; i < gaColumns.length; i++) {
	gColumnIndex[gaColumns[i][columnsColumnNameIndex]] = i; //
        gAvailableColumns[parseInt(i)] = gaColumns[i][0]; 
        columnSpecification[parseInt(i)] = gaColumns[i].slice( 1 ); 
    }
   
}

// Specific columns for right-panel
function getColNums() {
    return {
        "designer": gDataColumnIndex["Designer_Name"],
        "title": gDataColumnIndex["Design_Name"],
        "sequence": gDataColumnIndex["Sequence_"],
        "id": gDataColumnIndex["Design_ID"],
        "round": gDataColumnIndex["Synthesis_Round"],
        "description": gDataColumnIndex["Description_"],
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
        ["Sequence_",   "Sequence",],
        ["Structure_1", "Structure 1",], 
        ["Structure_2", "Structure 2",],
    ] 
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
    var column_selection = "*";	// Not really a supported query, but occasionally useful for debugging
    if (gaColumnsToDownload.length > 0) {
	var tmp = [];
	for (var i = 0; i < gaColumnsToDownload.length; i++) tmp[i] = "'" + gaColumnsToDownload[i] + "'";
	column_selection = tmp.join(",");
    } else {
        // What should the player see if no co,umps are selected?
        alert("Select one or more columns for download");
    }
    // construct URL

    var dataURL =  "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT " + column_selection + " FROM " + DataTableID + " WHERE 'Puzzle_ID' IN(" + puzzle_ids + ") &key=" + APIkey;
    return dataURL;
}

function dataAjaxSuccess(data) {
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



