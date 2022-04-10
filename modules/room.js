// http://jsfiddle.net/wyp1qn2k/2/

// global vars
var mainBlue = "#5478F0";
var dragging = false,
  drawing = false,
  startPoint;

var height = 360,
  width = 300;

var svg = d3
  .select("body")
  .append("svg")
  .attr("height", 1000)
  .attr("width", 1000);

var g;

var points = [
  {
    x: 0,
    y: 0,
  },
  {
    x: 22,
    y: 0,
  },

  {
    x: 22,
    y: 45,
  },
  {
    x: 10,
    y: 45,
  },
  {
    x: 10,
    y: 33,
  },
  {
    x: 8,
    y: 33,
  },
  {
    x: 8,
    y: 40,
  },
  {
    x: 0,
    y: 40,
  },
];

// Scaling
var scaleX = d3
  .scaleLinear()
  .domain([
    0,
    d3.max(points, function (d) {
      return d.x;
    }),
  ])
  .range([0, width]);

var scaleY = d3
  .scaleLinear()
  .domain([
    0,
    d3.max(points, function (d) {
      return d.y;
    }),
  ])
  .range([0, height]);

// Scale points
function scalePoints(points) {
  return points.map((p) => ({
    x: scaleX(p.x),
    y: scaleY(p.y),
  }));
}

points = scalePoints(points);

var maxWidth = d3.max(points, function (d) {
  return d.x;
});

var maxHeight = d3.max(points, function (d) {
  return d.y;
});

var xAxis = d3.axisBottom().scale(scaleX);

var yAxis = d3.axisLeft().scale(scaleY);

// grid: https://bl.ocks.org/cagrimmett/07f8c8daea00946b9e704e3efcbd5739#grid.js
function gridData() {
  var data = new Array();
  var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
  var ypos = 1;
  var width = 50;
  var height = 50;
  var click = 0;

  // iterate for rows
  for (var row = 0; row < 30; row++) {
    data.push(new Array());

    // iterate for cells/columns inside rows
    for (var column = 0; column < 30; column++) {
      data[row].push({
        x: xpos,
        y: ypos,
        width: width,
        height: height,
        click: click,
      });
      // increment the x position. I.e. move it over by 50 (width variable)
      xpos += width;
    }
    // reset the x position after a row is complete
    xpos = 1;
    // increment the y position for the next row. Move it down 50 (height variable)
    ypos += height;
  }
  return data;
}

var gridData = gridData();

// get area of polygon
var area = d3
  .area()
  .x(function (d) {
    return d.x;
  })
  .y0(height)
  .y1(function (d) {
    return d.y;
  });

// behaviors
var dragger = d3
  .drag()
  .on("drag", handleDrag)
  .on("end", function (d) {
    dragging = false;
  });

var areaClip = svg
  .append("clipPath")
  .attr("id", "area-clip")
  .append("path")
  .attr("d", area(points));

// Grid: https://bl.ocks.org/cagrimmett/07f8c8daea00946b9e704e3efcbd5739#grid.js
var grid = svg
  .append("g")
  .attr("clip-path", "url(#area-clip)")
  .attr("id", "grid");

var row = grid
  .selectAll(".row")
  .data(gridData)
  .enter()
  .append("g")
  .attr("class", "row")
  .attr("clip-path", "url(#area-clip)");

var column = row
  .selectAll(".square")
  .data(function (d) {
    return d;
  })
  .enter()
  .append("rect")
  .attr("class", "square")
  .attr("x", function (d) {
    return d.x;
  })
  .attr("y", function (d) {
    return d.y;
  })
  .attr("width", function (d) {
    return d.width;
  })
  .attr("height", function (d) {
    return d.height;
  })
  .style("fill", "#fff")
  .style("stroke", "#c6c6c6")
  .attr("stroke-width", 0.5)
  .attr("clip-path", "url(#area-clip)");

// the polygon "point" attr takes x and y in as an array
function formatPoints(points) {
  return points.map((p) => [p.x, p.y]);
}

// Draws polygon and circles on edges
function drawPolygon() {
  var g = svg.append("g");
  g.append("polygon")
    .attr("points", formatPoints(points))
    .style("fill", "transparent")
    .attr("stroke", "#000")
    .attr("stroke-width", 3);

  var circle = g
    .selectAll("circles")
    .data(points)
    .enter()
    .append("circle")
    .attr("cx", (p) => p.x)
    .attr("cy", (p) => p.y)
    .attr("r", 5)
    .attr("fill", mainBlue)
    .attr("is-handle", "true")
    .attr("cursor", "move")
    .call(dragger);

  points.splice(0);
  drawing = false;
}

function handleDrag() {
  dragging = true;

  var dragCircle = d3.select(this),
    newPoints = [],
    circle;
  var poly = d3.select(this.parentNode).select("polygon");
  var circles = d3.select(this.parentNode).selectAll("circle");

  // Set current corners position to the mouse position
  dragCircle.attr("cx", event.x).attr("cy", event.y);

  // Update polygon with the current values of the corners
  circles.each(function () {
    circle = d3.select(this);
    newPoints.push({
      x: circle.attr("cx"),
      y: circle.attr("cy"),
    });
  });
  poly.attr("points", formatPoints(newPoints));
  areaClip.attr("d", area(newPoints));
}

drawPolygon();
