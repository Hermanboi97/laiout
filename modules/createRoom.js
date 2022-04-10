export var windows = [
  //vindu
  {
    x: 19,
    y: 0,
  },
  {
    x: 19,
    y: -1,
  },
  {
    x: 14,
    y: -1,
  },
  {
    x: 14,
    y: 0,
  },
  //vindu
  {
    x: 13,
    y: 0,
  },
  {
    x: 13,
    y: -1,
  },
  {
    x: 8,
    y: -1,
  },
  {
    x: 8,
    y: 0,
  },
  //vindu
  {
    x: 7,
    y: 0,
  },
  {
    x: 7,
    y: -1,
  },
  {
    x: 2,
    y: -1,
  },
  {
    x: 2,
    y: 0,
  },
];

export var doors = [
  {
    x: 0,
    y: 20,
  },
  {
    x: 0.5,
    y: 20,
  },
  {
    x: 0.5,
    y: 10,
  },
  {
    x: 0,
    y: 10,
  },
];

export var outerWall = [
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
export var margin = { top: 20, right: 20, bottom: 30, left: 30 },
  width = 400 - margin.left - margin.right + 10,
  height = 350 - margin.top - margin.bottom;

export var scaleX = d3
  .scaleLinear()
  .domain([
    0,
    d3.max(outerWall, function (d) {
      return d.x;
    }),
  ])
  .range([0, width]);

export var scaleY = d3
  .scaleLinear()
  .domain([
    0,
    d3.max(outerWall, function (d) {
      return d.y;
    }),
  ])
  .range([height, 0]);

var xAxis = d3.axisBottom().scale(scaleX);

var yAxis = d3.axisLeft().scale(scaleY);

// Gets area of room
export var area = d3
  .area()
  .x(function (d) {
    return scaleX(d.x);
  })
  .y0(height)
  .y1(function (d) {
    return scaleY(d.y);
  });

export var svg = d3
  .select("svg#area")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

export function drawRoom(outerWall) {
  svg.selectAll(".grid").remove();
  svg.selectAll(".area").remove();
  svg.select("#room").remove();
  svg.select("#area-clip").remove();
  svg.select("g").remove();

  var wallSVG = svg
    .append("path")
    .datum(outerWall)
    .attr("class", "area")
    .attr("d", area);

  // Floor
  var floor = svg
    .append("path")
    .attr("d", area(outerWall))
    .attr("fill", "rgb(134 239 172)")
    .attr("visibility", "hidden")
    .attr("id", "room");

  svg
    .append("clipPath")
    .attr("id", "area-clip")
    .append("path")
    .attr("d", area(outerWall));

  // Grid
  var grid = svg.append("g").attr("clip-path", "url(#area-clip)");

  var maxWidth = d3.max(outerWall, function (d) {
    return scaleX(d.x);
  });

  var maxHeight = d3.max(outerWall, function (d) {
    return scaleY(d.y);
  });

  grid
    .append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + maxHeight + ")")
    .call(xAxis.tickSize(-maxHeight).tickFormat(""));
  grid
    .append("g")
    .attr("class", "grid")
    .call(yAxis.tickSize(-maxWidth).tickFormat(""));

  // Windows
  var windowSVG = svg
    .append("path")
    .datum(windows)
    .attr("class", "area")
    .attr("d", area);

  // Doors
  var doorsSVG = svg
    .append("path")
    .datum(doors)
    .attr("class", "area")
    .attr("d", area);
}

export function drawPoint(p) {
  svg
    .selectAll(".point")
    .data(p)
    .enter()
    .append("circle")
    .attr("class", "markedPoint")
    .attr("fill", "red")
    .attr("r", 4)
    .attr("transform", "translate(" + p.x + "," + p.y + ")");
}

drawRoom(outerWall);
