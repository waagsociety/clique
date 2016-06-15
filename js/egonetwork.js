
// var linkDistance = 80;
// var charge = -120;
// var gravity = .05;
var root;
var force;
// var link;
// var node;
var graphW;
var graphH;
var display;


// rest of vars
var nodeSize = 25;
var x_browser = 20;
var y_browser = 25;
var increaseIcon = 1.5;

function initEgonetwork (svg, width, height){

  display = svg.append("g")
    .attr({
      "class": "graph"
    })
    .attr("width", width)
    .attr("height", height);

  graphW = width;
  graphH = height;

  var defs = display.insert("svg:defs")
      .data(["end"]);


  defs.enter().append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

  force = d3.layout.force();

}

function setEgoData(jsonData){
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
  var nodes = flatten(root),
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

   var path = display.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

    path.enter().insert("svg:path")
      .attr("class", "link")
      // .attr("marker-end", "url(#end)")
      //.style("stroke", "#eee")
      ;


  // Exit any old paths.
  path.exit().remove();



  // Update the nodes…
  var node = display.selectAll("g.node")
      .data(nodes, function(d) { return d.id; });


  // Enter any new nodes.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .on("click", click)
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
        .attr("width", nodeSize);

  // make the image grow a little on mouse over and add the text details on click
  var setEvents = images
          // Append hero text
          .on( 'click', function (d) {
              // d3.select("h1").html(d.hero);
              // d3.select("h2").html(d.name);
              // d3.select("h3").html ("Take me to " + "<a href='" + d.link + "' >"  + d.hero + " web page ⇢"+ "</a>" );
           })

          .on( 'mouseenter', function() {
            // select element in current context
            d3.select( this )
              .transition()
              .attr("x", function(d) { return -nodeSize*(increaseIcon-1)/2;})
              .attr("y", function(d) { return -nodeSize*(increaseIcon-1)/2;})
              .attr("height", nodeSize*increaseIcon)
              .attr("width", nodeSize*increaseIcon);
          })
          // set back
          .on( 'mouseleave', function() {
            d3.select( this )
              .transition()
              .attr("x", function(d) { return 0;})
              .attr("y", function(d) { return 0;})
              .attr("height", nodeSize)
              .attr("width", nodeSize);
          });

  // Append hero name on roll over next to the node as well
  nodeEnter.append("text")
      .attr("class", "nodetext")
      .attr("x", x_browser)
      .attr("y", y_browser +15)
      .text(function(d) { return d.name; });


  // Exit any old nodes.
  node.exit().remove();


  // Re-select for update.
  path = display.selectAll("path.link");
  node = display.selectAll("g.node");

function tick() {


    path.attr("d", function(d) {

     var dx = d.target.x - d.source.x,
           dy = d.target.y - d.source.y,
           dr = Math.sqrt(dx * dx + dy * dy);
           return   "M" + d.source.x + ","
            + d.source.y
            + "A" + dr + ","
            + dr + " 0 0,1 "
            + d.target.x + ","
            + d.target.y;
  });
    node.attr("transform", nodeTransform);
  }
}


/**
 * Gives the coordinates of the border for keeping the nodes inside a frame
 * http://bl.ocks.org/mbostock/1129492
 */
function nodeTransform(d) {
  d.x =  Math.max(nodeSize, Math.min(graphW - (d.imgwidth/2 || 16), d.x));
    d.y =  Math.max(nodeSize, Math.min(graphH - (d.imgheight/2 || 16), d.y));
    return "translate(" + d.x + "," + d.y + ")";
   }

/**
 * Toggle children on click.
 */
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
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
    if (!node.id){
      node.id = ++i;
    }
    nodes.push(node);
  }

  recurse(root);
  return nodes;
}

function determineColor(d){
  if(d.id === root.id){
    return "#000000";
  }else if (d.type === SECTORNODETYPE){
    var result = sectorToNameAndColor(d.name);
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
