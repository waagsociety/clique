const EGO_TYPE = "ego";
const ANTA_TYPE = "anta";

const paddingPopUp = 20;
const paddingVert = 30;

var antaDataSet = {};
var antaLinkedDataSet = {};
var antaTimeSnapshot;

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

  antaTimeSnapshot = createEgoData(antaDataSet);

  sharedExperiences = [];
  experienceCache = [];

  var popupHeight = height/2;

  findCommonExperiences(egoTimeSnapshot,antaDataSet["name"]);

  if (sharedExperiences.length > 0){

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

  var egoFriends = makePeopleList(egoTimeSnapshot,antaTimeSnapshot.name);
  var antaFriends = makePeopleList(antaTimeSnapshot,egoTimeSnapshot.name);

  var commonFriends = [];

  Object.keys(egoFriends).forEach(function (key) {
    if (antaFriends[key] !== undefined){
      commonFriends[key] = {ego:egoFriends[key],anta:antaFriends[key]};
    }
  });
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

function findCommonExperiences(currentNode,name,institute=null,sector=null){
  var alreadyFound = false;

  if( currentNode._children !== undefined || currentNode.children !== undefined){
    var children;
    if (currentNode._children){
      children = currentNode._children;
    }else{
      children = currentNode.children;
    }
    if (children === undefined){
      handleError("should not be undefined: " + currentNode);
    }
    if (children.length > 0){
      for (var i=0;i<children.length;++i){
        if (children[i].type === STATUSNODETYPE && children[i].cliqueStatus === cliqueStatusEnum.BEFORE){
          // skip relations with no overlapping
          continue;
        }
        if (currentNode.sector !== undefined){
          sector = currentNode.sector;
          institute = currentNode.name;
        }
        if (findCommonExperiences(children[i],name,institute,sector)){
          if (currentNode.type === STATUSNODETYPE){
            // pass it to the next level
            return true;
          }
          if (!alreadyFound){
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
      }
    }
  }else if (name === currentNode.name){
    var key = institute+currentNode.start+currentNode.end;
    if (experienceCache.indexOf(key) === -1 ) {
      experienceCache.push(key);
      sharedExperiences.push({
        name : institute,
        type : ANTA_TYPE,
        start : currentNode.start,
        end : currentNode.end,
        position : currentNode.position,
        positionLabel : currentNode.positionLabel,
        sector : sector
      });
      return true;
    }
  }
  return false;
}

function makePeopleList(currentNode,noname,institute=null){

  var peopleList = [];
  if( currentNode._children !== undefined || currentNode.children !== undefined){
    var children;
    if (currentNode._children){
      children = currentNode._children;
    }else{
      children = currentNode.children;
    }
    if (children === undefined){
      handleError("should not be undefined: " + currentNode);
    }
    if (children.length > 0){
      for (var i=0;i<children.length;++i){
        if (currentNode.sector !== undefined){
          institute = currentNode.name;
        }
        var innerList = makePeopleList(children[i],noname,institute);
        Object.keys(innerList).forEach(function (key) {
          if (peopleList[key] === undefined){
            peopleList[key] = [];
          }
          for (var ii=0;ii<innerList[key].length;ii++){
            peopleList[key].push(innerList[key][ii]);
          }
        });
      }
    }
  }else if (currentNode.type == "tnl:Person" && currentNode.name != noname){
    peopleList[currentNode.name] = [{
      name : institute,
      start : currentNode.start,
      end : currentNode.end,
      position : currentNode.position,
      positionLabel : currentNode.positionLabel
    }];
  }
  return peopleList;
}
