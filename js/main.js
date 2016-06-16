const w = 1100;
const h = 400;
const radius = 6;
const paddingdoc = 20;
const margintop = 50;
const titlespacing = 24
const marginleft = 240;
const marginright = 150;
const marginbottom = 200;
const htimeline = (w - marginleft - marginright) / 2
const width = w + (2 * paddingdoc);
const height = htimeline + (2 * paddingdoc) + marginbottom + margintop + titlespacing;
const defaultStartDate = "2012-01-01"
const defaultEndDate = "2016-06-01"

const triangleIds = ["bar-", "tri-"];

const sectorColorTable = {
  "Human health and social work activities" : {	name : "Human health and social work", color : "#F1C7DD"},
  "Real estate activities" : {name : "Real estate activities", color : "#E3337E"},
  "Wholesale and retail trade; repair of motor vehicles and motorcycles" :	{name: "Wholesale and retail trade", color: "#7A2A90"},
  "Mining and quarrying" : {name : "Mining and quarrying", color: "#F5BD42"},
  "Activities of extraterritorial organisations and bodies"	: {name: "Extraterritorial organisations", color : "#B5A01F"},
  "Education"	: {name : "Education", color : "#F05129"},
  "Financial and insurance activities" : {name: "Financial and insurance", color: "#966EAC"},
  "Construction"	: {name : "Construction", color : "#4EBDE5"},
  "Agriculture, forestry and fishing"	: {name : "Agriculture, forestry and fishing", color : "#DE5C8E"},
  "Activities of household as employers; undifferentiated goods- and services-producing activities of households for own use"	: {name : "Activities of household as employers", color : "#F89C5B"},
  "Public administration and defence; compulsory social security"	: {name : "Public administration and defence", color : "#0B326B"},
  "Information and communication"	: {name : "Information and communication", color : "#7BCBC0"},
  "Water supply; sewerage, waste management and remediation activities"	: {name : "Water supply; sewerage and waste", color : "#006FBA"},
  "Other service activities" : {name : "Other service activities", color : "#CCCCCC"},
  "Administrative and support service activities"	: {name : "Administrative and support", color : "#B09977"},
  "Accommodation and food service activities"	: {name : "Accommodation and food", color : "#D0DD28"},
  "Electricity, gas, steam and air conditioning supply" : {name : "Electricity, gas and air", color : "#7B0165"},
  "Arts, entertainment and recreation"	: {name : "Arts, entertainment and recreation", color : "#B7CC95"},
  "Professional, scientific and technical activities"	: {name : "Professional, scientific and technical", color : "#145F1F"},
  "Transportation and storage"	: {name : "Transportation and storage", color : "#00A390"},
  "Manufacturing"	: {name : "Manufacturing", color : "#EE202E"}
};

const dataReadyEvent = new Event('dataReady');

//https://api.transparantnederland.nl/ontology
//const dateRange = ["01/01/1989", "3/15/2016"];


var egoDataSet={};
var linkedDataSet = {};
var done = 0;

//var name="Jan Anthonie Bruijn";
var name="Femke Halsema";
var tooltip;





var xPoint = function(d) {return ((d.end - d.start)/ 2) + d.start + paddingdoc + marginleft; }; // x top-triangle point
var yPoint = function(d) {return htimeline - ((d.end - d.start)/ 2) + paddingdoc + margintop + titlespacing; }; // y top triangle point
var dxStart = function(d) {return d.start + paddingdoc + marginleft; }; // startpoint bar plus extra left padding
var dxEnd = function(d) {return d.end + paddingdoc + marginleft; }; // endpoint bar
var xPointTxt = function(d) {return ((d.end - d.start)/ 2) + d.start + paddingdoc + marginleft - (radius / 2) + 0.5 ; }; // x top-triangle point
var yPointTxt = function(d) {return htimeline - ((d.end - d.start)/ 2) + paddingdoc + margintop + titlespacing + (radius / 2); }; // y top triangle point


var types = [];

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

  progressBar("#progressstart");

  var myUrl = tnPersonEndPoint + encodeURIComponent(name);

  d3.json(myUrl,function(error,response){
    if (error != null){
      handleError("Error in getting " + myUrl + ", " + error);
    }else if (response !=null ){

      var id = response[0][0].pit.id;
      var name = response[0][0].pit.name;
      var personType = response[0][0].pit.type;

      egoDataSet["id"] = id;
      egoDataSet["name"] = name;
      egoDataSet["type"] = personType;
      egoDataSet["_children"] = [];


      // Listen for the event.
      window.addEventListener('dataReady', makeGraphics, false);

      done = 0;
      getRelations(id,egoDataSet,linkedDataSet);

      getLinkedPeople(id,egoDataSet,linkedDataSet);

    }

  });
}


function makeGraphics(e) {

  d3.select("#progressstart").remove();
  bar = {};

  window.removeEventListener('dataReady',makeGraphics,false);

  var dataset = egoDataSet._children;

  var svgContainer1 = d3.select("#viz1")
    .append("svg")
    .attr({
      width: width,
      height: height
    })
    .style("border", "1px solid black")
    ;

  sectorTypes(dataset);

  setScales(dataset);

  tooltip = d3.select("section.content").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  timeAxes(dataset, svgContainer1);

  timeElements(dataset,svgContainer1);

  timeLegend(dataset,svgContainer1);

  var svgContainer2 = d3.select("#viz2")
    .append("div").attr("id","graphdiv")
    .append("svg")
    .attr({
      width: width,
      height: height
    })
    .style("border", "0 solid black")
    ;

  initEgonetwork(svgContainer2,width,height);
}

function sectorTypes (dataset){
  dataset.forEach(function(data){
    if (types.indexOf(data.sector) === -1 ) {
      types.push(data.sector);
    }
  });
}


//timeline(dataset); //draw bars & dots


function handleError(message){
  console.log(message);
}

function sectorToNameAndColor(sector){
  var entry = sectorColorTable[sector];
  if ( entry === undefined){
    handleError("Sector not found: " + sector);
  }else{
    return {name : entry.name, color: entry.color};
  }
}
