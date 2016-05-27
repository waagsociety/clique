// draw Axes

function timeAxes (dataset,svg) {
  // img timeline

  var showTimeAxis = true, // variable, meerdere vars door komma's
    beginning = 0,
    ending = 0,
    width = null,
    height = null,
    orient = "bottom"
    ;


  var xTimeAxis = d3.svg.axis()
    .scale(xTimeScale)
    .orient("bottom") // text orient
    .ticks(d3.time.year, 1)
    .tickFormat(d3.time.format('%Y'))
    .tickSize(3, 1) // inner tick size(value, length ticks themselves), outer tick size(line-thickness axis)
    .tickPadding(6) // space between ticks and values
    ;

 svg.append("g")
    .attr({
      "transform": "translate(0 ," + (htimeline + paddingdoc + margintop) + ")",
      "class": "x axis"
    })
    .call(xTimeAxis)
    .append("text")
    .text("Time in years")
    .attr("transform", "translate(" + (w - paddingdoc - marginright - 50) + " ," + (paddingdoc + 8) + ")")
    ;


  var yTimeAxis = d3.svg.axis()
    .scale(yTimeScale)
    .orient("left")
    .ticks(8)
    .tickSize(3, 1)
    ;

  svg.append("g")
    .attr({
      "transform": "translate(" + (paddingdoc + marginleft) + ", 0 )",
      "class": "y axis"
    })
    .call(yTimeAxis)
    .append("text")
    .text("Duration in years")
    .attr({
        "x": -105 - paddingdoc - margintop,
        "y": -5 - paddingdoc,
        "transform": "rotate(-90)"
      });

  svg.append("text")
    .text("Political Party")
    .attr({
        "x": marginleft - 60,
        "y": paddingdoc + htimeline + margintop + 48
      });

      brushes(xTimeAxis,svg);
};

function brushes (xTimeAxis,svg){

  var height = htimeline ;

  // svg.append("g")
  //   .attr("class", "x grid")
  //   .attr({
  //     "transform": "translate(" + 0 + ", " + (htimeline + paddingdoc + margintop - height) + " )"
  //     }
  //   )
  //   .call(xTimeAxis)
  // .selectAll(".tick")
  //   .classed("minor", function(d) { return d.getHours(); });

  var brush = d3.svg.brush()
      .x(xTimeScale)
      .extent(xTimeExtent)
      .on("brushend", brushended);

  var gBrush = svg.append("g")
      .attr({
        "transform": "translate(" + 0 + ", " + (htimeline + paddingdoc + margintop - height) + " )",
        "class": "brush"
      })
      .call(brush)
      .call(brush.event);

  gBrush.selectAll("rect")
      .attr("height", height);

  function brushended() {
    if (!d3.event.sourceEvent) return; // only transition after input
    var extent0 = brush.extent(),
        extent1 = extent0.map(d3.time.year.round);

    // if empty when rounded, use floor & ceil instead
    if (extent1[0] >= extent1[1]) {
      extent1[0] = d3.time.year.floor(extent0[0]);
      extent1[1] = d3.time.year.ceil(extent0[1]);
    }
    //debugger
    d3.select(this).transition()
        .call(brush.extent(extent1))
        .call(brush.event);
  }
};
