    // --- Column selection ---------------
function fillColumns() {
    var columns = gaColumns.map ( function (item, index){ return item[1] })

    //updateOptions( "#Columns", columns );

}

// generate left-panel pcolumn selections from meta data; called once on init()
function drawColumnSetOptions(gAvailableColumns) {
    var columnNameIndex = gColumnsColumnIndex['Column_Name']; // !!! kludge gColumnIndex['Column_ID']; not 0
/*
    var columnNameIndex = gColumnIndex['Column_Label'];
    var projectIDIndex = gColumnIndex['Project_ID'];
    var projectNameIndex = gColumnIndex['Project_Name'];
    var synthesisRoundIndex = gColumnIndex['Synthesis_Round'];
*/
    var html = "";
    for (i in gAvailableColumns)  {
        html += '<li class="clickable gray-button centered rounded-5 type-of-displayed-info" id="col-XXX' + gAvailableColumns[i] + '">';
        html += '<div class="gray-button-bg"></div>';
        html += '<div class="column-title"><label><input type="checkbox" id="col-choice-' + gAvailableColumns[i] +'" class="col-sort-chk-"/>' +gAvailableColumns[i] + '</label></div>';
        html += '</li>';
    }
    $("#column-info").html(html);

    // retrieve filters from local storage
    if (typeof(Storage) !== "undefined") {
        for (var i = 0; i < gaColumns.length; i++) {
            if (localStorage.getItem("col-choice-" + gaColumns[i][columnNameIndex]) == "true") {
                $("#col-choice-" + gaColumns[i][columnNameIndex]).trigger("click");
                // has to do this since events are not bind yet
                $("#col-choice-" + gaColumns[i][columnNameIndex]).parent().addClass("light-green-font");
                gaColumnsToDownload.push(gaColumns[i][columnNameIndex]);
            }
        }
    }
/*
    // if no lab_id selected, by default load the last lab only
    if (typeof(Storage) == "undefined" || !gaColumnsToDownload.length) {
        var id = $("[id^='col-chk-']").last().attr("id");
        id = id.substring(id.lastIndexOf("-") + 1, id.length);
        gaColumnsToDownload.push(iColumnd);

        $("[id^='col-chk-']").last().trigger("click");
        // has to do this since events are not bind yet
        $("[id^='col-chk-']").last().parent().addClass("light-green-font");
    }
*/
}

// initiate left-panel Column selections
function initColumnSelections() {
    var columnNameIndex = gColumnsColumnIndex['Column_Name']; // !!! kludge gColumnIndex['Column_ID']; not 0


    drawColumnSetOptions(gAvailableColumns);

    // when Column selection changes
    $("[id^='col-choice-']").on("click", function() {
        var id = $(this).attr("id");
        id = id.substring(id.lastIndexOf("-") + 1, id.length);

        // render color change green/gray
        if ($(this).is(":checked")) {
            $(this).parent().addClass("light-green-font");
            gaColumnsToDownload.push(id);
        } else {
            $(this).parent().removeClass("light-green-font");
            gaColumnsToDownload.splice(gaColumnsToDownload.indexOf(id), 1);
        }

        // save to localStorage
        if (typeof(Storage) !== "undefined") {
            for (var i = 0; i < gaColumns.length; i++) {
                localStorage.setItem("col-choice-" + gaColumns[i][columnNameIndex], $("#col-choice-" + gaColumns[i][columnNameIndex]).is(":checked"));
            }
        }
    });
/*
    // auto show/hide project info on hover
    $("[id^='lab-sele-']").hover(function() {
        $(".column-title > label > span", this).show();
    }, function() {
        $(".column-title > label > span", this).hide();

    });
    $("[id^='lab-sele-'] > .column-title > label > span").hide();

    // refresh page based on new lab selection
    // new selection is saved in localStorage, upon refresh, it retrieves the info and save as gaColumnsToDownload, then compose the data query
    $("#lab-set-btn").on("click", function() {
        if (gaColumnsToDownload.length) {
            $("#loading-dialog").dialog("open");
            $("#loading-dialog").css({"min-height": 0, "padding-top": 0});
            location.reload();
        } else {
            table.clear().draw();
        }
    });
    // uncheck all labs
    $("#lab-reset-btn").on("click", function() {
        $("[id^='lab-chk-']:checked").trigger("click");
    });
*/
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


