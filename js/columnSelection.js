// --- Column selection ---------------
function fillColumns() {
    var columns = gaColumns.map ( function (item, index){ return item[1] })

    //updateOptions( "#Columns", columns );

}

// generate left-panel pcolumn selections from meta data; called once on init()
function drawColumnSetOptions(gAvailableColumns) {
    var columnNameIndex = gColumnsColumnIndex['Column_Name'];  // Switch to Column_Label?
    var columnLabelIndex = gColumnsColumnIndex['Column_Label'];

    var html = "";
    for (i in gAvailableColumns)  {
        html += '<li class="clickable gray-button centered rounded-5 type-of-displayed-info" id="col-XXX' + gAvailableColumns[i] + '">';
        html += '<div class="gray-button-bg"></div>';
        html += '<div class="column-title"><label><input type="checkbox" id="col-choice-' + gAvailableColumns[i] +'" class="col-sort-chk"/>' + gAvailableColumns[i]+ '</label></div>'; //!!! fix hard coded subscript 1
        html += '</li>';
    }
    $("#column-info").html(html);

    // retrieve filters from local storage
    if (typeof(Storage) !== "undefined" && !gOptions.noPersistence) {
        for (var i = 0; i < gaColumns.length; i++) {
            var selectionStr = "col-choice-" + gaColumns[i][columnNameIndex];
            if (localStorage.getItem( selectionStr ) == "true" && !$("#" + selectionStr).is(":checked")) {
                $("#" + selectionStr).trigger("click");
                // has to do this since events are not bind yet
                //$("#" + selectionStr]).parent().addClass("light-green-font"); // !!! Is color change helpful?  If so, needs more fg/bg contrast
                gaColumnsToDownload.push(gaColumns[i][columnNameIndex]);
            }
        }
    }
    else if (gOptions.noPersistence){
        for (var i = 0; i < gaColumns.length; i++) {
            gaColumnsToDownload.push(gaColumns[i][columnNameIndex]);
        }
    }
    // !!! What about the first experience, where no column selection has been persisted?  Where is a default set?
}

// initiate left-panel Column selections
function initColumnSelections() {
    var columnNameIndex = gColumnsColumnIndex['Column_Name']; // Switch to displaying Column_Label in UI?
    var columnLabelIndex = gColumnsColumnIndex['Column_Label'];

    drawColumnSetOptions(gAvailableColumns);

    // when Column selection changes
    $("[id^='col-choice-']").on("click", function() {
        var id = $(this).attr("id");
        var columnName = id.substring(id.lastIndexOf("-") + 1, id.length);

        // Add or remove column to/from gaColumnsToDownload
        if ($(this).is(":checked")) {
            gaColumnsToDownload.push(columnName);
        } else {
            // Don't allow mandatory columns to be removed
            if (columnName == "Project_ID" || columnName == "Design_ID") {
                $(this).trigger("click");
            } else {
                gaColumnsToDownload.splice(columnName, 1);
            }
        }

        // save to localStorage
        if (typeof(Storage) !== "undefined" && !gOptions.noPersistence) {
            for (var i = 0; i < gaColumns.length; i++) {
                localStorage.setItem("col-choice-" + gaColumns[i][columnNameIndex], $("#col-choice-" + gaColumns[i][columnNameIndex]).is(":checked"));
            }
        }
    });

    $("#load-data-btn").on("click", function() {
        if (gaColumnsToDownload.length) {
            if (tableNotLoaded) {
                fetchData( function() {
                    $("#tab-panel-west-3").click(); // Open Display Control accordion
                });
            }
            else {
                // It's unclear how to reload a table, given our use of the DataTables "data" option.
                // Long term, it might be best to switch to the more modern "ajax" option; it seems to have the hooks we need.
                // For the short term, we'll reload the page, with the query string option to go directly to loading the table.
                location = location = location.pathname + "?exec=fetchAllData";
/*
                // Try this
                //dataAjaxSuccess(data);
                // init column options and headers according to query
                drawColDisplayOptions(gaColumnSpecification);
                drawColHeaders(gaColumnSpecification);
                $(".ui-layout-center > h1").html("Loading Table...");

                table.destroy();
                tableNotLoaded = true;
                fetchData( function() {
                    $("#tab-panel-west-3").click(); // Open Display Control accordion
                })
*/
            }
        }
        else {
             alert("Select one or more columns before downloading data");
        }
    });


}



/* -- Unsuccessful attempt to get JQuery multselection extension to work with dataTables

(function sizeColumnSelections () {
    $(".ui-multiselect").width("90%"); //resizes "buttons", but not exactly as expected.
    $(".ui-multiselect-menu").width($(".ui-multiselect").width());
    $(".ui-multiselect-header").width("100%");
    $(".ui-helper-reset").width("100%");
})();


    // --- General multiselect ---

    $(function(){
	$("select").multiselect({
            //autoOpen: true,
            selectedList: 10,
            noneSelectedText: '(click to filter)',
            click: onClick
        }).multiselectfilter();
    });

    function onClick( event, UI ){
      //alert(JSON.stringify($("#Rounds").multiselect("getChecked")));
    }

    function updateOptions( selector, sourceArray ) {
      // Currently only called for selector = "#Columns"
      // get the selection
      var element = $(selector);
      // clear all options
      element.empty();
      // add the current ones back
      for (i = 0; i < sourceArray.length; i++) element.append( "<option value='"  + sourceArray[i] + "'>" + sourceArray[i] + "</option>" );
      // refresh the DOM 
      element.multiselect("refresh");

    }

    function fixUpMultiselects() {
      // !!! Not sure where this is best done, or whether it should be restricted to columns or ...
      $(".ui-multiselect").width("90%")
      $(".ui-multiselect-menu").width($(".ui-multiselect").width())
      $(".ui-multiselect-header").width("100%")
      $(".ui-helper-reset").width("100%")

    }
*/
/*
    $("#selections_panel").layout({
        onopen_end: function () {
            // alert("");
            return true; // false = Cancel
        }
    });
*/

    //$("#selections_panel").resize( sizeColumnSelections );
 
/*

    function updateAllOptions() {
      if (!bInitialQueryComplete) {
          setTimeout(function(){ updateAllOptions(); },200);
          return;
      }
      updateOptions( "#Rounds", aSynthesisRounds );
      updateOptions( "#Projects", aProjectNames );
      updateOptions( "#Columns", aColumnNames );
    }

    
    $( document ).ready( updateAllOptions )

*/


