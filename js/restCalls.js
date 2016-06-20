const tnPersonEndPoint = "https://api.transparantnederland.nl/search?type=tnl%3APerson&q=";
const tnRelationEndPoint = "https://api.transparantnederland.nl/relations?id=";
const tnLinkedPeopleEndPoint = "https://api.transparantnederland.nl/peopleFromOrgsFromPerson?id=";

var bar;

function getRelations(id,dataSet,linkedSet){

  var theUrl = tnRelationEndPoint + encodeURIComponent(id);

  var request = d3.json(theUrl,function(error,response){
    if (error != null){
      handleError("Error in getRelations: " + error);
    }else if (response != null) {

      for (var index = 0; index < response.length; ++index) {
        var name = response[index].pit.name;
        var id = response[index].pit.id;
        var position = response[index].relation.type;
        var start = response[index].relation.since;
        var end = response[index].relation.until;
        var source = response[index].pit.dataset;
        var type = response[index].pit.type;

        // start = (start != "" ? start : defaultStartDate);
        if( start == "" ){
          continue;
        }
        end = (end != "" ? end : defaultEndDate);

        // https://api.transparantnederland.nl/search?id=urn:hgid:pdc/vvd
        dataSet["_children"].push(
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
      getCompanySectors(dataSet,linkedSet);
      mergeDatasets(dataSet,linkedSet);
    }
  });
  requests.push(request);
}

function makeSectorCallback(index,dataSet,linkedSet) {
  return function(error,response) {

    if (error != null){
      handleError("Error in makeSectorCallback: " + error);
    }else if (response != null) {
      //console.log("Dim reply " + response.length)
      for (var i=0;i<response.length;++i){
        //console.log("Type " + response[i].pit.type)
        if (response[i].pit.type === "tnl:Sector"){
          dataSet["_children"][index].sector = response[i].pit.name;
          done++
          mergeDatasets(dataSet,linkedSet);
          return
        }
      }
      dataSet["_children"][index].sector = "Other service activities";
      done++
      mergeDatasets(dataSet,linkedSet);
    }
  }
}

function getCompanySectors(dataSet,linkedSet){

  for (var index=0;index<dataSet["_children"].length;++index){
    var id = dataSet["_children"][index].id;

    var theUrl = tnRelationEndPoint + encodeURIComponent(id);

    var myfunct = makeSectorCallback(index,dataSet,linkedSet);

    var request = d3.json(theUrl,myfunct);

    requests.push(request);

  }
}

function getLinkedPeople(id, dataSet,linkedSet){

  var theUrl = tnLinkedPeopleEndPoint + encodeURIComponent(id);

  var request = d3.json(theUrl,function(error,response){
    if (error != null){
      handleError("Error in getLinkedPeople: " + error);
    }else if (response != null) {
      for (var index = 0; index < response.length; ++index) {
        var id = response[index][0].pit.id;
        var name = response[index][0].pit.name;
        if (name == egoName){
          continue;
        }
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
        if (relationStart == ""){
          continue;
        }
        // relationStart = (relationStart != "" ? relationStart : defaultStartDate);

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

        if (linkedSet[relationId] === undefined){
          linkedSet[relationId] = [];
        }
        linkedSet[relationId].push(element);
      }
      done++
      mergeDatasets(dataSet,linkedSet);
    }
  });

  requests.push(request);

}

function mergeDatasets(dataSet,linkedSet) {

  var elements = 2 + dataSet["_children"].length;
  if (done != elements){
    bar.animate(done*1.0/elements);  // Number from 0.0 to 1.0
    return;
  }

  for (var index=0;index<dataSet._children.length;++index){
    var childId = dataSet._children[index].id;
    if (linkedSet[childId] !== undefined){
      for (var index1=0;index1<linkedSet[childId].length;++index1){
        // Set the type of the _children using the type of the parent node
        // They need to be the same because this is the relation
        linkedSet[childId][index1].relation.type = dataSet._children[index].type;
        linkedSet[childId][index1].relation.sector = dataSet._children[index].sector;
        dataSet._children[index]._children.push(linkedSet[childId][index1]);
      }
    }
  }
  window.dispatchEvent(dataReadyEvent);
}

function progressBar(elementID){
  // progressbar.js@1.0.0 version is used
// Docs: http://progressbarjs.readthedocs.org/en/1.0.0/

  bar = new ProgressBar.Circle(elementID, {
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
