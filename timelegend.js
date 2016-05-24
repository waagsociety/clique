var timeLegend = function(dataset) { // legend

  var legendRectSize = 15;
  var legendSpacing = 5;

  var legendtitle = d3.select("svg")
    .append("text")
    .text("Sectors")
    .attr({
      "class": "legendtitle",
      "x": paddingdoc,
      "y": paddingdoc + margintop + 6
    })
  ;

  var legendexplain = d3.select("svg")
    .append("text")
    .text("Click to show/hide")
    .attr({
      "class": "legendexplain",
      "x": paddingdoc,
      "y": paddingdoc * 2 + margintop
    })
  ;

  var legend = d3.select("svg")
    .append("g")
    .selectAll("g")
    .data(colorScale.domain())
    .enter()
    .append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) {
        var height = legendRectSize;
        var x = paddingdoc;
        var y = (paddingdoc * 2.5) + i * (height + legendSpacing) + margintop;
        return "translate(" + x + "," + y + ")";
      })
    .on("mouseover", function(d){
      d3.select(this)
      .each(function(){
        this.style.opacity = 0.6;
      });
    })
    .on("mouseout", function(d){
      var active = this.active ? true : false;
      var opacityItem = active ? 0.3 : 1;
      d3.select(this)
      .each(function(){
        this.style.opacity = opacityItem;
      });
    })
    .on("click", function(d) {
      var active = this.active ? true : false;
      var opacityDots = active ? 1 : 0;
      var opacityItem = active ? 1 : 0.3;
      var visibility = active ? "visible" : "hidden";
      this.active = !active;
      d3.selectAll('.dot-' + d.replace(/\W/gi, '-').toLowerCase())
      .each(function() {
        this.style.opacity = opacityDots;
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
      

      d3.select(this)
      .each(function(){
        this.style.opacity = opacityItem;
      });
    })
    ;
    
  legend.append("rect")
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .style("fill", colorScale)
    .style("stroke", colorScale)
    ;

  legend.append("text")
    .attr("x", legendRectSize + legendSpacing)
    .attr("y", legendRectSize - legendSpacing + 2)
    .text(function(d) {
      var onlyThisType = dataset.filter(function(data) {return data.sector === d && data.typeis != "Political Party"});
      return d + " (" + onlyThisType.length + ")"; 
    })
    ;
} // end timeLegend