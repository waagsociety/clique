const w = 1100;
const h = 400;
const radius = 6;
const paddingdoc = 20;
const margintop = 10;
const marginleft = 240;
const marginright = 150;
const marginbottom = 200;
const htimeline = (w - marginleft - marginright) / 2
const width = w + (2 * paddingdoc);
const height = htimeline + (2 * paddingdoc) + marginbottom + margintop;
const defaultStartDate = "2012-01-01"
const defaultEndDate = "2016-06-01"

const triangleIds = ["bar-", "tri-"];
const ppText = ["#txtpp-"];
const tnPersonEndPoint = "https://api.transparantnederland.nl/search?type=tnl%3APerson&q=";
const tnRelationEndPoint = "https://api.transparantnederland.nl/relations?id=";
const tnLinkedPeopleEndPoint = "https://api.transparantnederland.nl/peopleFromOrgsFromPerson?id=";

//https://api.transparantnederland.nl/ontology
//const dateRange = ["01/01/1989", "3/15/2016"];


var egoDataSet={};
var linkedDataSet = {};
var done = 0;

//var name="Jan Anthonie Bruijn";
var name="Femke Halsema";

var dateFormat;
var xTimeExtent;
var xTimeScale;
var yTimeExtent;
var yTimeScale;


var xPoint = function(d) {return ((d.end - d.start)/ 2) + d.start + paddingdoc + marginleft; }; // x top-triangle point
var yPoint = function(d) {return htimeline - ((d.end - d.start)/ 2) + paddingdoc + margintop ; }; // y top triangle point
var dxStart = function(d) {return d.start + paddingdoc + marginleft; }; // startpoint bar plus extra left padding
var dxEnd = function(d) {return d.end + paddingdoc + marginleft; }; // endpoint bar
var sectorfill = function(d) {return colorScale(d.sector); }; // color sector
var xPointTxt = function(d) {return ((d.end - d.start)/ 2) + d.start + paddingdoc + marginleft - (radius / 2) + 0.5 ; }; // x top-triangle point
var yPointTxt = function(d) {return htimeline - ((d.end - d.start)/ 2) + paddingdoc + margintop +  (radius / 2); }; // y top triangle point


var types = [];

var colorScale = d3.scale.ordinal()
  .domain(types)
  .range(["#f1c7dd", "#0b326b", "#f5bd42", "#7bcbc0",   "#f05129",  "#b7cc94", "#e3337e", "#827775", "#966eac", "#b09977",]);


// trim data...
 /*
   var clean = dataset.map(function(d) {
    var cleanD = {};
    d3.keys(d).forEach(function(k) {
      cleanD[_.trim(k)] = _.trim(d[k]);
    });
    return cleanD;
  });

  console.log(JSON.stringify(clean));
  */

function startClique(filename) {

  egoDataSet = {};
  linkedDataSet = {};
  //d3.select("div#viz").append("h1").html( "Timeline " + name );

  var myUrl = tnPersonEndPoint + encodeURIComponent(name);

  d3.json(myUrl,function(error,response){
    if (error != null){

    }else if (response !=null ){

      var id = response[0][0].pit.id;
      var name = response[0][0].pit.name;
      var personType = response[0][0].pit.type;

      egoDataSet["id"] = id;
      egoDataSet["name"] = name;
      egoDataSet["type"] = personType;
      egoDataSet["_children"] = [];

      var myUrl = tnRelationEndPoint + encodeURIComponent(id);
      done = 0;
      getRelations(myUrl);
      myUrl = tnLinkedPeopleEndPoint + encodeURIComponent(id);
      getLinkedPeople(myUrl);

    }

  });
}

function getRelations(theUrl){
  d3.json(theUrl,function(error,response){
    if (error != null){

    }else if (response != null) {

      for (index = 0; index < response.length; ++index) {
        var name = response[index].pit.name;
        var id = response[index].pit.id;
        var position = response[index].relation.type;
        var start = response[index].relation.since;
        var end = response[index].relation.until;
        var source = response[index].pit.dataset;
        var type = response[index].pit.type;

        start = (start != "" ? start : defaultStartDate);
        end = (end != "" ? end : defaultEndDate);

        // https://api.transparantnederland.nl/search?id=urn:hgid:pdc/vvd
        egoDataSet["_children"].push(
          {
            "name"       : name,
            "id"            : id,
            "position"    : position,
            "positionLabel" : null,
            "start"         : start,
            "end"           : end,
            "sector"        : "",
            "source"      : source,
            "type"        : type,
            "_children"  : []
          }
        );

      }
      done++
      getCompanySectors();
      mergeDatasets();
    }
  });
}

function makeSectorCallback(index) {
  return function(error,response) {

    if (error != null){

    }else if (response != null) {
      //console.log("Dim reply " + response.length)
      for(i=0;i<response.length;++i){
        //console.log("Type " + response[i].pit.type)
        if(response[i].pit.type === "tnl:Sector"){
          egoDataSet["_children"][index].sector = response[i].pit.name;
          done++
          mergeDatasets();
          return
        }
      }
      egoDataSet["_children"][index].sector = "Other service activities";
      done++
      mergeDatasets();
    }
  }
}

function getCompanySectors(){

  for(index=0;index<egoDataSet["_children"].length;++index){
    var id = egoDataSet["_children"][index].id;

    var theUrl = tnRelationEndPoint + encodeURIComponent(id);

    var myfunct = makeSectorCallback(index);

    d3.json(theUrl,myfunct);

  }
}

function getLinkedPeople(theUrl){
  d3.json(theUrl,function(error,response){
    if (error != null){

    }else if (response != null) {
      for (index = 0; index < response.length; ++index) {
        var id = response[index][0].pit.id;
        var name = response[index][0].pit.name;
        var type = response[index][0].pit.type; // must be person

        var element = {};
        element["id"] = id;
        element["name"] = name;
        element["type"] = type;

        var relationName = response[index][0].relation.to_name
        var relationId = response[index][0].relation.to;
        var relationPosition = response[index][0].relation.type;
        var relationPositionLabel = response[index][0].pit.data.waarde;
        var relationStart = response[index][0].relation.since;
        var relationEnd = response[index][0].relation.until;
        var relationsource = response[index][0].pit.dataset;
        // response[index][0].relation.type is the type of relation,
        // not the type of the related to, we will set this later on
        var relationType = response[index][0].relation.type;

        // https://api.transparantnederland.nl/search?id=urn:hgid:pdc/vvd
        element["relation"] =
          {
            "name"          : relationName,
            "id"            : relationId  ,
            "position"      : relationPosition,
            "positionLabel" : relationPositionLabel,
            "start"         : relationStart,
            "end"           : relationEnd,
            "source"        : relationsource,
            "relationType"  : relationType,
            "type"          : null
          };

        if(linkedDataSet[relationId] === undefined){
          linkedDataSet[relationId] = [];
        }
        linkedDataSet[relationId].push(element);
      }
      done++
      mergeDatasets();
    }
  });

}

function mergeDatasets() {

  if (done != (2 + egoDataSet["_children"].length)){
    return;
  }

  for(index=0;index<egoDataSet._children.length;++index){
    var childId = egoDataSet._children[index].id;
    if(linkedDataSet[childId] !== undefined){
      for(index1=0;index1<linkedDataSet[childId].length;++index1){
        // Set the type of the _children using the type of the parent node
        // They need to be the same because this is the relation
        linkedDataSet[childId][index1].relation.type = egoDataSet._children[index].type;
        egoDataSet._children[index]._children.push(linkedDataSet[childId][index1]);
      }
    }
  }
  makeGraphics(egoDataSet._children)
}

function makeGraphics(dataset) {


  var svgContainer1 = d3.select("body")
    .append("svg")
    .attr({
      width: width,
      height: height
    })
    .style("border", "1px solid black")
    ;

  sectorTypes(dataset);

  setScales(dataset);

  timeAxes(dataset, svgContainer1);

  timeElements(dataset,svgContainer1);

  timeLegend(dataset,svgContainer1);

  var svgContainer2 = d3.select("body")
    .append("svg")
    .attr({
      width: width,
      height: height
    })
    .style("border", "1px solid black")
    ;

  initEgonetwork(svgContainer2,width,height);
}

// array sectors to determine colors -------> counter? Biggest first?

function sectorTypes (dataset){
  dataset.forEach(function(data){
    if (types.indexOf(data.sector) === -1 ) {
      types.push(data.sector);
    }
  });
}


//timeline(dataset); //draw bars & dots

function setScales(dataset){

  var dateFormat = d3.time.format('%Y-%m-%d');
  // scales & axes
  xTimeExtent = [d3.min(dataset, function(d) { return dateFormat.parse(d.start); }),
                    d3.max(dataset, function(d) { return dateFormat.parse(d.end); })];

  xTimeScale = d3.time.scale() // input domain , output range
    .domain(xTimeExtent)
    .range([paddingdoc + marginleft, w + paddingdoc - marginright]); // change in figures as well!!

  yTimeExtent = [0 ,
        ((d3.max(dataset, function(d) { return dateFormat.parse(d.end); }) - d3.min(dataset, function(d) { return dateFormat.parse(d.start); })) / (1000 * 60 * 60 * 24 * 365))
      ];

  yTimeScale = d3.scale.linear()
    .domain(yTimeExtent)
    .range([htimeline + margintop + paddingdoc, paddingdoc + margintop])
    ;


}
