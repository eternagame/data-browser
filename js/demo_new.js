// this script contains "temporary" variables for the demo; should be replaced in prod

// use JS instead of flash <iframe> for 2D
var iframe_flag = false;
// turn off sele/order/sort event reports in console
var DEBUG = true;

// hardcoded lab_id and target structures
function getStr1(idx) { return table.row(idx).data()[table.column(".td_def_57").index()]; }
function getStr2(idx) { return table.row(idx).data()[table.column(".td_def_58").index()]; }

// tailored for new lab data
var lab_set_url = "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201hpRtzFVXLmaIRBFk8Ca-746rE4qDPHxNdMh4CocA%20&key=AIzaSyD6cZ6iB7D1amG_DQfRjvCCXSlEeZrPiGE";
// compose query of selected lab_id as WHERE Lab_ID IN (xxx, yyy)
function getDataQuery() {
    var lab_ids = '';
    for (var i = 0; i < lab_sele.length; i++) {
        lab_ids += "%20%27" + lab_sele[i] + "%27%20,";
    }
    lab_ids = lab_ids.substring(0, lab_ids.length - 1);
    return "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201e4G5hFaoB6fcHTxBUSBLiOXmPC-L9bBB_KtocFQc%20WHERE%20%27Lab%20ID%27%20IN%20(" + lab_ids + ")%20&key=AIzaSyD6cZ6iB7D1amG_DQfRjvCCXSlEeZrPiGE";
}

var col_header = {};
function dataAjaxSuccess(data) {
    synthesized = data['rows'];
    $("#lab-title").html(data['kind']);

    // hardcoded filling data types
    col_header = {
    0:  ["Lab Name",                                     "string"],
    1:  ["Design ID",                                    "string"],
    2:  ["Design Name",                                  "string"],
    3:  ["Designer",                                     "string"],
    4:  ["Legacy Display Link",                          "string",   "",         "gray-font"],
    5:  ["Synthesis Round",                              "int"],
    6:  ["Switch Direction",                             "int",      "",         6],
    7:  ["Cluster Count",                                "int"],
    8:  ["Baseline Subscore",                            "float",    "/ 30"],
    9:  ["Folding Subscore",                             "float",    "/ 30"],
    10: ["Switch Subscore",                              "float",    "/ 40"],
    11: ["Eterna Score",                                 "float",    "/ 100",    "light-green-font"],
    12: ["Sequence",                                     "string",   "",         "sequence"],
    13: ["K<sub>D</sub> <i>OFF</i>",                     "float",    "nM"],
    14: ["K<sub>D</sub> <i>ON</i>",                      "float",    "nM"],
    15: ["Fold Change",                                  "float"],
    16: ["Fold Change <sub>err</sub>",                   "float"],
    17: ["&Delta;&Delta;G",                              "float",    "kcal"],
    18: ["&Delta;&Delta;G<sub>err</sub>",                "float",    "kcal"],
    19: ["f<sub>max</sub> <i>noInput</i>",               "float"],
    20: ["f<sub>max</sub> <i>FMN</i>",                   "float",    "",         "orange-font"],
    21: ["f<sub>max</sub> <i>miR</i>",                   "float",    "",         "cyan-font"],
    22: ["f<sub>max</sub> <i>noInput</i><sub>std</sub>", "float"],
    23: ["f<sub>max</sub> <i>FMN</i><sub>std</sub>",     "float",    "",         "orange-font"],
    24: ["f<sub>max</sub> <i>miR</i><sub>std</sub>",     "float",    "",         "cyan-font"],
    25: ["f<sub>max</sub> <i>noInput</i><sub>sem</sub>", "float"],
    26: ["f<sub>max</sub> <i>FMN</i><sub>sem</sub>",     "float",    "",         "orange-font"],
    27: ["f<sub>max</sub> <i>miR</i><sub>sem</sub>",     "float",    "",         "cyan-font"],
    28: ["&Delta;G <i>noInput</i>",                      "float",    "kcal"],
    29: ["&Delta;G <i>FMN</i>",                          "float",    "kcal",     "orange-font"],
    30: ["&Delta;G <i>miR</i>",                          "float",    "kcal",     "cyan-font"],
    31: ["&Delta;G <i>noInput</i><sub>std</sub>",        "float",    "kcal"],
    32: ["&Delta;G <i>FMN</i><sub>std</sub>",            "float",    "kcal",     "orange-font"],
    33: ["&Delta;G <i>miR</i><sub>std</sub>",            "float",    "kcal",     "cyan-font"],
    34: ["&Delta;G <i>noInput</i><sub>sem</sub>",        "float",    "kcal"],
    35: ["&Delta;G <i>FMN</i><sub>sem</sub>",            "float",    "kcal",     "orange-font"],
    36: ["&Delta;G <i>miR</i><sub>sem</sub>",            "float",    "kcal",     "cyan-font"],
    37: ["K<sub>D</sub> <i>noInput</i>",                 "float",    "nM"],
    38: ["K<sub>D</sub> <i>FMN</i>",                     "float",    "nM",       "orange-font"],
    39: ["K<sub>D</sub> <i>miR</i>",                     "float",    "nM",       "cyan-font"],
    40: ["K<sub>D</sub> <i>noInput</i><sub>sem</sub>",   "float",    "nM"],
    41: ["K<sub>D</sub> <i>FMN</i><sub>sem</sub>",       "float",    "nM",       "orange-font"],
    42: ["K<sub>D</sub> <i>miR</i><sub>sem</sub>",       "float",    "nM",       "cyan-font"],
    43: ["FoldChange <i>FMN_miR</i>",                    "float"],
    44: ["FoldChange <i>noInput_FMN</i>",                "float"],
    45: ["FoldChange <i>noInput_miR</i>",                "float"],
    46: ["A",                                            "int",      "",         "nt-A",        46],
    47: ["C",                                            "int",      "",         "nt-C",        46],
    48: ["G",                                            "int",      "",         "nt-G",        46],
    49: ["U",                                            "int",      "",         "nt-U",        46],
    50: ["A <i>(%)</i>",                                 "int"],
    51: ["C <i>(%)</i>",                                 "int"],
    52: ["G <i>(%)</i>",                                 "int"],
    53: ["U <i>(%)</i>",                                 "int"],
    54: ["Sequence Length",                              "int",      "nt"],
    55: ["E <sub>Str1</sub>",                            "float",    "kcal"],
    56: ["E <sub>Str2</sub>",                            "float",    "kcal"],
    57: ["Structure 1",                                  "string",   "",         "monospace"],
    58: ["Structure 2",                                  "string",   "",         "monospace"],
    59: ["AU <sub>Str1</sub>",                           "int",      "",         "",            59],
    60: ["GC <sub>Str1</sub>",                           "int",      "",         "",            59],
    61: ["GU <sub>Str1</sub>",                           "int",      "",         "",            59],
    62: ["AU<i>(%)</i> <sub>Str1</sub>",                 "int"],
    63: ["GC<i>(%)</i> <sub>Str1</sub>",                 "int"],
    64: ["GU<i>(%)</i> <sub>Str1</sub>",                 "int"],
    65: ["AU <sub>Str2</sub>",                           "int",      "",         "",            65],
    66: ["GC <sub>Str2</sub>",                           "int",      "",         "",            65],
    67: ["GU <sub>Str2</sub>",                           "int",      "",         "",            65],
    68: ["AU<i>(%)</i> <sub>Str2</sub>",                 "int"],
    69: ["GC<i>(%)</i> <sub>Str2</sub>",                 "int"],
    70: ["GU<i>(%)</i> <sub>Str2</sub>",                 "int"],
    71: ["Lab ID",                                       "string"]
    }
}

// hardcoded function of specific columns for right-panel
function getColNums() {
    return {
        "designer": table.column(".td_def_3").index(),
        "title": table.column(".td_def_2").index(),
        "sequence": table.column(".td_def_12").index(),
        "id": table.column(".td_def_1").index(),
        "round": table.column(".td_def_5").index(),
        "description": table.column(".td_def_4").index(),
        "score": table.column(".td_def_11").index(),
        "flag": -1
    };
}


