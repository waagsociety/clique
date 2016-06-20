const w = 1100;
const h = 400;
const radius = 6;
const paddingdoc = 20;
const margintop = 50;
const titlespacing = 24
const marginleft = 240;
const marginright = 180;
const marginbottom = 200;
const htimeline = (w - marginleft - marginright) / 2

const triangleIds = ["bar-", "tri-"];
const ppText = ["#txtpp-"];
//const dateRange = ["01/01/1989", "3/15/2016"];

var dateFormat;
var xTimeExtent;
var xTimeScale;
var yTimeExtent;
var yTimeScale;


var xPoint = function(d) {return ((d.end - d.start)/ 2) + d.start + paddingdoc + marginleft; }; // x top-triangle point
var yPoint = function(d) {return htimeline - ((d.end - d.start)/ 2) + paddingdoc + margintop + titlespacing; }; // y top triangle point
var dxStart = function(d) {return d.start + paddingdoc + marginleft; }; // startpoint bar plus extra left padding
var dxEnd = function(d) {return d.end + paddingdoc + marginleft; }; // endpoint bar
var sectorfill = function(d) {return colorScale(d.sector); }; // color sector
var xPointTxt = function(d) {return ((d.end - d.start)/ 2) + d.start + paddingdoc + marginleft - (radius / 2) + 0.5 ; }; // x top-triangle point
var yPointTxt = function(d) {return htimeline - ((d.end - d.start)/ 2) + paddingdoc + margintop + titlespacing + (radius / 2); }; // y top triangle point


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

  d3.csv(filename, function (dataset) {

  sectorTypes(dataset);

  setScales(dataset);

  var svgContainer = d3.select("#viz1")
    .append("svg")
    .attr({
      width: w + (2 * paddingdoc),
      height: htimeline + (2 * paddingdoc) + marginbottom + margintop + titlespacing
    })
    .style("border", "0 solid black")
    ;

  timeAxes(dataset, svgContainer);

  timeInstructions(dataset, svgContainer);

  timeElements(dataset,svgContainer);

  timeLegend(dataset,svgContainer);

  var svgContainer2 = d3.select("#viz2")
    .append("svg")
    .attr({
      width: w + (2 * paddingdoc),
      height: htimeline + (2 * paddingdoc) + marginbottom + margintop + titlespacing
    })
    .style("border", "0 solid black")
    ;

  graphLegend(dataset,svgContainer2);

  });
}


// array sectors to determine colors -------> counter? Biggest first?

function sectorTypes (dataset){
  dataset.forEach(function(data){
    if (types.indexOf(data.sector) === -1 ) {
      types.push(data.sector);
    }
  });
};


//timeline(dataset); //draw bars & dots

function setScales(dataset){

  var dateFormat = d3.time.format('%m/%d/%Y');
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
