var xTimeScale;
var yTimeScale;
var xTimeExtent;

function setScales(dataset){

  var dateFormat = d3.time.format('%Y-%m-%d');
  // scales & axes
  xTimeExtent = [d3.min(dataset, function(d) { return dateFormat.parse(d.start); }),
                    d3.max(dataset, function(d) { return dateFormat.parse(d.end); })];

  xTimeScale = d3.time.scale() // input domain , output range
    .domain(xTimeExtent)
    .range([paddingdoc + marginleft, w + paddingdoc - marginright]); // change in figures as well!!

  var yTimeExtent = [0 ,
        ((d3.max(dataset, function(d) { return dateFormat.parse(d.end); }) - d3.min(dataset, function(d) { return dateFormat.parse(d.start); })) / (1000 * 60 * 60 * 24 * 365))
      ];

  yTimeScale = d3.scale.linear()
    .domain(yTimeExtent)
    .range([htimeline + margintop + titlespacing + paddingdoc, paddingdoc + margintop + titlespacing])
    ;


}

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
      "transform": "translate(0 ," + (htimeline + paddingdoc + margintop + titlespacing) + ")",
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
        "x": -105 - paddingdoc - margintop - titlespacing,
        "y": -5 - paddingdoc,
        "transform": "rotate(-90)"
      });

  svg.append("text")
    .text("Political Party")
    .attr({
        "x": marginleft - 60,
        "y": paddingdoc + htimeline + margintop + titlespacing + 48
      });

      brushes(xTimeAxis,svg);
};

function brushes (xTimeAxis,svg){

  var height = htimeline;

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
      .on("brushend", brushended)
      .clear();

  var gBrush = svg.append("g")
      .attr({
        "transform": "translate(" + 0 + ", " + (htimeline + paddingdoc + margintop + titlespacing - height) + " )",
        "class": "brush"
      })
      .call(brush);
//      .call(brush.event);

  gBrush.selectAll("rect")
      .attr("height", height);

  function brushended() {
    if (!d3.event.sourceEvent) return; // only transition after input
    var initialExtent = brush.extent(),
        roundedExtent = initialExtent.map(d3.time.year.round);

    // if empty when rounded, use floor & ceil instead
    if (roundedExtent[0] >= roundedExtent[1]) {
      roundedExtent[0] = d3.time.year.floor(initialExtent[0]);
      roundedExtent[1] = d3.time.year.ceil(initialExtent[1]);
    }

    d3.select(this).transition()
        .call(brush.extent(roundedExtent))
        .call(brush.event);
    createEgoData(roundedExtent);

  }
};
