var shortFormat = d3.time.format("%d/%m/%Y");

var xy = {}; // save datapoints

function dottxtfunc (d) {

  if ( this.getAttribute("visibility") == "hidden" ){
    return "";
  }
  var current = (xPoint(d) + "," + yPoint(d)); //

  var mylabel = xy[current]; // get the index of current data point in array arr
  //debugger
  if ( mylabel === undefined ) { // if index is -1, then no match found. unique data point
    xy[current] = 1; // push point onto array
    return "";

  } else {
    //debugger
    xy[current] = xy[current] + 1; // push point onto array
    return xy[current] + "";
  }
};


function timeElements (theseBands) {

  // bars

  var noPolPartydata = theseBands.filter(function(b) {
                  return b.typeis !== 'Political Party';
              });

  var isPolPartydata = theseBands.filter(function(b) {
                  return b.typeis === 'Political Party';
              });

  var bars = d3.select("svg")
    .append("g")
    .attr({
        "class": "gbar"
      })
    .selectAll("rect")
    .data(noPolPartydata)
    .enter()
    .append("rect")
    .attr({
      "x": dxStart,
      "y": htimeline + paddingdoc + margintop, // to move from top to bottom
      "height": function(d) {return d.dy; }, //meaning d.dy??
      "width": function(d) {return d.end - d.start; },
      "fill": sectorfill,
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
      var yPoint =  htimeline - ((d.end - d.start)/ 2)  + paddingdoc + margintop ;  // y top triangle point
      var dxStart = d.start + paddingdoc + marginleft;// startpoint bar plus extra left padding
      var dyBar = htimeline + margintop + paddingdoc ; // to move from top to bottom
      var dxEnd = d.end + paddingdoc + marginleft; // endpoint bar
      return [ { "x": dxStart,   "y": dyBar},  { "x": xPoint,   "y": yPoint}, { "x": dxEnd,   "y": dyBar} ];
    }


    var lineFunction = d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
    .interpolate("linear"); // straight lines

    //triangles



    d3.select("svg")
        .append("g")
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
            "stroke": sectorfill,
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


    var compoundDotContainer = d3.select("svg")
      .append("g")
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
        "fill": sectorfill,
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
        counterdot += 1;
        return counterdot * 100;
      })
      .ease("linear")
      .style({
        "opacity": 1,
        "cursor" : "pointer",
        "z-index": "10"
      })
    ;

    dots
      .on("mouseover", function(d) {
        tooltip.style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 85) + "px");

        tooltip.transition()
          .duration(200)
          .style("opacity", .9);

        tooltip.html("<p class='bgtexttime'>Company: " + d['company'] + " <br/> Position: "
            + d['positionis'] + " <br/> Period: " + shortFormat(new Date(d['originalStart'])) + " - "
            + shortFormat(new Date(d['originalEnd'])) + " <br/> Source: " + d['sourceis'] + "</p>");
        //triangle and bar
        var obj = this.id.substr(4,5);
        debugger
        triangleIds.forEach(function(s){
          d3.select("#" + s + obj).
          each(function (t){
            this.setAttribute("visibility", "visible");
          });
        })
      })
      .on("click", function(d) {
        debugger
        if( this.parentNode.childNodes[1].textContent.length > 0){
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
            // triangle and bar
            var obj = this.id.substr(4,5);
            triangleIds.forEach(function(s){
              d3.select("#" + s + obj).
              each(function (t){
                this.setAttribute("visibility", "hidden");
              });
            })
          this.setAttribute("visibility", "hidden");
          this.parentNode.childNodes[1].setAttribute("visibility", "hidden");
        }else{
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
            // triangle and bar
            var obj = this.id.substr(4,5);
            triangleIds.forEach(function(s){
              d3.select("#" + s + obj).
              each(function (t){
                this.setAttribute("visibility", "hidden");
              });
            })
          d3.selectAll('*[class^="dot-"]').
          each(function (t){
            this.setAttribute("visibility", "visible");
          });
          d3.selectAll('*[class^="dottxt-"]').
          each(function (t){
            this.setAttribute("visibility", "visible");
          });
        }
        // triangleIds.forEach(function(s){
        //   d3.select("#" + s + obj).
        //   each(function (t){
        //     this.setAttribute("visibility", "hidden");
        //   });
        //})
      })
      .on("mousemove", function(d){
        debugger
      })
      .on("mouseout", function(d) {
        debugger
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
          // triangle and bar
          var obj = this.id.substr(4,5);
          triangleIds.forEach(function(s){
            d3.select("#" + s + obj).
            each(function (t){
              this.setAttribute("visibility", "hidden");
            });
          })

          // d3.selectAll('*[class^="dot-"]').
          // each(function (t){
          //   this.setAttribute("visibility", "visible");
          // });

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
        counterdot += 1;
        return counterdot * 100;
      })
      .ease("linear")
      .style({
        "opacity": 1,
        "cursor" : "pointer",
        "z-index": "1"
      })
    ;


    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);


      // political party bars

    var barparty = d3.select("svg")
      .append("g")
      .selectAll("rect")
      .data(isPolPartydata)
      .enter()
      .append("rect")
      .attr({
        "x": dxStart,
        "y": function(d) {return 40 + htimeline + margintop + paddingdoc + d.y}, // positioning bars below each other in one category function (d) {return (h - d)}
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

          tooltip.html("<p class='bgtexttime'>Company: " + d['company'] + " <br/> Position: " + d['positionis'] + " <br/> Period: "
                    + shortFormat(new Date(d['originalStart'])) + " - " + shortFormat(new Date(d['originalEnd'])) + " <br/> Source: " + d['sourceis'] + "</p>");

        var obj = this.id.substr(6,7);
        showpp.forEach(function(s){
          d3.select(s + obj).each(function() {
          this.setAttribute("visibility", "visible");
          });
        });
      })
      .on("mousemove", function(d){
        tooltip.style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 30) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);

        var obj = this.id.substr(6,7);
        showpp.forEach(function(s){
          d3.select(s + obj).each(function() {
          this.setAttribute("visibility", "hidden");
          });
        });
      })
    ;

} // end timeElements
