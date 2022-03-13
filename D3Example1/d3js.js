var width = 300;
var height = 300;

var zoom = 20;
var x = width / zoom;
var y = height / zoom;

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

var grid = d3.range(y).map(function(dy) {
  return d3.range(x).map(function(dx) {
    return {
      x: dx,
      y: dy
    };
  });
});

var g = svg.selectAll("g")
  .data(grid)
  .enter().append("g")
  .selectAll("rect")
  .data(function(d) {
    return d;
  })
  .enter().append("rect")
  .attr("width", zoom)
  .attr("height", zoom)
  .attr("clicked", false)
  .attr('x', function(d) {
    return d.x * zoom;
  })
  .attr('y', function(d) {
    return d.y * zoom;
  })
  .on("click", generate)
  .style("stroke", "#000")
  .style("stroke-width", 1)
  .style("fill", "#fff")

function generate(d) {
  var clicked = d3.select(this).datum();

  d3.selectAll("rect").filter(function(d) {
    return d.x === clicked.x  || d.y === clicked.y
     })
    .transition()
    .style("fill", "#83c5be");
  
  d3.selectAll("rect").filter(function(d) {
    if (d.x != clicked.x && d.y != clicked.y) {
      return d.x || d.y;
    }})
    .transition()
    .style("fill", "#006d77");

  d3.selectAll("rect")
  .style("fill", "#006d77")
  .filter(function(d) {
    var xcheck = d.x + 2 != clicked.x && d.x - 1 != clicked.x && d.x + 1 != clicked.x && d.x - 2 != clicked.x;
    if (d.x % 3 == 0 && xcheck) {
        return d.x || d.y && d.x == 0 || d.y == 0;
    }})
    .transition()
    .style("fill", "#83c5be");
    
  /*d3.selectAll("rect").filter(function(d) {
    var ycheck = d.y + 1 != clicked.y && d.y - 1 != clicked.y && d.y - 2 != clicked.y && d.y + 2 != clicked.y;
    if (d.y % 3 == 0 && ycheck) {
        return d.x || d.y; 
    }})
        .transition()
        .style("fill", "#fff");*/
}
