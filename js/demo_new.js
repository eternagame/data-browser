
// use JS instead of flash <iframe> for 2D
var iframe_flag = false;
// turn off sele/order/sort event reports in console
var DEBUG = true;

// hardcoded puzzle_id and target structures
function getStr1(idx) { return table.row(idx).data()[gDataColumnIndex["Structure_1"]]; }
function getStr2(idx) { return table.row(idx).data()[gDataColumnIndex["Structure_2"]]; }

var currentDatabaseVersion = "0.2"; // Defined globally; can be over-ridden by Example<N> cases 

var databaseHistory = {
    "0.0": {
        PuzzleTable: "1U8t1qye2beaSl70XMTDHYoDznRWeopnOt1eoJy4T",
        ColumnTable: "16Ue5edl-AkRXyxlsTw9BC1ZRNakrgR6f5GEos75L",
        DataTable  : "1kMFbEh1W-Q0GyY2CCJP1lxSWZpuspjdqDUzHMKAJ",
    },
   "0.1": {
        PuzzleTable: "1saGl4liryIYKdt8_O8cwe2s8ZxIJf2uoropV-qTT",
        ColumnTable: "1r-yR0zOOY-ukaiVHsh7njXDCsNu2MesE_d148RLV",
        DataTable  : "1kMFbEh1W-Q0GyY2CCJP1lxSWZpuspjdqDUzHMKAJ",
    },
   "0.2": {
        PuzzleTable: "1KDIXO0KdrucA98E5hcD9RIbU4raphzRsERgVrLeY",
        ColumnTable: "1sTS1tFoo4SR7GbVY78-Ed5d8aWpSKPhU8mYFKPbB",
        //DataTable  : "1J_u-JrvS0QNgVeqI95vapQOkPYEpInSh-KZ23W4p",
        DataTable  : "1WRLCkorduA-k8WZeUP5aDlHIfcXFprrXLh3LJH2M",
    },
   "Example-1": {
        PuzzleTable: "1PW2HkXM9B5r9_zwyBJGcTnWTtYn_LjgnfdXsIdqe",
        ColumnTable: "1Xhlw0FoPcOzvoWGFHY8IfhRE7cTbgDnQG61FlPiS",
        DataTable  : "13ztaNl4luy2_tJa5Uqw3AESB1clGbaqZEzimTPqP",
    },
}

var PuzzleTableID = databaseHistory[currentDatabaseVersion].PuzzleTable;
var ColumnTableID = databaseHistory[currentDatabaseVersion].ColumnTable;
var DataTableID   = databaseHistory[currentDatabaseVersion].DataTable;

function overrideQueryIDs( version ) {
    PuzzleTableID = databaseHistory[version].PuzzleTable;
    ColumnTableID = databaseHistory[version].ColumnTable;
    DataTableID   = databaseHistory[version].DataTable;
}

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
    // Column_Name _must_ be first column in response. // TODO: still?  (see below)  If so, relax this
    var legacyColunmnColumnNames = ["Column_Name", "Column_Label", "Siqi_sub_1", "Siqi_sub_2", "Siqi_sub_3", "Siqi_sub_4", "Sort_Order"];

    // Special canned examples
    if (gOptions.example && gOptions.example[0] == 1) {
        return "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT " + legacyColunmnColumnNames.join(",") + " FROM " + ColumnTableID + 
             " WHERE Ready = 'Y' AND Project_ID IN (5962968) ORDER BY Sort_Order ASC &key=" + APIkey;
    }

    // Create the WHERE clause for column specifications, calculated from project IDs for selected puzzles
    var aRowSelection = [];
    for (p in gProjectIDs) {
        aRowSelection.push( p );
    }

    return "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT " + legacyColunmnColumnNames.join(",") + " FROM " + ColumnTableID + 
             " WHERE Ready = 'Y' AND Project_ID IN (" + aRowSelection.join(",") + ") ORDER BY Sort_Order ASC &key=" + APIkey;
}


function normalizeColumnResponse( data ) {
    // convert fusion table results to internal data structures

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
	gColumnsRowIndex[gaColumns[i][columnsColumnNameIndex]] = i;
        gAvailableColumns[parseInt(i)] = gaColumns[i][0]; 
        gaColumnSpecification[parseInt(i)] = gaColumns[i].slice( columnsColumnNameIndex ); // Discarding any columns prior to "Design_Name"
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
        for (var i = 0; i < gaColumnsToDownload.length; i++) {
            tmp[i] = "'" + gaColumnsToDownload[i] + "'";
        }
        column_selection = tmp.join(",");
    } else {
        column_selection = "*";
    }
    // construct URL

    // Special canned cases

    if (gOptions.example && gOptions.example[0] == 1) {
        return "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT 'Design_Name','Design_ID','Designer_Name','Eterna_Score','Sequence' FROM "+ DataTableID + "&key=AIzaSyD6cZ6iB7D1amG_DQfRjvCCXSlEeZrPiGE";
    }

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



