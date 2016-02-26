// global setTimeout timers to reduce event handling overlapping fire
var timer_col_sort_o2t = 0, timer_col_sort_t2o = 0, timer_tab_sort = 0, timer_tab_reorder = 0, timer_col_filter_keyup = 0, timer_col_sort = 0;
var filter_inputs = [];

// sync column selection from left-panel to table
function updateColSeleOpt2Table() {
    if (DEBUG) { console.log("sele, o->t"); }
    var new_sele = [];
    // use original order for assignment, tracked by "id" and "class" names
    for (var i = 0; i < n_fields; i++) {
        new_sele.push($("#col-sort-chk-" + gaDownloadedColumns[i]).is(":checked"));
    }
    for (var i = 0; i < n_fields; i++) {
        table.column(".td_def_" + i.toString()).visible(new_sele[i]);
    }
    updateColSortOpt2Table();
}

// sync column selection from table to left-panel
function updateColSeleTable2Opt() {
    if (DEBUG) { console.log("sele, t->o"); }
    var new_sele = [];
    // use original order for assignment, tracked by "id" and "class" names
    for (var i = 0; i < n_fields; i++) {
        new_sele.push(table.column(".td_def_" + i.toString()).visible());
    }

    for (var i = 0; i < n_fields; i++) {
        $("#col-sort-chk-" + gaDownloadedColumns[i]).prop("checked", new_sele[i]);
    }
}

// sync column ordering from left-panel to table
function updateColOrderOpt2Table() {
    if (DEBUG) { console.log(">>> updateColOrderOpt2Table"); }
    if (DEBUG) { console.log("reorder, o->t"); }

    // Get the old ordering from the table itself, and compute the permutation vector
    var old_order = table.colReorder.order(), reorder = new Array(n_fields);
    if (DEBUG) { console.log("old table column order = " + old_order.join(",")); }

    // Assumption: the HTML has already changed, so compute the new table column ordering from it
    var new_name_order = $("#displayed-info").sortable("toArray"), html = '';
    if (DEBUG) { console.log("new_name_order = " + new_name_order.join(",")); }
    if (DEBUG) { console.log(gDataColumnIndex); }
    var new_order = [];
    for (var i = 0; i < n_fields; i++) {
        new_order[i] = gaDownloadedColumnIndex[new_name_order[i].replace("col-opt-", "")];
    }
    if (DEBUG) { console.log("requested new order = " + new_order.join(",")); }

    // Compute the reorder vector
    // colReorder.order() returns different ordering between GET and SET
    // GET is on base of "original", SET is on base of "current", need conversion
    for (var i = 0; i < n_fields; i++) {
        reorder[i] = old_order.indexOf(new_order[i]);
    }

    // Re-order the table columns
    table.colReorder.order(reorder);

    // Update gDataColumnIndex to the new ordering
    for (i = 0; i < new_order.length; i++) { 
        gDataColumnIndex[gaDownloadedColumns[new_order[i]]] = i; 
    }
    if (DEBUG) { console.log("<<< updateColOrderOpt2Table"); }
}

// sync column ordering from table to left-panel
function updateColOrderTable2Opt() {
    if (DEBUG) { console.log("reorder, t->o"); }

    // The table's representation of the data has been rearranged; bring our data structures up to date.
    //updateColumnTracking();

    var new_order = table.colReorder.order(), old_filter = [], html = '';
    if (DEBUG) { console.log("new order = " + new_order); }

    // use original order for assignment, tracked by "id" and "class" names
    var dataTypeIndex = gColumnsColumnIndex["Siqi_sub_1"];
    if ($("#col-opt-" + gaDownloadedColumns[new_order[i]]).length) {
        for (var i = 0; i < n_fields; i++) {
            var iSpec = gColumnsRowIndex[gaDownloadedColumns[i]];
            html += $("#col-opt-" + gaDownloadedColumns[new_order[i]])[0].outerHTML;
            // retain filter input val() for newly created DOM elements
            if (gaColumnSpecification[iSpec][dataTypeIndex] == "int" || gaColumnSpecification[iSpec][dataTypeIndex] == "float") {
                old_filter.push([parseFloat($("#col-filter-min-" + gaDownloadedColumns[i]).val()), parseFloat($("#col-filter-max-" + gaDownloadedColumns[i]).val())]);
            } else {
                old_filter.push([$("#col-filter-str-" + gaDownloadedColumns[i]).val()]);
            }
        }
    }

    // $("#displayed-info").empty().html(html); //!!!?
    updateColSeleTable2Opt();
    bindOptBlockEvent();

    // restore filter inputs
    if (old_filter.length) {
        for (var i = 0; i < n_fields; i++) {
            var iSpec = gColumnsRowIndex[gaDownloadedColumns[i]]; //!!! filter IDs TBD
            if (gaColumnSpecification[iSpec][dataTypeIndex] == "int" || gaColumnSpecification[iSpec][dataTypeIndex] == "float") {
                $("#col-filter-min-" + gaDownloadedColumns[i]).val(old_filter[i][0]);
                $("#col-filter-max-" + gaDownloadedColumns[i]).val(old_filter[i][1]);
            } else {
                $("#col-filter-str-" + gaDownloadedColumns[i]).val(old_filter[i][0]);
            }
        }
    }

    // The table's representation of the data has been rearranged; bring our data structures up to date.
    updateColumnTracking();
}

// sync column sorting from left-panel to table
function updateColSortOpt2Table() {
    clearTimeout(timer_col_sort_o2t);
    timer_col_sort_o2t = setTimeout(function() {
        if (DEBUG) { console.log("sort, o->t"); }
        var sort_array = [];
        // order() {i.e. "sort"} returns index on the base of "current"
        $(".col-sort-opt").each(function(i) {
            if ($(this).html() != "none") {
                sort_array.push([i, $(this).html()]);
            }
        });
        // avoid error when no sort at all
        if (!sort_array.length) {
            // has to use different mechanism
            // dataTable() not DataTable(), and weird method prefixes
            $("#center-table").dataTable().fnSettings().aaSorting = [];
        } else {
            table.order(sort_array);
        }
        table.draw();
    }, 50);
}

// sync column sorting from table to left-panel
function updateColSortTable2Opt() {
    // prevent overlapping firing of this event!
    clearTimeout(timer_col_sort_t2o);
    timer_col_sort_t2o = setTimeout(function() {
        if (DEBUG) { console.log("sort, t->o"); }
        // this is usually in a blink of eye, thus to avoid flashing screen
        // if (!$("#loading-dialog").dialog("isOpen")) {
        //     $("#loading-dialog").dialog("open");
        //     $("#loading-dialog").css({"min-height": 0, "padding-top": 0});
        // }
        setTimeout(function() {
            var sort = table.order();
            // order() {i.e. "sort"} takes index on the base of "current"
            $(".col-sort-opt").html("none");
            for (var i = 0; i < sort.length; i++) {
                var arr = sort[i];
                $(".col-sort-opt").eq(arr[0]).html(arr[1]);
            }

            // sync sort with right-hand panel
            syncSele2D();
            $("#loading-dialog").dialog("close");
        }, 25);
    }, 50);
}

// bind/rebind events for checkboxes and filter inputs
// because on each order() event, they are cleared and recreated in DOM
function bindOptBlockEvent() {
    var dataTypeIndex = gColumnsColumnIndex["Siqi_sub_1"];
    if (DEBUG) { console.log("bind-trigger"); }

    // event for check/uncheck columns
    $("input[id^='col-sort-chk-']").unbind("click");
    $("input[id^='col-sort-chk-']").bind("click", function() {
        if (DEBUG) { console.log("click-checkbox"); }
        var id = $(this).attr("id");
        id = id.substring(id.lastIndexOf("-") + 1, id.length);
        if (!$(this).is(":checked")) {
            // restore sorting to "none" if column is not selected
            $(this).parent().parent().next().html("none");
            // disable filter if column is not selected
            if ($("#col-filter-str-" + id).length) {
                $("#col-filter-str-" + id).attr("disabled", "disabled");
                $("#col-filter-str-" + id).trigger("change");
            } else {
                $("#col-filter-min-" + id).attr("disabled", "disabled");
                $("#col-filter-max-" + id).attr("disabled", "disabled");
                $("#col-filter-min-" + id).trigger("change");
            }
        } else {
            if ($("#col-filter-str-" + id).length) {
                $("#col-filter-str-" + id).removeAttr("disabled");
                $("#col-filter-str-" + id).trigger("change");
            } else {
                $("#col-filter-min-" + id).removeAttr("disabled");
                $("#col-filter-max-" + id).removeAttr("disabled");
                $("#col-filter-min-" + id).trigger("change");
            }
        }
        if (!$("#loading-dialog").dialog("isOpen")) {
            $("#loading-dialog").dialog("open");
            $("#loading-dialog").css({"min-height": 0, "padding-top": 0});
        }
        setTimeout(function() {
            updateColSeleOpt2Table();
            $("#loading-dialog").dialog("close");
        }, 5);
    });

    // event for sort column by click on display options' "asc,desc,none"
    $("#displayed-info").on("click", "li > .col-sort-opt", function(e) {
        clearTimeout(timer_col_sort);
        timer_col_sort = setTimeout(function(sort_opt) {
            // disable sorting option if column is not selected
            if (sort_opt.prev().children().children().is(":checked")) {
                // loop through "none", "asc" and "desc"
                if (sort_opt.html() == "none") {
                    sort_opt.html("asc");
                } else if (sort_opt.html() == "asc") {
                    sort_opt.html("desc");
                } else {
                    sort_opt.html("none");
                }
                if (!$("#loading-dialog").dialog("isOpen")) {
                    $("#loading-dialog").dialog("open");
                    $("#loading-dialog").css({"min-height": 0, "padding-top": 0});
                }
                setTimeout(function() {
                    updateColSortOpt2Table();
                    $("#loading-dialog").dialog("close");
                }, 5);
            }
        }, 50, $(this));
    });

    // on-the-fly filtering and one-click reset
    $("[id^='col-filter-']").on("keyup change", function() { 
        // prevent overlapping firing of this event!
        // 200 ms delay is OK in performance, and saves a lot of processing when user is typing fast
        clearTimeout(timer_col_filter_keyup);
        timer_col_filter_keyup = setTimeout( function () {
            build_filter_inputs_array();
            table.draw();
        }, 150);

        // store filters in local storage
        if (typeof(Storage) !== "undefined"  && !gOptions.noPersistence) {
            for (var i = 0; i < n_fields; i++) {
                var iSpec = gColumnsRowIndex[gaDownloadedColumns[i]];
                if (gaColumnSpecification[iSpec][dataTypeIndex] == "int" || gaColumnSpecification[iSpec][dataTypeIndex] == "float") {
                    localStorage.setItem("col-filter-min-" + gaDownloadedColumns[i], parseFloat($("#col-filter-min-" + gaDownloadedColumns[i]).val()));
                    localStorage.setItem("col-filter-max-" + gaDownloadedColumns[i], parseFloat($("#col-filter-max-" + gaDownloadedColumns[i]).val()));
                } else {
                    localStorage.setItem("col-filter-str-" + gaDownloadedColumns[i], $("#col-filter-str-" + gaDownloadedColumns[i]).val());
                }
            }
            localStorage.setItem("col-regex-toggle", $("#regex-toggle").is(":checked"));
        }
    });
}

// generate left-panel column display options from meta data; called once on init()
function drawColDisplayOptions(gaColumnSpecification) {
    if (pageLayout.state.west.isHidden) return;
    var dataTypeIndex = gColumnsColumnIndex["Siqi_sub_1"];
    var html = "";
    for (var i = 0; i < n_fields; i++) {
        var iSpec = gColumnsRowIndex[gaDownloadedColumns[i]];
        var columnName = gaDownloadedColumns[i];
        html += '<li class="clickable gray-button centered rounded-5 type-of-displayed-info" id="col-opt-' + columnName + '">';
        html += '<div class="gray-button-bg"></div>';
        html += '<div class="column-title"><label><input type="checkbox" id="col-sort-chk-' + columnName +'" class="col-sort-chk"/>' + gaColumnSpecification[iSpec][0] + '</label><span style="float:right;">';
        if (gaColumnSpecification[iSpec][dataTypeIndex] == "int" || gaColumnSpecification[iSpec][dataTypeIndex] == "float") {
            html += '<input id="col-filter-min-' + gaDownloadedColumns[i] + '" type="number" placeholder="min" class="col-filter-num">&nbsp;&nbsp;<input id="col-filter-max-' + gaDownloadedColumns[i] + '" type="number" placeholder="max" class="col-filter-num"/>';
        } else {
            html += '<input id="col-filter-str-' + gaDownloadedColumns[i] + '" type="text" placeholder="" class="col-filter-txt"/>';
        }
        html += '</span></div><div class="col-sort-opt rounded-small" id="col-sort-opt-' + gaDownloadedColumns[i] + '">none</div></li>';
    }
    $("#displayed-info").html(html);

    // retrieve filters from local storage
    if (typeof(Storage) !== "undefined"  && !gOptions.noPersistence) {
        for (var i = 0; i < n_fields; i++) {
            var iSpec = gColumnsRowIndex[gaDownloadedColumns[i]];
            if (gaColumnSpecification[iSpec][dataTypeIndex] == "int" || gaColumnSpecification[iSpec][dataTypeIndex] == "float") {
                $("#col-filter-min-" + gaDownloadedColumns[i]).val(localStorage.getItem("col-filter-min-" + gaDownloadedColumns[i]));
                $("#col-filter-max-" + gaDownloadedColumns[i]).val(localStorage.getItem("col-filter-max-" + gaDownloadedColumns[i]));
            } else {
                $("#col-filter-str-" + gaDownloadedColumns[i]).val(localStorage.getItem("col-filter-str-" + gaDownloadedColumns[i]));
            }
        }
    }
}

// initialize left-panel column selection accordion

function initColOpt() {
    // update options from tabel state on init()
    $("#displayed-info").sortable({
        "handle": ".column-title",
        // autoscroll when picked an item before dropping, for long lists
        "scroll": true,
        "scrollSensitivity": 75,
        "scrollSpeed": 15,
    });
    updateColOrderTable2Opt();
    // duplicated event, this is triggered elsewhere
    // updateColSortTable2Opt();

    // update table on-the-fly when user drag-and-drop a column option
    $("#displayed-info").on("sortstop", function() {
        if (DEBUG) { console.log("opt-drag-drop"); }
        if (!$("#loading-dialog").dialog("isOpen")) {
            $("#loading-dialog").dialog("open");
            $("#loading-dialog").css({"min-height": 0, "padding-top": 0});
        }
        setTimeout(function() {
            updateColOrderOpt2Table(); 
            $("#loading-dialog").dialog("close");
        }, 10);	// 5 too short a time for HTML to settle?
    });

    // update options from table when user drag-and-drop a column <th> on table
    table.on("column-reorder", function(e) {
        e.stopPropagation();
        clearTimeout(timer_tab_reorder);
        timer_tab_reorder = setTimeout(function() { 
            updateColOrderTable2Opt();
        }, 50);
    });

    // update options from table when user click sorting on column <th> on table
    $("th[class^='th_def_']").on("click", function(e) {
    // $("#center-table").on("order.dt", function(e) {
        // prevent overlapping firing of this event!
        clearTimeout(timer_tab_sort);
        timer_tab_sort = setTimeout(function() {
            if (DEBUG) { console.log("th-click"); }
            if (!$("#loading-dialog").dialog("isOpen")) {
                $("#loading-dialog").dialog("open");
                $("#loading-dialog").css({"min-height": 0, "padding-top": 0});
            }
            e.stopPropagation();
            setTimeout(function() {
                updateColSortTable2Opt();
                $("#loading-dialog").dialog("close");
            }, 5);
        }, 50);
    });

    // check all columns for display
    $("#sele-all-btn").on("click", function() {
        if (!$("#loading-dialog").dialog("isOpen")) {
            $("#loading-dialog").dialog("open");
            $("#loading-dialog").css({"min-height": 0, "padding-top": 0});
        }
        setTimeout(function() {

/* Not sure what this was trying to protect against, but it causes more problems than it solves now (2/5/16)
            // see if any column is displayed before
            var flag = false;
            for (var i = 0; i < n_fields; i++) {
                if ($("#col-sort-chk-" + gaDownloadedColumns[i]).prop("checked")) {
                    flag = true;
                    break;
                }
            }
*/
            $("input[id^='col-sort-chk-']").prop("checked", true);
            $("[id^='col-filter-']").removeAttr("disabled");
            // if tabel init() with no column selected, it will always be empty even if all are checked now
            // so refresh the page to show things
            //if (!flag) { location.reload(); } //!!! this is causing problems.  What problem was it supposed to solve?  See note above
            updateColSeleOpt2Table();
            $("#loading-dialog").dialog("close");
        }, 5);
    });

    // uncheck all columns, will result in empty table
    $("#sele-none-btn").on("click", function() {
        if (!$("#loading-dialog").dialog("isOpen")) {
            $("#loading-dialog").dialog("open");
            $("#loading-dialog").css({"min-height": 0, "padding-top": 0});
        }
        setTimeout(function() {
            $("input[id^='col-sort-chk-']").prop("checked", false);
            $("[id^='col-filter-']").attr("disabled", "disabled");
            updateColSeleOpt2Table();
            $("#loading-dialog").dialog("close");
        }, 5);
    });

    // reset sort all to "none"
    $("#sort-reset-btn").on("click", function() {
        if (!$("#loading-dialog").dialog("isOpen")) {
            $("#loading-dialog").dialog("open");
            $("#loading-dialog").css({"min-height": 0, "padding-top": 0});
        }
        setTimeout(function() {
            $(".col-sort-opt").html("none");
            updateColSortOpt2Table();
            $("#loading-dialog").dialog("close");
        }, 5);
    });

}

function build_filter_inputs_array () {
    filter_inputs = [];
    var dataTypeIndex = gColumnsColumnIndex["Siqi_sub_1"];
    for (var i = 0; i < n_fields; i++) {
        var iSpec = gColumnsRowIndex[gaDownloadedColumns[i]];
        if (gaColumnSpecification[iSpec][dataTypeIndex] == "int" || gaColumnSpecification[iSpec][dataTypeIndex] == "float") {
            // exclude disabled filters
            if ($("#col-filter-min-" + gaDownloadedColumns[i]).is(":disabled")) { continue; }
            var min = parseFloat($("#col-filter-min-" + gaDownloadedColumns[i]).val());
            var max = parseFloat($("#col-filter-max-" + gaDownloadedColumns[i]).val());
            // don't waste time on getting data and intersect if both NaN
            if (isNaN(min) && isNaN(max)) { continue; }
            filter_inputs.push([i, min, max]);
        } else {
            if ($("#col-filter-str-" + gaDownloadedColumns[i]).is(":disabled")) { continue; }
            var regex = $("#col-filter-str-" + gaDownloadedColumns[i]).val();
            if (!(regex && regex.length)) { continue; }
            // decide whether valid regex
            // var flag = true;
            if ($("#regex-toggle").is(":checked")) {
                try { 
                    regex = new RegExp(regex, "i");
                    // dead spot of regex chars
                    // if (regex.replace(/\^/g,"").replace(/\$/g,"").replace(/\./g,"").replace(/\|/g,"").replace(/\{/g,"").replace(/\}/g,"").length == 0) { throw 0; }
                } catch(e) {
                    // ignore invalid regex
                    continue;
                    // flag = false;
                }
            } else {
                regex = regex.toLowerCase();
            }
            // filter_inputs.push([i, regex, flag]);
            filter_inputs.push([i, regex]);
        }
    }
}

// initiate left-panel filter inputs
function initFilterInput() {
    // custom search/filter function for all columns together
    $.fn.dataTable.ext.search.push(function( settings, data, dataIndex ) {
        // return boolean for whether row meets filter
        var flag = true;
        var dataTypeIndex = gColumnsColumnIndex["Siqi_sub_1"];
        for (var i = 0; i < filter_inputs.length; i++) {
            var idx = filter_inputs[i][0];
            var iSpec = gColumnsRowIndex[gaDownloadedColumns[idx]];
            if (gaColumnSpecification[iSpec][dataTypeIndex] == "int" || gaColumnSpecification[iSpec][dataTypeIndex] == "float") {
                var min = filter_inputs[i][1];
                var max = filter_inputs[i][2];
                var num = extractNumCell(data[table.column(".td_def_" + idx).index()]);
                flag = flag && ( (isNaN(min) && num <= max) || (min <= num && isNaN(max)) || (min <= num && num <= max) );
            } else {
                var regex = filter_inputs[i][1];
                var txt = $("<p>" + data[table.column(".td_def_" + idx).index()] + "</p>").text().trim().toLowerCase();
                if ($("#regex-toggle").is(":checked")) {
                    match = txt.match(regex);
                    flag = flag && (match && match.length > 0);
                } else {
                    flag = flag && (txt.indexOf(regex) != -1);
                }
            }
        }

        // Added so filters are applied when table is first displayed
        build_filter_inputs_array();
        return flag;
    });

    // reset all filter inputs
    $("#filter-reset-btn").on("click", function() {
        if (!$("#loading-dialog").dialog("isOpen")) {
            $("#loading-dialog").dialog("open");
            $("#loading-dialog").css({"min-height": 0, "padding-top": 0});
        }
        setTimeout(function() {
            $("[id^='col-filter-']").val("");
            // refresh all filters to table by trigger
            if ($("#col-filter-str-" + gaDownloadedColumns[0]).length) {
                $("#col-filter-str-" + gaDownloadedColumns[0]).trigger("change");
            } else {
                $("#col-filter-str-" + gaDownloadedColumns[0]).trigger("change");
            }
            $("#loading-dialog").dialog("close");
        }, 5);
    });

    $("#regex-toggle").on("change", function() {
        if (typeof(Storage) !== "undefined"  && !gOptions.noPersistence) {
            localStorage.setItem("col-regex-toggle", $(this).is(":checked"));
            if ($(this).is(":checked")) {
                $("[id^='col-filter-str-']").attr("placeholder", "regex");
            } else {
                $("[id^='col-filter-str-']").attr("placeholder", "");
            }
        }
    });
    // retrieve regex toggle state
    if (typeof(Storage) !== "undefined"  && !gOptions.noPersistence) {
        if (localStorage.getItem("col-regex-toggle") == "true") {
            $("#regex-toggle").trigger("click");
        }
    }
}

// generate left-panel puzzle selections from meta data; called once on init()
function drawPuzzleSetOptions(gaPuzzles) {
    var puzzleIDIndex = gPuzzleIndex['Puzzle_ID'];
    var puzzleNameIndex = gPuzzleIndex['Puzzle_Name'];
    var projectIDIndex = gPuzzleIndex['Project_ID'];
    var projectNameIndex = gPuzzleIndex['Project_Name'];
    var synthesisRoundIndex = gPuzzleIndex['Synthesis_Round'];
    var html = "";
    for (var i = 0; i < gaPuzzles.length; i++) {
        html += '<li class="clickable gray-button centered rounded-5 type-of-displayed-info" id="lab-sele-' + gaPuzzles[i][3] + '">';
        html += '<div class="gray-button-bg"></div>';
        html += '<div class="column-title"><label><input type="checkbox" id="lab-chk-' + gaPuzzles[i][puzzleIDIndex] +'" class="col-sort-chk"/><b>' + gaPuzzles[i][puzzleNameIndex] + '</b><span><br/><i style="text-transform:none;">Project</i> : <u style="text-transform:none;">' + gaPuzzles[i][projectNameIndex] + '</u></span></label></div>';
        html += '<div class="lab-sele rounded-small">R' + gaPuzzles[i][synthesisRoundIndex] + '</div>';
        html += '</li>';
    }
    $("#puzzle-list").html(html);

    // retrieve filters from local storage
    if (typeof(Storage) !== "undefined"  && !gOptions.noPersistence) {
        for (var i = 0; i < gaPuzzles.length; i++) {
            if (localStorage.getItem("lab-chk-" + gaPuzzles[i][puzzleIDIndex]) == "true") {
                $("#lab-chk-" + gaPuzzles[i][puzzleIDIndex]).trigger("click");
                // has to do this since events are not bind yet
                $("#lab-chk-" + gaPuzzles[i][puzzleIDIndex]).parent(); // .addClass("light-green-font"); // !!! Is color change helpful?  If so, need more fg/bg contrast
                gaSelectedPuzzles.push(gaPuzzles[i][puzzleIDIndex]);
            }
        }
    }
/*
    // if no lab_id selected, by default load the last lab only
    if (typeof(Storage) == "undefined" || !gaSelectedPuzzles.length) {
        var id = $("[id^='lab-chk-']").last().attr("id");
        id = id.substring(id.lastIndexOf("-") + 1, id.length);
        gaSelectedPuzzles.push(id);

        $("[id^='lab-chk-']").last().trigger("click");
        // has to do this since events are not bind yet
        $("[id^='lab-chk-']").last().parent().addClass("light-green-font");
    }
*/
}

function updateCenterTitle() {
    // update center panel title with names of selected puzzles
    if ( pageLayout.state.west.isHidden ) return;
    var myPuzzleNames = [];
    $("[id^='lab-chk-']").each( function(){
        //myPuzzleNames.push( /<b>(.*)<\/b>/.exec($(this).html())[1] );
        if($(this).is(":checked"))
            myPuzzleNames.push( /<b>(.*)<\/b>/.exec($(this).parent().html())[1]);
    });
    $("#lab-title").html( myPuzzleNames.join(", ") );
}

// initiate left-panel puzzle selections
function initPuzzleSelections() {
    var puzzleIDIndex = gPuzzleIndex['Puzzle_ID'];

    drawPuzzleSetOptions(gaPuzzles);

    updateCenterTitle();

    // when puzzle selection changes
    $("[id^='lab-chk-']").on("click", function() {
        var id = $(this).attr("id");
        id = id.substring(id.lastIndexOf("-") + 1, id.length);

        // render color change green/gray
        if ($(this).is(":checked")) {
            // $(this).parent().addClass("light-green-font"); // !!! Is color change helpful?  If so, need more fg/bg contrast
            gaSelectedPuzzles.push(id);
        } else {
            $(this).parent().removeClass("light-green-font"); // !!! Is color change helpful?  If so, need more fg/bg contrast
            gaSelectedPuzzles.splice(gaSelectedPuzzles.indexOf(id), 1);
        }
        
        updateCenterTitle();

        // save to localStorage
        if (typeof(Storage) !== "undefined"  && !gOptions.noPersistence) {
            for (var i = 0; i < gaPuzzles.length; i++) {
                localStorage.setItem("lab-chk-" + gaPuzzles[i][puzzleIDIndex], $("#lab-chk-" + gaPuzzles[i][puzzleIDIndex]).is(":checked"));
            }
        }

    });

    // auto show/hide project info on hover
    $("[id^='lab-sele-']").hover(function() {
        $(".column-title > label > span", this).show();
    }, function() {
        $(".column-title > label > span", this).hide();

    });
    $("[id^='lab-sele-'] > .column-title > label > span").hide();

    // refresh page based on new lab selection
    // new selection is saved in localStorage, upon refresh, it retrieves the info and save as gaSelectedPuzzles, then compose the data query
    $("#column-select-btn").on("click", function() {
        if (gaSelectedPuzzles.length) {
            gProjectIDs = {};
            for (var i = 0; i < gaPuzzles.length; i++) {
                if ($("#lab-chk-" + gaPuzzles[i][3]).is(":checked"))
                    gProjectIDs[gaPuzzles[i][0]] = true;
            } 
            fetchColumns( function() {
		$(".ui-layout-center > h1").html('Now select one or more columns to download.<br><br>Then click on the "Load Data" button.');
		$("#tab-panel-west-2").click();
            });
        } else {
            alert("Select one or more puzzles before selecting columns");
            //table.clear().draw();
        }
    });

    // uncheck all labs
    $("#lab-reset-btn").on("click", function() {
        $("[id^='lab-chk-']:checked").trigger("click");
    });
}

