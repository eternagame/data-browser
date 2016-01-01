function RNATreeNode() {
    this.children = [];
    this.is_pair = false;
    this.index_a = -1;
    this.index_b = -1;
    this.x = 0;
    this.y = 0;
    this.go_x = 0;
    this.go_y = 0;
}

function printNode(rnaNode, prefix) {

    prefix = typeof prefix !== 'undefined' ? prefix : "";

    if( rnaNode == null) {
        console.log(prefix + "None");
        return;
    }

    console.log(prefix + "Pair " + rnaNode.is_pair);
    console.log(prefix + "From " + rnaNode.index_a);
    console.log(prefix + "To " + rnaNode.index_b);
    console.log(prefix + "X " + rnaNode.x);
    console.log(prefix + "Y " + rnaNode.y);
    console.log(prefix + "GoX " + rnaNode.go_x);
    console.log(prefix + "GoY " + rnaNode.go_y);

    if(typeof rnaNode.children === 'undefined') {
        console.log(prefix + "Children undefined.");
    } else {

        console.log(prefix + "Chlength " + rnaNode.children.length);

        for(var i = 0; i < rnaNode.children.length; i++) {
            console.log(prefix + "Child: ");
            // log(rnaNode.children[i]);
            printNode(rnaNode.children[i], prefix + " ");
        }
    }
}

function getPairmapFromSecstruct(secstruct) {
	var pair_stack = []
	var pair_arrays = []

	for(var i = 0; i < secstruct.length; i++) {
		pair_arrays.push(-1);
	}

	for(var i = 0; i < secstruct.length; i++) {
		if(secstruct.charAt(i) == '(') {
			pair_stack.push(i);
		} else if(secstruct.charAt(i) == ')') {
			var index = pair_stack.pop();
			pair_arrays[index] = i;
			pair_arrays[i] = index;
		}
	}

	return pair_arrays;

}

function addNodesRecursive(bi_pairs, rootnode, start_index, end_index) {
    if(start_index > end_index) {
        console.log("Error occured while drawing RNA " + start_index + " " + end_index);
        return;
    }

    var newnode = null;

    if(bi_pairs[start_index] == end_index) {
        newnode = new RNATreeNode();
        newnode.is_pair = true;
        newnode.index_a = start_index;
        newnode.index_b = end_index;
        addNodesRecursive(bi_pairs, newnode, start_index+1, end_index-1);
    } else {
        newnode = new RNATreeNode();
        var jj = start_index;
        while(jj <= end_index) {
            if(bi_pairs[jj] > jj) {
                addNodesRecursive(bi_pairs, newnode, jj, bi_pairs[jj]);
                jj = bi_pairs[jj] + 1;
            } else {
                newsubnode = new RNATreeNode();
                newsubnode.is_pair = false;
                newsubnode.index_a = jj;
                newnode.children.push(newsubnode);
                jj += 1;
            }
        }

    }

    rootnode.children.push(newnode);
}

function setupCoordsRecursive(rootnode, parentnode, start_x, start_y, go_x, go_y, NODE_R, PRIMARY_SPACE, PAIR_SPACE) {
	var cross_x = -go_y;
	var cross_y = go_x;
	var children_width = rootnode.children.length * NODE_R * 2;

	rootnode.go_x = go_x;
	rootnode.go_y = go_y;

	if (rootnode.children.length == 1) {
		rootnode.x = start_x;
		rootnode.y = start_y;

		if(rootnode.children[0].is_pair) {

            setupCoordsRecursive(rootnode.children[0], rootnode, start_x + go_x * PRIMARY_SPACE, start_y + go_y * PRIMARY_SPACE, go_x, go_y, NODE_R, PRIMARY_SPACE, PAIR_SPACE);

		} else if(!rootnode.children[0].is_pair && rootnode.children[0].index_a < 0) {

            setupCoordsRecursive(rootnode.children[0], rootnode, start_x, start_y, go_x, go_y, NODE_R, PRIMARY_SPACE, PAIR_SPACE);
		} else {
            setupCoordsRecursive(rootnode.children[0], rootnode, start_x + go_x * PRIMARY_SPACE, start_y + go_y * PRIMARY_SPACE, go_x, go_y, NODE_R, PRIMARY_SPACE, PAIR_SPACE);
        }
	} else if (rootnode.children.length > 1) {
		var npairs = 0;
		for(var i = 0; i < rootnode.children.length; i++) {
			if(rootnode.children[i].is_pair) {
				npairs++;
			}
		}

		var circle_length = (rootnode.children.length + 1) * PRIMARY_SPACE + (npairs + 1) * PAIR_SPACE;
		var circle_radius = circle_length / (2 * Math.PI);
		var length_walker = PAIR_SPACE / 2.0;

		if (typeof parentnode === 'undefined' || parentnode === null) {
			rootnode.x = go_x * circle_radius;
			rootnode.y = go_y * circle_radius;
		} else {
			rootnode.x = parentnode.x + go_x * circle_radius;
			rootnode.y = parentnode.y + go_y * circle_radius;
		}

		for (var i = 0; i < rootnode.children.length; i++) {
			length_walker += PRIMARY_SPACE;

			if(rootnode.children[i].is_pair) {
				length_walker += PAIR_SPACE / 2.0;
			}

			rad_angle = length_walker / circle_length * 2 * Math.PI - Math.PI / 2.0;
			child_x = rootnode.x + Math.cos(rad_angle) * cross_x * circle_radius + Math.sin(rad_angle) * go_x * circle_radius;
			child_y = rootnode.y + Math.cos(rad_angle) * cross_y * circle_radius + Math.sin(rad_angle) * go_y * circle_radius;

			child_go_x = child_x - rootnode.x;
			child_go_y = child_y - rootnode.y;
			child_go_len = Math.sqrt(child_go_x * child_go_x + child_go_y * child_go_y);

            setupCoordsRecursive(rootnode.children[i], rootnode, child_x, child_y, child_go_x / child_go_len, child_go_y / child_go_len, NODE_R, PRIMARY_SPACE, PAIR_SPACE);

			if (rootnode.children[i].is_pair) {
				length_walker += PAIR_SPACE / 2.0;
			}
		}

	} else {
		rootnode.x = start_x
		rootnode.y = start_y
	}
}

function getCoordsRecursive(rootnode, xarray, yarray, PRIMARY_SPACE, PAIR_SPACE) {

	if (rootnode.is_pair) {
		var cross_x = -rootnode.go_y;
		var cross_y = rootnode.go_x;

		xarray[rootnode.index_a] = rootnode.x + cross_x * PAIR_SPACE / 2.0;
		xarray[rootnode.index_b] = rootnode.x - cross_x * PAIR_SPACE / 2.0;

		yarray[rootnode.index_a] = rootnode.y + cross_y * PAIR_SPACE / 2.0;
		yarray[rootnode.index_b] = rootnode.y - cross_y * PAIR_SPACE / 2.0;
	} else if (rootnode.index_a >= 0) {
		xarray[rootnode.index_a] = rootnode.x;
		yarray[rootnode.index_a] = rootnode.y;
	}

    for(var i = 0; i < rootnode.children.length; i++) {
        getCoordsRecursive(rootnode.children[i], xarray, yarray, PRIMARY_SPACE, PAIR_SPACE);
    }

}

function RNARenderer () {
    this.root = null;
    this.xarray = null;
    this.yarray = null;
    this.size = null;
}

RNARenderer.prototype.setupTree = function(secstruct, NODE_R, PRIMARY_SPACE, PAIR_SPACE) {
    var dangling_start = 0;
    var dangling_end = 0;
    var bi_pairs = getPairmapFromSecstruct(secstruct);

    this.NODE_R = NODE_R;
    this.root = null;

    for (var i = 0; i < bi_pairs.length; i++) {
        if (bi_pairs[i] < 0) {
            dangling_start += 1;
        } else {
            break;
        }
    }

    for (var i = bi_pairs.length - 1; i >= 0; i--) {
        if (bi_pairs[i] < 0) {
            dangling_end += 1;
        } else {
            break;
        }
    }

    this.root = new RNATreeNode();

    var jj = 0;
    while (jj < bi_pairs.length) {
        if (bi_pairs[jj] > jj) {
            addNodesRecursive(bi_pairs, this.root, jj, bi_pairs[jj]);
            jj = bi_pairs[jj] + 1;
        } else {
            var newsubnode = new RNATreeNode();
            newsubnode.is_pair = false;
            newsubnode.index_a = jj;
            this.root.children.push(newsubnode);
            jj += 1
        }
    }

    xarray = [];
    yarray = [];

    for (var i = 0; i < secstruct.length; i++) {
        xarray.push(0.0);
        yarray.push(0.0);
    }

    this.setUpCoords(NODE_R, PRIMARY_SPACE, PAIR_SPACE);

    this.getCoords(xarray, yarray, PRIMARY_SPACE, PAIR_SPACE);

    var min_x = xarray[0] - NODE_R;
    var min_y = yarray[0] - NODE_R;
    var max_x = xarray[0] + NODE_R;
    var max_y = yarray[0] + NODE_R;

    for(var i = 0; i < xarray.length; i++) {
        var x = xarray[i];
        if (x - NODE_R < min_x) {
            min_x = x - NODE_R;
        }
        if (x + NODE_R > max_x) {
            max_x = x + NODE_R;
        }
    }

    for(var i = 0; i < yarray.length; i++) {
        var y = yarray[i];
        if (y - NODE_R < min_y) {
            min_y = y - NODE_R;
        }
        if (y + NODE_R > max_y) {
            max_y = y + NODE_R;
        }
    }

    for(var i = 0; i < xarray.length; i++) {
        xarray[i] -= min_x;
        yarray[i] -= min_y;
    }

    this.size = [max_x - min_x, max_y - min_y];
    this.xarray = xarray;
    this.yarray = yarray;
}
		
RNARenderer.prototype.getSize = function() {
    return this.size;
};
	
RNARenderer.prototype.getCoords = function(xarray, yarray, PRIMARY_SPACE, PAIR_SPACE) {
	if(this.root != null) {
		getCoordsRecursive(this.root, xarray, yarray, PRIMARY_SPACE, PAIR_SPACE);
	} else {
		for(var i = 0; i < xarray.length; i++) {
			xarray[i] = 0;
			yarray[i] = i * PRIMARY_SPACE;
		}
	}
}

RNARenderer.prototype.setUpCoords = function(NODE_R, PRIMARY_SPACE, PAIR_SPACE) {
	if(this.root != null) {
		setupCoordsRecursive(this.root, null, 0, 0, 0, 1, NODE_R, PRIMARY_SPACE, PAIR_SPACE);
	}
}

RNARenderer.prototype.draw = function(svgobj, offset_x, offset_y, colors, pairs, sequence, renderInLetter) {
	if(this.xarray != null) {
		if (typeof pairs !== 'undefined') {
		    for(var i = 0; i < pairs.length; i++) {
		    	var pair = pairs[i];
		    	svgobj.line(offset_x + this.xarray[pair['from']], offset_y + self.yarray[pair['from']], offset_x + self.xarray[pair['to']], offset_y + self.yarray[pair['to']], pair['color'], this.NODE_R);
		    }
		}

		if(!renderInLetter) {
			for(var i = 0; i < this.xarray.length; i++) {
				var color = "#000000";
				if (typeof colors !== 'undefined') {
					color = colors[i];
				}
				svgobj.circle(this.xarray[i] + offset_x, this.yarray[i] + offset_y, this.NODE_R, color, color);
			}
		}

		if (typeof sequence !== 'undefined') {
			for(var i = 0; i < this.xarray.length; i++) {
				var text_size = this.NODE_R * 1.5;
				var color = "#FFFFFF";
				var text_offset_x = -2.0;
				var text_offset_y = (text_size) / 2.0 - 1.0;

				if(renderInLetter) {
					if (typeof colors !== 'undefined') {
						color = colors[i];
					}
					text_size = self.NODE_R * 3.0;
					text_offset_x = -(text_size) / 2.0;
					text_offset_y = (text_size) / 2.0;
					svgobj.text(this.xarray[i] + offset_x + text_offset_x, this.yarray[i] + offset_y + text_offset_y, text_size, color, "center", sequence.charAt(i));
				}
			}
		}
	}
}

console.log("RNA Rendering's successfully loaded.");