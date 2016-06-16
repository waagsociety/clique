const EGO_TYPE = "ego";
const ANTA_TYPE = "anta";

const paddingPopUp = 20;
const paddingVert = 30;

var antaDataSet = {};
var antaLinkedDataSet = {};
var sharedExperiences;
var experienceCache;

function sharedConnections(node){
  antaDataSet = {};
  antaLinkedDataSet = {};

  antaDataSet["id"] = node.id;
  antaDataSet["name"] = node.name;
  antaDataSet["type"] = node.type;
  antaDataSet["_children"] = [];


  // Listen for the event.
  window.addEventListener('dataReady', makeTables, false);

  done = 0;
  getRelations(node.id,antaDataSet,antaLinkedDataSet);

  getLinkedPeople(node.id,antaDataSet,antaLinkedDataSet);
}


function makeTables(e){
  d3.select("#progresspopup").remove();
  bar = {};

  window.removeEventListener('dataReady',makeTables,false);


  sharedExperiences = [];
  experienceCache = [];

  var popupHeight = height/2;

  findCommonExperiences(egoDataSet,antaDataSet["name"]);

  var svgPopUp = d3.select("div#popupdiv")
                  .append("svg")
                  .attr({
                    width: width,
                    height: popupHeight
                  })
                  ;

  var xCompTimeExtent = [d3.min(sharedExperiences, function(d) { return dateFormat.parse(d.start); }),
                    d3.max(sharedExperiences, function(d) { return dateFormat.parse(d.end); })];

  var xCompTimeScale = d3.time.scale() // input domain , output range
    .domain(xCompTimeExtent)
    .range([0, width-2*paddingPopUp]);

  var xCompTimeAxis = d3.svg.axis()
      .scale(xCompTimeScale)
      .orient("bottom") // text orient
      .ticks(d3.time.year, 1)
      .tickFormat(d3.time.format('%Y'))
      .tickSize(3, 1) // inner tick size(value, length ticks themselves), outer tick size(line-thickness axis)
      .tickPadding(6) // space between ticks and values
      ;


  var timeline = d3.layout.timeline()
     .size([width-2*paddingPopUp, popupHeight/2])
     .extent(xCompTimeExtent)
     .padding(4)
     .maxBandHeight(12); // height bands

  var egoBars = timeline(sharedExperiences.filter(function(d){return d.type === EGO_TYPE;}));

  drawBars(svgPopUp,egoBars,paddingPopUp,0);

  var offset = d3.max(egoBars,function(d){return d.y;}) + paddingVert;

  svgPopUp.append("g")
     .attr({
       "transform": "translate(" + paddingPopUp + "," + offset + ")",
       "class": "x axis"
     })
     .call(xCompTimeAxis)
     .append("text")
     .text("Time in years")
    //  .attr("transform", "translate(" + (w - paddingPopUp - marginright - 50) + " ," + (paddingPopUp + 8) + ")")
     ;

  var antaBars = timeline(sharedExperiences.filter(function(d){return d.type === ANTA_TYPE;}));

  offset = offset + paddingVert;

  drawBars(svgPopUp,antaBars,paddingPopUp,offset);



}

function drawBars(svg,data,shiftX,shiftY){
  svg.append("g")
      .attr({
        "transform": "translate(" + shiftX + "," + shiftY + ")"
      })
     .selectAll("rect")
     .data(data)
     .enter()
     .append("rect")
     .attr({
       "x": function(d) {return d.start},
       "y": function(d) {return d.y},
       "height": function(d) {return d.dy; }, //
       "width": function(d) {return d.end - d.start; },
       "fill": function(d) {return sectorToNameAndColor(d.sector).color; },
       "pointer-events": "visible"
     })
     .on("mouseover", function(d) {
       tooltip.transition()
         .duration(200)
         .style("opacity", .9);

       tooltip.html("<p class='bgtexttime'>Company: " + d['name'] + " <br/> Position: " + d['position'].split(':')[1] + " <br/> Period: "
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

}

function findCommonExperiences(currentNode,name){
  if (currentNode._children !== undefined && currentNode._children.length > 0){
    var alreadyFound = false;
    for (var i=0;i<currentNode._children.length;++i){
      var found = findCommonExperiences(currentNode._children[i],name);
      if (found && ! alreadyFound){
        alreadyFound = true;
        sharedExperiences.push({
          name : currentNode.name,
          type : EGO_TYPE,
          start : currentNode.start,
          end : currentNode.end,
          position : currentNode.position,
          positionLabel : currentNode.positionLabel,
          sector : currentNode.sector
        });
      }
    }
  }else if (name === currentNode.name){
    var key = currentNode.relation.name+currentNode.relation.start+currentNode.relation.end;
    if (experienceCache.indexOf(key) === -1 ) {
      experienceCache.push(key);
      sharedExperiences.push({
        name : currentNode.relation.name,
        type : ANTA_TYPE,
        start : currentNode.relation.start,
        end : currentNode.relation.end,
        position : currentNode.relation.position,
        positionLabel : currentNode.relation.positionLabel,
        sector : currentNode.relation.sector
      });
      return true;
    }
  }
  return false;
}
