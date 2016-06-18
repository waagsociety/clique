
var timeInstructions = function(dataset,svg) { // instructions right side

    var instruct = svg.append("g")
    .attr("class","instructable");

    var instructback = instruct.append("g")
    .attr("class","instructbg");

    //add svg bg
    d3.xml("img/timeline_comment.svg", 
        function(error, documentFragment) {

    if (error) {console.log(error); return;}

    var instructbg = documentFragment
                .getElementsByTagName("svg")[0];
    //use plain Javascript to extract the node

    instructback.node().appendChild(instructbg);
    //d3's selection.node() returns the DOM node, so we
    //can use plain Javascript to append content

    var instructSVG = instructback.select("svg");

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

    // add svg icon click drag

    var icondrag = instruct.append("g")
    .attr("class","icondrag");

        d3.xml("img/clickdrag.svg", 
        function(error, documentFragment) {

    if (error) {console.log(error); return;}

    var clickdrag = documentFragment
                .getElementsByTagName("svg")[0];
    //use plain Javascript to extract the node

    icondrag.node().appendChild(clickdrag);
    //d3's selection.node() returns the DOM node, so we
    //can use plain Javascript to append content

    var clickdragSVG = icondrag.select("svg");

    clickdragSVG
      .attr({
      "width": marginright / 5,
      "x": w - marginright + paddingdoc + 20,
      "y": h - marginbottom - htimeline - paddingdoc - titlespacing - 25
      }) 
    ;

    // instructSVG.transition().duration(1000).delay(1000)
    //       .select("path")
    //       .attr("r", 100);

    });

    icondrag.append("text")
    .text("Click and drag")
    .attr({
      "class": "timeinstructtop",
      "x": w - marginright + paddingdoc + (marginright / 5) + 20 + 10,
      "y": paddingdoc + titlespacing + 70
      }) 
    ;

    icondrag.append("text")
    .text("to select a period")
    .attr({
      "class": "timeinstructbottom",
      "x": w - marginright + paddingdoc + (marginright / 5) + 20 + 10,
      "y": paddingdoc + titlespacing + 85
      }) 
    ;

// add svg icon scrolldown

    var iconscroll = instruct.append("g")
    .attr("class","iconscroll");

        d3.xml("img/scrolldown.svg", 
        function(error, documentFragment) {

    if (error) {console.log(error); return;}

    var scrolldown = documentFragment
                .getElementsByTagName("svg")[0];
    //use plain Javascript to extract the node

    iconscroll.node().appendChild(scrolldown);
    //d3's selection.node() returns the DOM node, so we
    //can use plain Javascript to append content

    var scrolldownSVG = iconscroll.select("svg");

    scrolldownSVG
      .attr({
      "width": marginright / 5,
      "x": w - marginright + paddingdoc + 20,
      "y": h - marginbottom - htimeline - paddingdoc - titlespacing + 25
      }) 
    ;

    // instructSVG.transition().duration(1000).delay(1000)
    //       .select("path")
    //       .attr("r", 100);

    });

    icondrag.append("text")
      .text("Scroll down")
      .attr({
        "class": "timeinstructtop",
        "x": w - marginright + paddingdoc + (marginright / 5) + 20 + 10,
        "y": paddingdoc + titlespacing + 120
        }) 
      ;

    icondrag.append("text")
      .text("for the result")
      .attr({
        "class": "timeinstructbottom",
        "x": w - marginright + paddingdoc + (marginright / 5) + 20 + 10,
        "y": paddingdoc + titlespacing + 135
        }) 
    ;

  }