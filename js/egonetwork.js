
const nodeSize = 18;
const x_browser = nodeSize/2;
const y_browser = nodeSize*1.2;
const increaseIcon = 1.5;

const SECTORNODETYPE = "SECTORNODETYPE";
const STATUSNODETYPE = "STATUSNODETYPE";

const TimeRelEnum = {
  BEFORE: "before",
  BEFORESTARTS: "starts",
  BEFOREOVERLAP: "beforeoverlap",
  BEFOREEND: "beforeend",
  BEFOREAFTER: "beforeafter",
  STARTSOVERLAP: "startsoverlap",
  STARTSEND: "startsend",
  STARTSAFTER: "startsafter",
  OVERLAP: "overlap",
  OVERLAPEND: "overlapend",
  OVERLAPAFTER: "overlapafter",
  ENDAFTER: "endafter",
  AFTER: "after"
};

const cliqueStatusEnum = {
  BEFORE: "before",
  MINUS: "minus",
  EQUAL: "equal",
  DURING: "during",
  PLUS: "plus",
  NONE: "none"
};

var egoTimeSnapshot = null;

var root;
var nodes;
var links;

var force;
var node;
var link;

var graphW;
var graphH;
var graphSvg;
var clicked = null;

var selectedNodes;

// rest of vars

function createEgoData(dataSet){
  snapshotSet = {};
  var uniqueNodeIndex=0;
  snapshotSet.id  = dataSet.id;
  snapshotSet.nodeid = uniqueNodeIndex++;
  snapshotSet.name  = dataSet.name;
  snapshotSet.type  = dataSet.type;
  snapshotSet.nodeid = uniqueNodeIndex++;
  snapshotSet._children = [];

  for (var i=0;i<dataSet._children.length;++i){

    var instNode = {}, instToCopy = dataSet._children[i];

    // Is the node in scope?
    var instExtent = convertDates(instToCopy);

    var timeRelation = filterExtent(instExtent,currentExtent);
    if (timeRelation === cliqueStatusEnum.NONE){
      continue;
    }

    instNode.id = instToCopy.id;
    instNode.nodeid = uniqueNodeIndex++;
    instNode.name = instToCopy.name;
    instNode.type = instToCopy.type;
    instNode.position = instToCopy.position;
    instNode.positionLabel = instToCopy.positionLabel;
    instNode.sector = instToCopy.sector;
    instNode.source = instToCopy.source;
    instNode.start = instToCopy.start;
    instNode.end = instToCopy.end;

    instNode._children = [];

    var sectorStatusExist = false;

    for (var ii=0;ii<snapshotSet._children.length;++ii){

      if (snapshotSet._children[ii].sector === instToCopy.sector && snapshotSet._children[ii].cliqueStatus === timeRelation){

        snapshotSet._children[ii]._children.push(instNode);
        sectorStatusExist = true;
        break;
      }
    }
    if (!sectorStatusExist){
      var sectorNode = {};
      sectorNode.name = sectorToNameAndColor(instToCopy.sector).name;
      sectorNode.cliqueStatus = timeRelation;
      sectorNode.type = SECTORNODETYPE;
      sectorNode.sector = instToCopy.sector;
      sectorNode.nodeid = uniqueNodeIndex++;
      sectorNode._children = [];
      sectorNode._children.push(instNode);
      snapshotSet._children.push(sectorNode);
    }


    for (var j=0;j<instToCopy._children.length;++j){

      var personExtent = convertDates(instToCopy._children[j].relation);

      var scopedExtent = [instExtent[0]>personExtent[0]?instExtent[0]:personExtent[0],
                          instExtent[1]<personExtent[1]?instExtent[1]:personExtent[1]];

      timeRelation = filterExtent(scopedExtent,currentExtent);
      if (timeRelation === cliqueStatusEnum.NONE){
        continue;
      }
      var personNode = {}, personToCopy = instToCopy._children[j];
      personNode.id = personToCopy.id;
      personNode.nodeid = uniqueNodeIndex++;
      personNode.name = personToCopy.name;
      personNode.type = personToCopy.type;
      personNode.position = personToCopy.relation.position;
      personNode.positionLabel = personToCopy.relation.positionLabel;
      personNode.source = personToCopy.source;
      personNode.start = personToCopy.relation.start;
      personNode.end = personToCopy.relation.end;

      var statusExist = false;

      for (var ii=0;ii<instNode._children.length;++ii){

        if (instNode._children[ii].cliqueStatus === timeRelation){

          instNode._children[ii]._children.push(personNode);
          statusExist = true;
          break;
        }
      }
      if (!statusExist){
        var statusNode = {};
        statusNode.name = "";
        statusNode.cliqueStatus = timeRelation;
        statusNode.type = STATUSNODETYPE;
        statusNode.nodeid = uniqueNodeIndex++;
        statusNode._children = [];
        statusNode._children.push(personNode);
        instNode._children.push(statusNode);
      }
    }
  }
  return snapshotSet;
}

function convertDates(node){
  // Start of working day
  var nodeStart = new Date(node.start + "T08:00:00+01:00");
  // End of working day
  var nodeEnd = new Date(node.end + "T17:00:00+01:00");
  return [nodeStart, nodeEnd];
}

function filterExtent(nodeExtent,extent){

    var timeRelation = TimeRelEnum.BEFORE;

    var nodeStart = nodeExtent[0], nodeEnd = nodeExtent[1];

    if( nodeEnd < extent[0] ){
      timeRelation = TimeRelEnum.BEFORE;
    }else if ( nodeStart > extent[1] ){
      timeRelation = TimeRelEnum.AFTER;
    }else if ( nodeEnd.getTime() === extent[0].getTime() ){
      timeRelation = TimeRelEnum.BEFORESTARTS;
    }else if ( nodeStart < extent[0] && nodeEnd < extent[1] ){
      timeRelation = TimeRelEnum.BEFOREOVERLAP;
    }else if ( nodeStart < extent[0] && nodeEnd.getTime() === extent[1].getTime() ){
      timeRelation = TimeRelEnum.BEFOREEND;
    }else if ( nodeStart < extent[0] && nodeEnd > extent[1] ){
      timeRelation = TimeRelEnum.BEFOREAFTER;
    }else if ( nodeStart.getTime() === extent[0].getTime() && nodeEnd < extent[1] ){
      timeRelation = TimeRelEnum.STARTSOVERLAP;
    }else if ( nodeStart.getTime() === extent[0].getTime() && nodeEnd.getTime() === extent[1].getTime() ){
      timeRelation = TimeRelEnum.STARTSEND;
    }else if ( nodeStart.getTime() === extent[0].getTime() && nodeEnd > extent[1] ){
      timeRelation = TimeRelEnum.STARTSAFTER;
    }else if ( nodeStart > extent[0] && nodeEnd < extent[1] ){
      timeRelation = TimeRelEnum.OVERLAP;
    }else if ( nodeStart > extent[0] && nodeEnd.getTime() === extent[1].getTime() ){
      timeRelation = TimeRelEnum.OVERLAPEND;
    }else if ( nodeStart > extent[0] && nodeEnd > extent[1] ){
      timeRelation = TimeRelEnum.OVERLAPAFTER;
    }else if ( nodeStart.getTime() === extent[1].getTime() ){
      timeRelation = TimeRelEnum.ENDAFTER;
    }else{
      handleError("ERROR: uncaugth relation for start " + nodeToFilter.start + ", end " + nodeToFilter.end + ", and extent " + extent);
    }
    switch(timeRelation) {
      case TimeRelEnum.BEFORE:
        return cliqueStatusEnum.BEFORE;
        break;
      case TimeRelEnum.BEFORESTARTS:
        return cliqueStatusEnum.MINUS;
        break;
      case TimeRelEnum.BEFOREOVERLAP:
        return cliqueStatusEnum.MINUS;
        break;
      case TimeRelEnum.BEFOREEND:
        return cliqueStatusEnum.MINUS;
        break;
      case TimeRelEnum.BEFOREAFTER:
        return cliqueStatusEnum.EQUAL;
        break;
      case TimeRelEnum.STARTSOVERLAP:
        return cliqueStatusEnum.DURING;
        break;
      case TimeRelEnum.STARTSEND:
        return cliqueStatusEnum.DURING;
        break;
      case TimeRelEnum.STARTSAFTER:
        return cliqueStatusEnum.PLUS;
        break;
      case TimeRelEnum.OVERLAP:
        return cliqueStatusEnum.DURING;
        break;
      case TimeRelEnum.OVERLAPEND:
        return cliqueStatusEnum.DURING;
        break;
      case TimeRelEnum.OVERLAPAFTER:
        return cliqueStatusEnum.PLUS;
        break;
      case TimeRelEnum.ENDAFTER:
        return cliqueStatusEnum.PLUS;
        break;
      case TimeRelEnum.AFTER:
        return cliqueStatusEnum.NONE;
        break;
      default:
        handleError("ERROR: unknown time relation: " + timeRelation);

    }

}

// function setNumberOfChildren(set){
//
//   if (set._children !== undefined && set._children.length >0){
//     set._children.forEach(setNumberOfChildren);
//     set.name = set.name + " (" + set._children.length + ")";
//   }
//
// }

function initEgonetwork (svg, width, height){

  graphSvg = svg.append("g")
    .attr({
      "class": "graph"
    })
    .attr("width", width)
    .attr("height", height);

  graphW = width;
  graphH = height;

  // var defs = graphSvg.insert("svg:defs")
  //     .data(["end"]);
  //
  //
  // defs.enter().append("svg:path")
  //     .attr("d", "M0,-5L10,0L0,5");

  force = d3.layout.force();

}

function setEgoData(jsonData){
  if (nodes !== undefined){
    nodes.length = 0;
    graphSvg.selectAll("g.node").data(nodes).exit().remove();
  }

  root = jsonData;
  root.fixed = true;
  root.x = graphW / 2;
  root.y = graphH / 4;
  update();
}


function getImage(d){
  var img;
  if (d.type === STATUSNODETYPE){
    switch (d.cliqueStatus){
      case cliqueStatusEnum.BEFORE:
        img = "cir_before2";
        break;
      case cliqueStatusEnum.MINUS:
        img = "cir_minus2";
        break;
      case cliqueStatusEnum.EQUAL:
        img = "cir_equal2";
        break;
      case cliqueStatusEnum.DURING:
        img = "cir_during2";
        break;
      case cliqueStatusEnum.PLUS:
        img = "cir_plus2";
        break;
      default:
        handleError("Unkwon clique status: " + d.cliqueStatus);
    }

  }else if (d.type === SECTORNODETYPE){
    switch (d.cliqueStatus){
      case cliqueStatusEnum.BEFORE:
        img = "sq_before2";
        break;
      case cliqueStatusEnum.MINUS:
        img = "sq_minus2";
        break;
      case cliqueStatusEnum.EQUAL:
        img = "sq_equal2";
        break;
      case cliqueStatusEnum.DURING:
        img = "sq_during2";
        break;
      case cliqueStatusEnum.PLUS:
        img = "sq_plus2";
        break;
      default:
        handleError("Unkwon clique status: " + d.cliqueStatus);
    }
  }else if (d.type === "tnl:Person"){
    img = "cir2";
  }else{
    img = "sq2";
  }
  return img;
}

/**
 *
 */
function update() {
  nodes = flatten(root);
  links = d3.layout.tree().links(nodes);

  // Restart the force layout.
  force.nodes(nodes)
      .links(links)
      .gravity(0.05)
      .charge(-1500)
      .linkDistance(100)
      .friction(0.5)
      .linkStrength(function(l, i) {return 1; })
      .size([graphW, graphH])
      .on("tick", tick)
      .start();

  link = graphSvg.selectAll("path.link")
      .data(links, function(d) { return d.target.nodeid; });

  link.enter().insert("svg:path")
      .attr("class", "link")
      // .attr("marker-end", "url(#end)")
      //.style("stroke", "#eee")
      ;

  // Exit any old paths.
  link.exit().remove();

  // Update the nodes…
  node = graphSvg.selectAll("g.node")
      .data(nodes, function(d) { return d.nodeid; });


  // Enter any new nodes.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .on("click", click)
      .on("contextmenu", contextmenu)
      .call(force.drag);

  // Append a circle
  // nodeEnter.append("svg:circle")
  //     .attr("r", function(d) { return Math.sqrt(d.size) / 10 || 4.5; })
  //     .style("fill", "#eee");

  nodeEnter.append("svg:rect")
      .attr("width", nodeSize)
      .attr("height", nodeSize)
      .style("fill", function(d) { return determineColor(d)});

  // Append images
  var images = nodeEnter.append("svg:image")
        .attr("xlink:href",  function(d) { return "./img/" + getImage(d) + ".svg";})
        .attr("x", function(d) { return 0;})
        .attr("y", function(d) { return 0;})
        .attr("height", nodeSize)
        .attr("width", nodeSize)
        .attr("class", "img");

  // make the image grow a little on mouse over and add the text details on click
  var setEvents = images

          .on( 'click', function (d) {

           })

          .on( 'mouseenter', function(d) {
            // select element in current context
            if (d.id !== root.id && d.type == "tnl:Person"){
              selectedNodes = [];
              findNodes(egoTimeSnapshot,d.name);

              graphSvg.selectAll("g.node").filter(function(d){return selectedNodes.indexOf(d.nodeid) > -1;}).select("image").each(function (d){

                d3.select( this )
                  .transition()
                  .attr("x", function(d) { return -nodeSize*(increaseIcon-1)/2;})
                  .attr("y", function(d) { return -nodeSize*(increaseIcon-1)/2;})
                  .attr("height", nodeSize*increaseIcon)
                  .attr("width", nodeSize*increaseIcon);

              });
            }
          })
          // set back
          .on( 'mouseleave', function() {
            graphSvg.selectAll("g.node").select("image").each(function (d){
              d3.select( this )
                .transition()
                .attr("x", function(d) { return 0;})
                .attr("y", function(d) { return 0;})
                .attr("height", nodeSize)
                .attr("width", nodeSize);
              });
            });

  nodeEnter.append("text")
      .attr("class", "nodetext")
      .attr("x", x_browser)
      .attr("y", y_browser)
      .text(function(d) {
        if (d.children) {
          return d.name + " (" + d.children.length + ")";
        }else if( d._children ){
          return d.name + " (" + d._children.length + ")";
        }
        return d.name;
      });


  // Exit any old nodes.
  node.exit().remove();

  // Re-select for update.
  link = graphSvg.selectAll("path.link");
  node = graphSvg.selectAll("g.node");

}

function tick() {

    link.attr("d", function(d) {

      var dx = d.target.x - d.source.x;
      var dy = d.target.y - d.source.y;
      var dr = Math.sqrt(dx * dx + dy * dy);

      return "M" + d.source.x + "," + d.source.y
              + "A" + dr + ","  + dr + " 0 0,1 "
              + d.target.x + "," + d.target.y;
    });

    // link.attr("x1", function(d) { return d.source.x; })
    //        .attr("y1", function(d) { return d.source.y; })
    //        .attr("x2", function(d) { return d.target.x; })
    //        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", nodeTransform);
}


/**
 * Gives the coordinates of the border for keeping the nodes inside a frame
 * http://bl.ocks.org/mbostock/1129492
 */
function nodeTransform(d) {
  d.x =  Math.max(nodeSize, Math.min(graphW - nodeSize, d.x));
    d.y =  Math.max(nodeSize, Math.min(graphH - nodeSize, d.y));
    return "translate(" + d.x + "," + d.y + ")";
   }

/**
 * Toggle children on click.
 */
function click(d) {
  if (d._children === undefined){
    return;
  }

  if (d._children) {
    d.children = d._children;
    d._children = null;
  } else {
    d._children = d.children;
    d.children = null;
  }

  update();
}

/**
 * Returns a list of all nodes under the root.
 */
function flatten(root) {
  var nodes = [];
  var i = 0;

  function recurse(node) {
    if (node.children){
      node.children.forEach(recurse);
    }
    if (!node.nodeid){
      handleError("nodeid NOT defined")
    }
    nodes.push(node);
  }

  recurse(root);
  return nodes;
}

function determineColor(d){
  if (d.nodeid === root.nodeid){
    return "#000000";
  }else if (d.type === SECTORNODETYPE){
    var result = sectorToNameAndColor(d.sector);
    if (result !== undefined){
      return result.color;
    }
  }else if (d.type === STATUSNODETYPE){
    return "#999999";
  }else if (d.type === "tnl:Person"){
    return "#999999";
  }else if (d.type.startsWith("tnl:")){
    var result = sectorToNameAndColor(d.sector);
    if (result !== undefined){
      return result.color;
    }
  }

  return "red";
}

function findNodes(node,name){
  var alreadyFound = false, addMySelf = true;

  if( node._children !== undefined || node.children !== undefined){
    var children;
    if (node._children){
      addMySelf = true;
      children = node._children;
    }else{
      addMySelf = false;
      children = node.children;
    }
    if (children === undefined){
      handleError("should not be undefined: " + node);
    }
    if (children.length > 0){
      for (var i=0;i<children.length;++i){
        if (findNodes(children[i],name)){
          if (!alreadyFound){
            alreadyFound = true;
            if (addMySelf){
              selectedNodes.push(node.nodeid);
            }
          }
        }
      }
    }
  }
  if (!alreadyFound){
    if (node.name == name){
      selectedNodes.push(node.nodeid);
      return true;
    }
  }
  return false;
}


function contextmenu(d){
  if (clicked){
    return;
  }
  clicked = d;

  if (clicked.type === "tnl:Person" && clicked.nodeid !== root.nodeid){
    d3.event.preventDefault();


   var popup = d3.select("div#viz2")
            .append("div")
            .attr("id","progresspopup")
            .style("left",(d3.event.pageX + 5) + "px")
            .style("top",(d3.event.pageY - 85) + "px");

    progressBar("#progresspopup");

    sharedConnections(clicked);

  // var ancor = popup.append("a")
  //             .attr("href","shared.html")
  //             .attr("class","fancybox fancybox.iframe")
  //             .attr("data-fancybox-type","iframe")


    // d3.select("div#sharedtitle").select("p").select("span.titlename").text(function(){return egoDataSet.name});

    // alert("You click me!!!");

    // popup.append("div").attr("id","progresspopup");
    // progressBar("#progresspopup");

    // popup.append("p")
    //         .append("a")
    //         .attr("href",d.link)
    //         .text(d.link_text);
  }
}
