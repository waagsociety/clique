var graphLegend = function(dataset,svg) {

var symbolTable = [
    { name : "added active", file : "sym_plus"},
    { name : "added deactive", file : "sym_during"},
    { name : "changed to deactive", file : "sym_minus"},
    { name : "unchanged active", file : "sym_equal"},
    { name : "unchanged deactive", file : "sym_before"}
  ];

var grlegendSelector = svg.append("g");

  var grtitlegraph = grlegendSelector.append("g")
    .append("text")
    ;

  grtitlegraph.append("tspan")
    .text("Jan Anthonie Bruijn") // function name!
    .attr({
      "class": "titlename",
      "x": paddingdoc,
      "y": paddingdoc + margintop
    })
    ;

  grtitlegraph.append("tspan")
    .text(" / social network changes (begindate - enddate)")
    .attr({
      "class": "titlegraph",
      "y": paddingdoc + margintop
    })
    ;


  var grlegendtitle = grlegendSelector.append("g")
    .append("text")
    .text("Symbols")
    .attr({
      "class": "legendtitle",
      "x": paddingdoc,
      "y": paddingdoc + margintop + 30
    })
  ;

  // icons & txt symbols

  var symbolContainer = grlegendSelector.selectAll("g.symbol")
    .data(symbolTable);

  var symbolEnter = symbolContainer.enter().append("svg:g");

  var grsymbolimg = symbolEnter.append("svg:image")
    .attr("xlink:href", function(d) { return "./img/" + d.file + ".svg";})
    .attr("x", function(d, i) { return paddingdoc + 90 + 145 * i;})
    .attr("y", function(d) { return paddingdoc + margintop + 15;})
    .attr("height", "2em")
    .attr("width", "2em")
    .attr("class", "img")
    .attr("margin", "0 1em")
    ;

  var grsymboltxt = symbolEnter.append("text")
    .text(function(d){return d.name;})
    .attr("y", function(d) { return paddingdoc + margintop + 30;})
    .attr("x", function(d, i) { return paddingdoc + 115 + 145 * i;})
    .attr("class", "symboltxt")
    ;
}