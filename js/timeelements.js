var shortFormat = d3.time.format("%d/%m/%Y");

var xy = {}; // save datapoints

function dottxtfunc (d) {

  if ( this.getAttribute("visibility") == "hidden" ){
    return "";
  }
  var current = (xPoint(d) + "," + yPoint(d)); //

  var mylabel = xy[current]; // get the index of current data point in array arr

  if ( mylabel === undefined ) { // if index is -1, then no match found. unique data point
    xy[current] = 1; // push point onto array
    return "1";

  } else {
    xy[current] = xy[current] + 1; // push point onto array
    return xy[current] + "";
  }
};



function timeElements (dataset,svg) {

  var idcounterdot = 0;
  var counterdot = 0;
  var idcounterbar = 0;
  var idcountertri = 0;
  var idcounterbarpp = 0;

  var timeline = d3.layout.timeline()
      .size([w - marginleft - marginright,htimeline])
      .extent(xEgoTimeExtent)
      .padding(4)
      .maxBandHeight(12); // height bands

  // bars

  var noPolPartydata = timeline(dataset.filter(function(b) {
                  return b.type !== 'tnl:PoliticalParty';
              }));

  var isPolPartydata = timeline(dataset.filter(function(b) {
                  return b.type === 'tnl:PoliticalParty';
              }));

  svg.append("g")
    .attr({
        "class": "gbar"
      })
    .selectAll("rect")
    .data(noPolPartydata)
    .enter()
    .append("rect")
    .attr({
      "x": dxStart,
      "y": htimeline + paddingdoc + margintop + titlespacing, // to move from top to bottom
      "height": function(d) {return d.dy; }, //meaning d.dy??
      "width": function(d) {return d.end - d.start; },
      "fill": function(d){return sectorToNameAndColor(d.sector).color},
      "class": function(d) {return triangleIds[0] + d.sector.replace(/\W/gi, '-').toLowerCase()},
      "id": function(d) {
        idcounterbar += 1;
        return triangleIds[0] + idcounterbar; },
      "visibility": "hidden",
      "pointer-events": "visible" // can only be targeted when visibility is set to visible
    })
    ;


    function makeTrianglePoints(d){
      var xPoint = ((d.end - d.start)/ 2) + d.start + paddingdoc + marginleft; // x top-triangle point
      var yPoint =  htimeline - ((d.end - d.start)/ 2)  + paddingdoc + margintop + titlespacing ;  // y top triangle point
      var dxStart = d.start + paddingdoc + marginleft;// startpoint bar plus extra left padding
      var dyBar = htimeline + margintop + titlespacing + paddingdoc ; // to move from top to bottom
      var dxEnd = d.end + paddingdoc + marginleft; // endpoint bar
      return [ { "x": dxStart,   "y": dyBar},  { "x": xPoint,   "y": yPoint}, { "x": dxEnd,   "y": dyBar} ];
    }


    var lineFunction = d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
    .interpolate("linear"); // straight lines

    //triangles



    svg.append("g")
      .attr({
        "class": "gtri"
      })
      .selectAll("path")
      .data(noPolPartydata)
      .enter()
      .append("path")
      .attr({
          "d": function(d) {
            return lineFunction(makeTrianglePoints(d));
          },
          "stroke": function(d){return sectorToNameAndColor(d.sector).color},
          "stroke-width": 1,
          "fill-opacity": 0,
          "class": function(d) {return triangleIds[1] + d.sector.replace(/\W/gi, '-').toLowerCase()},
          "id": function(d) {
            idcountertri += 1;
            return triangleIds[1] + idcountertri;
            },
          "visibility": "hidden",
          "pointer-events": "visible" // can only be targeted when visibility is set to visible
      })
      .style({
        "stroke-dasharray": ("3, 3"),
        "opacity": 0.4
      })
      ;


    var compoundDotContainer = svg.append("g")
      .selectAll("g")
      .data(noPolPartydata)
      .enter()
      .append("g")

    // dots
    var dots = compoundDotContainer
      .append("circle")
      .style({
        "opacity": 0,
      })
      .attr({
        "r": radius, //radius
        "cx": xPoint, // startpoint
        "cy": yPoint, // positioning
        "fill": function(d){return sectorToNameAndColor(d.sector).color},
        "class": function(d) {return "dot-" + d.sector.replace(/\W/gi, '-').toLowerCase()},
        "id": function(d) {
              idcounterdot += 1;
              return "dot-" + idcounterdot;
            },
        "pointer-events": "visible" // can only be targeted when visibility is set to visible
      })
    ;

// transition dots

    dots.transition()
      .delay(function(d) {
        //counterdot += 1;
        return counterdot * 100;
      })
      .ease("linear")
      .style({
        "opacity": 1,
        "cursor" : "pointer",
        "z-index": "10"
      })
    ;

    dots.on("mouseover", function(d) {
      tooltip.style("left", (d3.event.pageX + 5) + "px")
          .style("top", (d3.event.pageY - 85) + "px");

      tooltip.transition()
        .duration(200)
        .style("opacity", .9);

      tooltip.html("<p class='bgtexttime'>Organization: " + d['name'] + " <br/> Position: "
          + d['position'].split(':')[1] + " <br/> Period: " + shortFormat(new Date(d['originalStart'])) + " - "
          + shortFormat(new Date(d['originalEnd'])) + " <br/> Source: " + d['source'] + "</p>");
      //triangle and bar
      var obj = this.id.substr(4,5);

      triangleIds.forEach(function(s){
        d3.select("#" + s + obj)
          .attr("visibility", "visible");
      })
    })
    .on("click", function(d) {

      if( this.parentNode.childNodes[1].textContent !== "1"){
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
          // triangle and bar
        var obj = this.id.substr(4,5);
        triangleIds.forEach(function(s){
          d3.select("#" + s + obj)
              .attr("visibility", "hidden");
        });
        this.setAttribute("visibility", "hidden");
        this.parentNode.childNodes[1].setAttribute("visibility", "hidden");
      }else{
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
          // triangle and bar
          var obj = this.id.substr(4,5);
          triangleIds.forEach(function(s){
            d3.select("#" + s + obj)
              .attr("visibility", "hidden");
          })
        d3.selectAll('*[class^="' + d3.select(this).attr("class") + '"]')
        .attr("visibility", "visible");

        d3.selectAll('*[class^="' + d3.select(this.parentNode).select("text").attr("class") + '"]')
        .attr("visibility", "visible");
      }
      // triangleIds.forEach(function(s){
      //   d3.select("#" + s + obj).
      //   each(function (t){
      //     this.setAttribute("visibility", "hidden");
      //   });
      //})
    })
    .on("mousemove", function(d){
    })
    .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
        // triangle and bar
      var obj = this.id.substr(4,5);
      triangleIds.forEach(function(s){
          d3.select("#" + s + obj)
            .attr("visibility", "hidden");
        })
    })
  ;


    xy = {}; // reset datapoints

    // text inside circle
    var textDot = compoundDotContainer
      .append("text")
      .attr({
        "x": xPointTxt,
        "y": yPointTxt,
        "class": function(d) {return "dottxt-" + d.sector.replace(/\W/gi, '-').toLowerCase()},
        "fill": "#FFF",
        "pointer-events": "none",
        "visibility": "visible",
        "opacity":  0
      })
      // point text, for doubles
      .text(dottxtfunc)
    ;

    textDot.transition()
      .delay(function(d) {
        //counterdot += 1;
        return counterdot * 100;
      })
      .ease("linear")
      .style({
        "opacity": 1,
        "cursor" : "pointer",
        "z-index": "1"
      })
    ;


      // political party bars

    svg.append("g")
      .selectAll("rect")
      .data(isPolPartydata)
      .enter()
      .append("rect")
      .attr({
        "x": dxStart,
        "y": function(d) {return 40 + htimeline + margintop + titlespacing + paddingdoc + d.y}, // positioning bars below each other in one category function (d) {return (h - d)}
        "height": function(d) {return d.dy; }, //
        "width": function(d) {return d.end - d.start; },
        "fill": d3.rgb("#AAA"),
        "id": function(d) {
              idcounterbarpp += 1;
              return "barpp-" + idcounterbarpp;
            },
        "pointer-events": "visible"
      })
      .on("mouseover", function(d) {
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);

          tooltip.html("<p class='bgtexttime'>Organization: " + d['name'] + " <br/> Position: " + d['position'].split(':')[1] + " <br/> Period: "
                    + shortFormat(new Date(d['originalStart'])) + " - " + shortFormat(new Date(d['originalEnd'])) + " <br/> Source: " + d['source'] + "</p>");

      })
      .on("mousemove", function(d){
        tooltip.style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 30) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);

      })
    ;

} // end timeElements
