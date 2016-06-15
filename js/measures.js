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
const ppText = ["#txtpp-"];
const tnPersonEndPoint = "https://api.transparantnederland.nl/search?type=tnl%3APerson&q=";
const tnRelationEndPoint = "https://api.transparantnederland.nl/relations?id=";
const tnLinkedPeopleEndPoint = "https://api.transparantnederland.nl/peopleFromOrgsFromPerson?id=";

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

//https://api.transparantnederland.nl/ontology
//const dateRange = ["01/01/1989", "3/15/2016"];


var egoDataSet={};
var linkedDataSet = {};
var done = 0;

//var name="Jan Anthonie Bruijn";
var name="Femke Halsema";

var bar;

var dateFormat;
var xTimeExtent;
var xTimeScale;
var yTimeExtent;
var yTimeScale;


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

  progressBar();

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
      handleError("Error in getRelations: " + error);
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
      handleError("Error in makeSectorCallback: " + error);
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
      handleError("Error in getLinkedPeople: " + error);
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
        relationStart = (relationStart != "" ? relationStart : defaultStartDate);
        var relationEnd = response[index][0].relation.until;
        relationEnd = (relationEnd != "" ? relationEnd : defaultEndDate);

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

  var elements = 2 + egoDataSet["_children"].length;
  if (done != elements){
    bar.animate(done*1.0/elements);  // Number from 0.0 to 1.0
    return;
  }

  d3.select("#progressbar").remove();
  bar = {};

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


  var svgContainer1 = d3.select("#viz")
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

  var svgContainer2 = d3.select("#viz")
    .append("svg")
    .attr({
      width: width,
      height: height
    })
    .style("border", "0 solid black")
    ;

  initEgonetwork(svgContainer2,width,height);
}

function progressBar(){
  // progressbar.js@1.0.0 version is used
// Docs: http://progressbarjs.readthedocs.org/en/1.0.0/

  bar = new ProgressBar.Circle(progressbar, {
    color: '#aaa',
    // This has to be the same size as the maximum width to
    // prevent clipping
    strokeWidth: 4,
    trailWidth: 1,
    easing: 'easeInOut',
    duration: 1400,
    text: {
      autoStyleContainer: false
    },
    from: { color: '#aaa', width: 1 },
    to: { color: '#333', width: 4 },
    // Set default step function for all animate calls
    step: function(state, circle) {
      circle.path.setAttribute('stroke', state.color);
      circle.path.setAttribute('stroke-width', state.width);

      var value = Math.round(circle.value() * 100);
      if (value === 0) {
        circle.setText('');
      } else {
        circle.setText(value);
      }

    }
  });
  bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
  bar.text.style.fontSize = '2rem';
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
    .range([htimeline + margintop + titlespacing + paddingdoc, paddingdoc + margintop + titlespacing])
    ;


}

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
