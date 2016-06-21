const symbolTable = [
    { name : "added active", file : "sym_plus"},
    { name : "added deactive", file : "sym_during"},
    { name : "changed to deactive", file : "sym_minus"},
    { name : "unchanged active", file : "sym_equal"},
    { name : "unchanged deactive", file : "sym_before"}
  ];

var graphLegendSvg;

function initGraphLegend(svg){
  graphLegendSvg = svg;
}

function setTimeSpan(){

  graphLegendSvg.select("tspan.titlegraph")
    .text(" / social network changes (" + d3.time.format("%Y")(currentExtent[0]) + " - " +  d3.time.format("%Y")(currentExtent[1]) + ")");
}

function graphLegend() {

  var grlegendSelector = graphLegendSvg.append("g");

  var grtitlegraph = grlegendSelector.append("g")
    .append("text")
    ;

  grtitlegraph.append("tspan")
    .text(egoDataSet.name) // function name!
    .attr({
      "class": "titlename",
      "x": paddingdoc,
      "y": paddingdoc
    })
    ;

  grtitlegraph.append("tspan")
    .attr({
      "class": "titlegraph",
      "y": paddingdoc
    })
    ;


  var grlegendtitle = grlegendSelector.append("g")
    .append("text")
    .text("Symbols")
    .attr({
      "class": "legendtitle",
      "x": paddingdoc,
      "y": paddingdoc + 30
    })
  ;

  // icons & txt symbols

  var symbolContainer = grlegendSelector.selectAll("g.symbol")
    .data(symbolTable);

  var symbolEnter = symbolContainer.enter().append("svg:g");

  var grsymbolimg = symbolEnter.append("svg:image")
    .attr("xlink:href", function(d) { return "./img/" + d.file + ".svg";})
    .attr("x", function(d, i) { return paddingdoc + 90 + 145 * i;})
    .attr("y", function(d) { return paddingdoc + 15;})
    .attr("height", "2em")
    .attr("width", "2em")
    .attr("class", "img")
    .attr("margin", "0 1em")
    ;

  var grsymboltxt = symbolEnter.append("text")
    .text(function(d){return d.name;})
    .attr("y", function(d) { return paddingdoc + 30;})
    .attr("x", function(d, i) { return paddingdoc + 115 + 145 * i;})
    .attr("class", "symboltxt")
    ;

  // graph comment

  var graphcomment = grlegendSelector.append("g");

  var graphcommentbg = graphcomment.append("svg:image")
    .attr("xlink:href", function(d) { return "./img/graph_comment.svg";})
    .attr("x", function(d, i) { return w - paddingdoc - marginright ;})
    .attr("y", function(d) { return 0;})
    .attr("height", "5.5em")
    .attr("width", marginright)
    .attr("class", "img")
    ;

  var iconright = graphcomment.append("svg:image")
    .attr("xlink:href", function(d) { return "./img/rightclick.svg";})
    .attr("x", function(d) { return w - paddingdoc - marginright + 17 ;})
    .attr("y", function(d) { return 10;})
    .attr("height", marginright / 5)
    .attr("width", marginright / 5)
    .attr("class", "img")
    ;

    graphcomment.append("text")
    .text("Right click a person")
    .attr("class", "timeinstructtop")
    .attr("x", function(d) { return w - paddingdoc - marginright + (marginright / 5) + 23 ;})
    .attr("y", function(d) { return 25;})
    ;

    graphcomment.append("text")
    .text("to inspect the relation")
    .attr("class", "timeinstructbottom")
    .attr("x", function(d) { return w - paddingdoc - marginright + (marginright / 5) + 23 ;})
    .attr("y", function(d) { return 40;})

    ;
}
