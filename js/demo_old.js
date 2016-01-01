// this script contains "temporary" variables for the demo; should be replaced in prod

// use JS instead of flash <iframe> for 2D
var iframe_flag = false;
// turn off sele/order/sort event reports in console
var DEBUG = true;

// dummy col_header placeholder
// some data types are wrong. this affects sorting by column
var col_header = {
    // format is ['display title'(req), 'type'(req), 'suffix'(opt), 'color group/additional class name'(opt), 'percent group'(opt)]
	0: ["Designer", "string"],
	1: ["Title", "string"],
	2: ["Sequence", "string", "", "sequence"],
	3: ["ID", "string"],                                // either INT or STRING is fine
	4: ["Vote", "int", "", 13],                         // type should be INT instead of STRING
	5: ["My Vote", "int", "", 13],
	6: ["Description", "string"],
	7: ["Round", "int"],                                // type should be INT instead of STRING
	8: ["GC Pairs", "int", "", "", 8],                  // type should be INT instead of STRING
	9: ["UA Pairs", "int", "", "", 8],                  // type should be INT instead of STRING
	10: ["GU Pairs", "int", "", "", 8],                 // type should be INT instead of STRING
	11: ["Melting Point", "float", "<sup>o</sup>C"],
	12: ["Free Energy", "float", "kcal"],               // type should be FLOAT instead of STRING
	13: ["Synthesized", "string", "", 13],              // type should be BOOLEAN instead of STRING
	14: ["Score", "int", "/ 100", "light-green-font"],  // type should be INT instead of STRING
	15: ["SHAPE Threshold", "float", "", 13],           // type should be FLOAT instead of STRING
};


// hardcoded lab_id and target structures
function getStr1(idx) { return "...............(((((.((....)))))))........................................"; }
function getStr2(idx) { return ".....(((......(((.........................................))).....)))....."; }

// tailored for old lab data
var lab_set_url = "data/5962963_id.json";
function getDataQuery() { return "data/5962963.json"; }

function dataAjaxSuccess(data) {
    synthesized = data.data.synthesized_results.synthesized;
    shape_data = data.data.synthesized_results.shape_data;
    $("#lab-title").html(data.data.lab_title);
}

// hardcoded function of specific columns for right-panel
function getColNums() {
    return {
        "designer": table.column(".td_def_0").index(),
        "title": table.column(".td_def_1").index(),
        "sequence": table.column(".td_def_2").index(),
        "id": table.column(".td_def_3").index(),
        "round": 97,
        "description": table.column(".td_def_6").index(),
        "score": table.column(".td_def_14").index(),
        "flag": table.column(".td_def_13").index()
    };
}

