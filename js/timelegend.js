var timeLegend = function(dataset,svg) { // legend

  const legendRectSize = 15;
  const legendSpacing = 5;

  var legendSelector = svg.append("g");

  var titlegraph = legendSelector
    .append("text")
    ;

  titlegraph.append("tspan")
    .text(name + " / timeline") // function name!
    .attr({
      "class": "titlename",
      "x": paddingdoc,
      "y": paddingdoc + margintop
    })
    ;

  var legendtitle = legendSelector
    .append("text")
    .text("Sectors")
    .attr({
      "class": "legendtitle",
      "x": paddingdoc,
      "y": paddingdoc + margintop + 30
    })
  ;

  var legendexplain = legendSelector
    .append("text")
    .text("Click to show/hide")
    .attr({
      "class": "legendexplain",
      "x": paddingdoc,
      "y": paddingdoc + margintop + 43
    })
  ;

  var legend = legendSelector
    .selectAll("g.legenditem")
    .data(types)
    .enter()
    .append("g")
    .attr("class","legenditem")
    .attr("transform", function(d, i) {
      this.active = true;
      var height = legendRectSize;
      var x = paddingdoc;
      var y = paddingdoc + i * (height + legendSpacing) + margintop + 60;
      return "translate(" + x + "," + y + ")";
    })
    .on("mouseover", function(d){
      d3.select(this)
      .each(function(){
        this.style.opacity = 0.6;
      });
    })
    .on("mouseout", function(d){
      var opacityItem = this.active ? 1 : 0.3;
      this.style.opacity = opacityItem;
    })
    .on("click", function(d) {
      this.active = !this.active;
      var opacityItem = this.active ? 1 : 0.3;
      var visibility = this.active ? "visible" : "hidden";

      this.style.opacity = opacityItem;

      d3.selectAll('.dot-' + d.replace(/\W/gi, '-').toLowerCase())
      .each(function() {
        this.setAttribute("visibility", visibility);
      });

      //recalculate dottxt

      d3.selectAll('.dottxt-' + d.replace(/\W/gi, '-').toLowerCase())
      .each(function(){
        this.setAttribute("visibility", visibility);
      });

      xy = {}; // save datapoints
      d3.selectAll('*[class^="dottxt"]')
      .text(dottxtfunc);
    })
    ;

  legend.append("rect")
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .style("fill", function(d){return sectorToNameAndColor(d).color;})
    .style("stroke", function(d){return sectorToNameAndColor(d).color;})
    ;

  legend.append("text")
    .attr("x", legendRectSize + legendSpacing)
    .attr("y", legendRectSize - legendSpacing + 2)
    .text(function(d) {
      var onlyThisType = dataset.filter(function(data) {return data.sector === d && data.typeis != "Political Party"});
      return sectorToNameAndColor(d).name + " (" + onlyThisType.length + ")";
    })
    ;
} // end timeLegend
