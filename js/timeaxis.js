const SECTORNODETYPE = "SECTORNODETYPE";
const STATUSNODETYPE = "STATUSNODETYPE";

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
  BEFORE: "before",
  MINUS: "minus",
  EQUAL: "equal",
  DURING: "during",
  PLUS: "plus",
  NONE: "none"
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
  displaySet = {};
  var uniqueNodeIndex=0;
  displaySet.id  = egoDataSet.id;
  displaySet.name  = egoDataSet.name;
  displaySet.type  = egoDataSet.type;
  displaySet._children = [];

  for(i=0;i<egoDataSet._children.length;++i){

    // Is the node in scope?
    var timeRelation = filterExtent(egoDataSet._children[i],extent);
    if (timeRelation === cliqueStatusEnum.NONE){
      continue;
    }

    var instNode = {}, instToCopy = egoDataSet._children[i];
    instNode.id = instToCopy.id;
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

    for (ii=0;ii<displaySet._children.length;++ii){

      if (displaySet._children[ii].name === instToCopy.sector && displaySet._children[ii].cliqueStatus === timeRelation){

        displaySet._children[ii]._children.push(instNode);
        sectorStatusExist = true;
        break;
      }
    }
    if (!sectorStatusExist){
      var sectorNode = {};
      sectorNode.name = instToCopy.sector;
      sectorNode.cliqueStatus = timeRelation;
      sectorNode.type = SECTORNODETYPE;
      sectorNode.id = sectorNode.type + "_" + uniqueNodeIndex++;
      sectorNode._children = [];
      sectorNode._children.push(instNode);
      displaySet._children.push(sectorNode);
    }

    for (j=0;j<instToCopy._children.length;++j){

      timeRelation = filterExtent(instToCopy._children[j].relation,extent);
      if (timeRelation === cliqueStatusEnum.NONE){
        continue;
      }
      var personNode = {}, personToCopy = instToCopy._children[j];
      personNode.id = personToCopy.id;
      personNode.name = personToCopy.name;
      personNode.type = personToCopy.type;
      personNode.position = personToCopy.relation.position;
      personNode.positionLabel = personToCopy.relation.positionLabel;
      personNode.source = personToCopy.source;
      personNode.start = personToCopy.relation.start;
      personNode.end = personToCopy.relation.end;

    }

    var statusExist = false;

    for (ii=0;ii<instNode._children.length;++ii){

      if (instNode._children[ii].name === timeRelation){

        instNode._children[ii]._children.push(personNode);
        statusExist = true;
        break;
      }
    }
    if (!statusExist){
      var statusNode = {};
      statusNode.name = timeRelation;
      statusNode.cliqueStatus = timeRelation;
      statusNode.type = STATUSNODETYPE;
      statusNode.id = statusNode.type + "_" + uniqueNodeIndex++;
      statusNode._children = [];
      statusNode._children.push(personNode);
      instNode._children.push(statusNode);
    }

  }

  setEgoData(displaySet);
}

function filterExtent(nodeToFilter,extent){

    var timeRelation = TimeRelEnum.BEFORE;
    var nodeStart = new Date(nodeToFilter.start);
    var nodeEnd = new Date(nodeToFilter.end);
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
