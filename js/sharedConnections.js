const EGO_TYPE = "ego";
const ANTA_TYPE = "anta";

const dateFormatter = d3.time.format("%d-%m-%Y");

const paddingPopUp = 20;
const paddingVert = 30;

var columns;
var popupTooltip;

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
  window.addEventListener('dataReady', showPopUp, false);

  done = 0;
  getRelations(node.id,antaDataSet,antaLinkedDataSet);

  getLinkedPeople(node.id,antaDataSet,antaLinkedDataSet);
}

function showPopUp(e){
  d3.select("#progresspopup").remove();
  bar = {};

  window.removeEventListener('dataReady',showPopUp,false);

  $.fancybox({
            'closeBtn' : true,
            'autoScale': true,
            'width': width,
            'transitionIn': 'fade',
            'transitionOut': 'fade',
            'type': 'iframe',
            'href': 'shared.html',
            'afterShow': makeTables,
            'afterClose': afterCloseFancyBox
  });
}

function afterCloseFancyBox(){
  clicked = null;
}

function submitSearch(){
  $.fancybox(function(){close();})
  resetClique();
  egoName = antaDataSet.name;
  egoDataSet = antaDataSet;
  // egoTimeSnapshot = antaTimeSnapshot;
  makeGraphics();
}

function makeTables(){

  var id = d3.selectAll("iframe").attr("id");
  var iframeElementx = document.getElementById(id);
  var iframeElementy = (iframeElementx.contentWindow || iframeElementx.contentDocument);
  var iframeElementz = iframeElementy.document.body;

  var shared = d3.select(iframeElementz);
  shared.select("div#sharedtitle").select("span.titlename").text(function(){return egoDataSet.name});
  shared.select("div#sharedtitle").select("span.titlegraph").text(function(){return "/ shared connections with " + clicked.name});
  shared.select("div.sharedsubmit").select("span").text(function(){return "/ " + clicked.name});

  var containerDiv = shared.select("div#contentshared");

  popupTooltip = containerDiv.append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  var svgPopUp = containerDiv
                .select("#_sharedpositions")
                .append("svg")
                .attr({
                  width: width,
                  height: popupHeight
                })
                ;

  antaTimeSnapshot = createEgoData(antaDataSet);

  sharedExperiences = [];
  experienceCache = [];

  var popupHeight = height/2;

  findCommonExperiences(egoTimeSnapshot,antaDataSet["name"]);

  if (sharedExperiences.length > 0){

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

  var commonFriends = {};

  Object.keys(egoFriends).forEach(function (key) {
    if (antaFriends[key] !== undefined){
      commonFriends[key] = {[EGO_TYPE]:egoFriends[key],[ANTA_TYPE]:antaFriends[key]};
    }
  });

  if (Object.keys(commonFriends).length > 0){
    var suff = "'s link";
    columns = ["Contact",egoDataSet.name + suff, antaDataSet.name + suff];
    tabulate(containerDiv,commonFriends);
  }
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
       popupTooltip.transition()
         .duration(200)
         .style("opacity", .9);

       popupTooltip.html("<p class='bgtexttime'>Organization: " + d['name'] + " <br/> Position: " + d['position'].split(':')[1] + " <br/> Period: "
                 + shortFormat(new Date(d['originalStart'])) + " - " + shortFormat(new Date(d['originalEnd'])) + "</p>");

     })
     .on("mousemove", function(d){
       popupTooltip.style("left", (d3.event.pageX + 5) + "px")
           .style("top", (d3.event.pageY - 30) + "px");
     })
     .on("mouseout", function(d) {
       popupTooltip.transition()
         .duration(500)
         .style("opacity", 0);

     })
   ;

}

// The table generation function
function tabulate(theDiv,data) {

  var table = theDiv.select("#_sharedcontacts").append("table")
          .attr("class", "sharedtable");

  var thead = table.append("thead");

  var tbody = table.append("tbody");

  // append the header row
  thead.append("tr")
      .selectAll("th")
      .data(columns)
      .enter()
      .append("th")
          .text(function(column) { return column; });

  // create a row for each object in the data
  var rows = tbody.selectAll("tr")
      .data(d3.entries(data).sort(function (a,b){
        if (a.key > b.key) {
          return 1;
        }
        if (a.key < b.key) {
          return -1;
        }
        // a must be equal to b
        return 0;
      }),function (d){return d.key})
      .enter()
      .append("tr");

  // create a cell in each row for each column
  var cells = rows.selectAll("td")
      .data(function(row) {
        return [
                {column: columns[0], value: row.key},
                {column: columns[1], value: row.value[EGO_TYPE]},
                {column: columns[2], value: row.value[ANTA_TYPE]},
              ];
      })
      .enter()
      .append("td")
      .html(function(d) { return printPositions(d); });

  return table;
}

function printPositions(cellData){
  if (cellData.column == columns[0]){
    return cellData.value;
  }else{
    var cellText = "";
    for (var i=0;i<cellData.value.length;++i){
      cellText = cellText + cellData.value[i].name + ", " + cellData.value[i].position.split(':')[1]
                    + " (" + dateFormatter(dateFormat.parse(cellData.value[i].start)) + ", "
                    + dateFormatter(dateFormat.parse(cellData.value[i].end)) + ")<br/>";
    }
    return cellText;
  }
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
