
var timeInstructions = function(dataset,svg) { // instructions right side

    var instruct = svg.append("g")
    .attr("y", 0)
    .attr("class","instructable");

    d3.xml("img/timeline_comment.svg", 
        function(error, documentFragment) {

    if (error) {console.log(error); return;}

    var instructbg = documentFragment
                .getElementsByTagName("svg")[0];
    //use plain Javascript to extract the node

    instruct.node().appendChild(instructbg);
    //d3's selection.node() returns the DOM node, so we
    //can use plain Javascript to append content

    var instructSVG = instruct.select("svg");

    instructSVG
      .attr({
      "width": marginright,
      "x": w - marginright + paddingdoc,
      "y": h - marginbottom - htimeline - paddingdoc - titlespacing
      })
      
    ;

    // instructSVG.transition().duration(1000).delay(1000)
    //       .select("path")
    //       .attr("r", 100);

    });
  }