/* center contextMenu.js 
 *
 * Copyright (C) 2015 Eterna Commons at Stanford University
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD-3-Clause license.  See the LICENSE.md file for details.
 */


// Copying arbitrary text to the clipboard involves hooking into the document.execCommand('copy') command.
var bScriptedCopy = false;	// Don't let our scripted copy interfere with the browser's normal copy operation

var clipboardText;

document.addEventListener('copy', function(e) {
     if (bScriptedCopy) {   
        var isIe = (navigator.userAgent.toLowerCase().indexOf("msie") != -1 
           || navigator.userAgent.toLowerCase().indexOf("trident") != -1);
        if (isIe) {
            window.clipboardData.setData('Text', clipboardText);    
        } else {
            e.clipboardData.setData('text/plain', clipboardText);
        }
        e.preventDefault();
    }
});


$.contextMenu({
    selector: '#center-table tbody tr',
    items: {
        copySequence: {
            name: "Copy sequence to clipboard",
            callback: function(key, opt){
                clipboardText = table.row($(this)[0]._DT_RowIndex).data()[gDataColumnIndex['Sequence']];
                bScriptedCopy = true;
                document.execCommand('copy');
                bScriptedCopy = false;
            }
        },
        copyURL: {
            name: "Copy URL to clipboard",
            callback: function(key, opt){
                var aRowData = table.row($(this)[0]._DT_RowIndex).data()
                clipboardText = 'http://www.eternagame.org/game/solution/' + 
                    aRowData[gDataColumnIndex['Puzzle_ID']] + '/' +  
                    aRowData[gDataColumnIndex['Design_ID']] + 
                    '/copyandview/';                                          
                bScriptedCopy = true;
                document.execCommand('copy');
                bScriptedCopy = false;
            }
        },
/* !!! TODO
        sort: {
            name: "Sort table by sequence similarity",
            callback: function(key, opt){
                alert("Clicked on " + key);
            }
        },
*/    
    }, 
});


