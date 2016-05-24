var timeElements = function(dataset) {
  
  // bars

  var bars = d3.select("svg")
    .append("g")
    .attr({
        "class": "gbar"
      })
    .selectAll("rect")
    .data(theseBands)
    .enter()
    .append("rect")
    .filter(function(d) {return d.typeis !== 'Political Party'})
    .attr({
      "x": dxStart,
      "y": htimeline + paddingdoc + margintop, // to move from top to bottom
      "height": function(d) {return d.dy; }, //meaning d.dy??
      "width": function(d) {return d.end - d.start; },
      "fill": sectorfill,
      "class": function(d) {return "bar-" + d.sector.replace(/\W/gi, '-').toLowerCase()},
      "id": function(d) {
        idcounterbar += 1;
        return "bar-" + idcounterbar; },
      "visibility": "hidden",
      "pointer-events": "visible" // can only be targeted when visibility is set to visible
    })
    ;

  
    //triangles

    theseBands
      .filter(function(b) {
        return b.typeis !== 'Political Party';
      })
      .forEach(function(d) {
    
        var xPoint = ((d.end - d.start)/ 2) + d.start + paddingdoc + marginleft; // x top-triangle point
        var yPoint =  htimeline - ((d.end - d.start)/ 2)  + paddingdoc + margintop ;  // y top triangle point
        var dxStart = d.start + paddingdoc + marginleft;// startpoint bar plus extra left padding
        var dyBar = htimeline + margintop + paddingdoc ; // to move from top to bottom
        var dxEnd = d.end + paddingdoc + marginleft; // endpoint bar

        var trianglePoints = [ { "x": dxStart,   "y": dyBar},  { "x": xPoint,   "y": yPoint}, { "x": dxEnd,   "y": dyBar} ];

        var lineFunction = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("linear"); // straight lines

        var triangle = d3.select("svg")
          .append("g")
          .attr({
            "class": "gtri"
          })
          .selectAll("lines")
          .data([d])
          .enter()
          .append("path")
          .attr({
            "d": lineFunction(trianglePoints),
            "stroke": sectorfill,
            "stroke-width": 1,
            "fill-opacity": 0,
            "class": function(d) {return "tri-" + d.sector.replace(/\W/gi, '-').toLowerCase()},
            "id": function(d) {
              idcountertri += 1;
              return "tri-" + idcountertri; 
              },
            "visibility": "hidden",
            "pointer-events": "visible" // can only be targeted when visibility is set to visible
            })
          .style({
            "stroke-dasharray": ("3, 3"),
            "opacity": 0.4
          })
          ;
      })
    ;

  
    // dots
    var dots = d3.select("svg")
      .append("g")
      .attr({
        "class": "gdot"
      })
      .selectAll("circle")
      .data(theseBands)
      .enter()
      .append("circle")
      .filter(function(d){return d.typeis !== 'Political Party'})
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

    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    dots 
      .on("mouseover", function(d) {
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);

          var format = d3.time.format("%d/%m/%Y");
          tooltip.html("<p class='bgtexttime'>Company: " + d['company'] + " <br/> Position: " + d['positionis'] + " <br/> Period: " + format(new Date(d['originalStart'])) + " - " + format(new Date(d['originalEnd'])) + " <br/> Source: " + d['sourceis'] + "</p>");
          //triangle and bar
          var active = this.active ? true : false;
          var visibility = active ? "hidden" : "visible";
          var obj = this.id.substr(4,5);
          show.forEach(function(s){
            d3.select(s + obj).each(function() {  
            this.setAttribute("visibility", visibility);
            });
          });
      })
      .on("mousemove", function(d){
        tooltip.style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 85) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
          // triangle and bar
          var active = this.active ? true : false;
          var visibility = active ? "visible" : "hidden";
          var obj = this.id.substr(4,5);
          show.forEach(function(s){
            d3.select(s + obj).each(function() {  
            this.setAttribute("visibility", visibility);
            });
          });
      })
      ;


      // text inside circle
      var textDot = d3.select("svg")
      .append("g")
      .attr({
        "class": "gdottxt"
      })
      .selectAll("text")
      .data(theseBands)
      .enter()
      .append("text")
      .filter(function(d){
        return d.typeis !== 'Political Party'
      })
      .style("opacity",1)
      .attr({
        "x": xPointTxt,
        "y": yPointTxt,
        "class": function(d) {return "dottxt-" + d.sector.replace(/\W/gi, '-').toLowerCase()},
        "fill": "#FFF",
        "pointer-events": "none",
        "visibility": "visible"
      })
      // point text, for doubles
      .text(dottxtfunc)        
      ;
 
 
      // political party bars

    var barparty = d3.select("svg")
      .append("g")
      .selectAll("rect")
      .data(theseBands)
      .enter()
      .append("rect")
      .filter(function(d) {return d.typeis === 'Political Party'})
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
          
          var format = d3.time.format("%d/%m/%Y");
          tooltip.html("<p class='bgtexttime'>Company: " + d['company'] + " <br/> Position: " + d['positionis'] + " <br/> Period: " + format(new Date(d['originalStart'])) + " - " + format(new Date(d['originalEnd'])) + " <br/> Source: " + d['sourceis'] + "</p>");

        var active = this.active ? true : false;
        var visibility = active ? "hidden" : "visible";
        var obj = this.id.substr(6,7);
        showpp.forEach(function(s){
          d3.select(s + obj).each(function() {  
          this.setAttribute("visibility", visibility);
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

        var active = this.active ? true : false;
        var visibility = active ? "visible" : "hidden";
        var obj = this.id.substr(6,7);
        showpp.forEach(function(s){
          d3.select(s + obj).each(function() {  
          this.setAttribute("visibility", visibility);
          });
        });
      })
      ;

} // end timeElements