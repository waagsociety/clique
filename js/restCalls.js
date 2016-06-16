const tnPersonEndPoint = "https://api.transparantnederland.nl/search?type=tnl%3APerson&q=";
const tnRelationEndPoint = "https://api.transparantnederland.nl/relations?id=";
const tnLinkedPeopleEndPoint = "https://api.transparantnederland.nl/peopleFromOrgsFromPerson?id=";

function getRelations(id,dataSet,linkedSet){

  var theUrl = tnRelationEndPoint + encodeURIComponent(id);

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
}

function makeSectorCallback(index,dataSet,linkedSet) {
  return function(error,response) {

    if (error != null){
      handleError("Error in makeSectorCallback: " + error);
    }else if (response != null) {
      //console.log("Dim reply " + response.length)
      for(i=0;i<response.length;++i){
        //console.log("Type " + response[i].pit.type)
        if(response[i].pit.type === "tnl:Sector"){
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

  for(index=0;index<dataSet["_children"].length;++index){
    var id = dataSet["_children"][index].id;

    var theUrl = tnRelationEndPoint + encodeURIComponent(id);

    var myfunct = makeSectorCallback(index,dataSet,linkedSet);

    d3.json(theUrl,myfunct);

  }
}

function getLinkedPeople(id, dataSet,linkedSet){

  var theUrl = tnLinkedPeopleEndPoint + encodeURIComponent(id);

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

        if(linkedSet[relationId] === undefined){
          linkedSet[relationId] = [];
        }
        linkedSet[relationId].push(element);
      }
      done++
      mergeDatasets(dataSet,linkedSet);
    }
  });

}
