// draw Axes

var TimeRelEnum = {
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

var cliqueStatusEnum = {
  UNCHANGED: "unchanged",
  REMOVED: "removed",
  ADDED: "added",
  ADDEDREMOVED: "addedremoved"
};

var displaySet = {};

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

function createEgoData(extent){
  displaySet.id  = egoDataSet.id;
  displaySet.name  = egoDataSet.name;
  displaySet.type  = egoDataSet.type;
  displaySet._children = filterExtent(egoDataSet,extent);
  setEgoData(displaySet);
}

function filterExtent(dataSet,extent){
  var children = [];
  for(i=0;i<dataSet._children.length;++i){
    var timeRelation = TimeRelEnum.BEFORE;
    var nodeStart = new Date(dataSet._children[i].start);
    var nodeEnd = new Date(dataSet._children[i].end);
    if( nodeEnd < extent[0] ){
      timeRelation = TimeRelEnum.BEFORE;
    }else if ( nodeEnd === extent[0] ){
      timeRelation = TimeRelEnum.BEFORESTARTS;
    }else if ( nodeStart < extent[0] && nodeEnd < extent[1] ){
      timeRelation = TimeRelEnum.BEFOREOVERLAP;
    }else if ( nodeStart < extent[0] && nodeEnd === extent[1] ){
      timeRelation = TimeRelEnum.BEFOREEND;
    }else if ( nodeStart < extent[0] && nodeEnd > extent[1] ){
      timeRelation = TimeRelEnum.BEFOREAFTER;
    }else if ( nodeStart === extent[0] && nodeEnd < extent[1] ){
      timeRelation = TimeRelEnum.STARTSOVERLAP;
    }else if ( nodeStart === extent[0] && nodeEnd === extent[1] ){
      timeRelation = TimeRelEnum.STARTSEND;
    }else if ( nodeStart === extent[0] && nodeEnd > extent[1] ){
      timeRelation = TimeRelEnum.STARTSAFTER;
    }else if ( nodeStart > extent[0] && nodeEnd < extent[1] ){
      timeRelation = TimeRelEnum.OVERLAP;
    }else if ( nodeStart > extent[0] && nodeEnd === extent[1] ){
      timeRelation = TimeRelEnum.OVERLAPEND;
    }else if ( nodeStart > extent[0] && nodeEnd > extent[1] ){
      timeRelation = TimeRelEnum.OVERLAPAFTER;
    }else if ( nodeStart === extent[1] ){
      timeRelation = TimeRelEnum.ENDAFTER;
    }else if ( nodeStart > extent[1] ){
      timeRelation = TimeRelEnum.AFTER;
    }else{

    }
    switch(timeRelation) {
      case TimeRelEnum.BEFORE:
        //dataSet._children.splice(i,1);
        break;
      case TimeRelEnum.BEFORESTARTS:
        //dataSet._children.splice(i,1);
        break;
      case TimeRelEnum.BEFOREOVERLAP:
        children.push(dataSet._children[i]);
        dataSet._children[i].cliqueStatus = cliqueStatusEnum.REMOVED;
        break;
      case TimeRelEnum.BEFOREEND:
        children.push(dataSet._children[i]);
        dataSet._children[i].cliqueStatus = cliqueStatusEnum.UNCHANGED
        break;
      case TimeRelEnum.BEFOREAFTER:
        children.push(dataSet._children[i]);
        dataSet._children[i].cliqueStatus = cliqueStatusEnum.UNCHANGED;
        break;
      case TimeRelEnum.STARTSOVERLAP:
        children.push(dataSet._children[i]);
        dataSet._children[i].cliqueStatus = cliqueStatusEnum.REMOVED;
        break;
      case TimeRelEnum.STARTSEND:
        children.push(dataSet._children[i]);
        dataSet._children[i].cliqueStatus = cliqueStatusEnum.UNCHANGED;
        break;
      case TimeRelEnum.STARTSAFTER:
        children.push(dataSet._children[i]);
        dataSet._children[i].cliqueStatus = cliqueStatusEnum.UNCHANGED;
        break;
      case TimeRelEnum.OVERLAP:
        children.push(dataSet._children[i]);
        dataSet._children[i].cliqueStatus = cliqueStatusEnum.ADDEDREMOVED;
        break;
      case TimeRelEnum.OVERLAPEND:
        children.push(dataSet._children[i]);
        dataSet._children[i].cliqueStatus = cliqueStatusEnum.ADDED;
        break;
      case TimeRelEnum.OVERLAPAFTER:
        children.push(dataSet._children[i]);
        dataSet._children[i].cliqueStatus = cliqueStatusEnum.ADDED;
        break;
      case TimeRelEnum.ENDAFTER:
        children.push(dataSet._children[i]);
        dataSet._children.splice(i,1);
        break;
      case TimeRelEnum.AFTER:
        //dataSet._children.splice(i,1);
        break;
      default:
        console.log("ERROR: unknown time relation:" + timeRelation)

    }
  }
  return children;
}
