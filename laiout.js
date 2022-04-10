import {
  drawRoom,
  margin,
  outerWall as outerwallOriginal,
  scaleX,
  scaleY,
  svg,
} from "./modules/createRoom.js";
import {
  chairDimensions,
  deskAreaDimensions,
  tableDimensions,
} from "./modules/desk.js";
import { getPlacementCoordinates } from "./modules/placeFurniture.js";

export class FurnitureDimensions {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
}

var outerWall = [...outerwallOriginal];

var allPlacements = [];
var test = [];

// clearing around furniture, must be greater than 0.
var clearing = 1;

// Desk
function placeDesk(xPos = 0, yPos = 95, rotation = 0) {
  var desk = svg.append("g");

  // Desk area
  var deskArea = desk
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", deskAreaDimensions.width)
    .attr("height", deskAreaDimensions.height)
    .attr("class", "desk-area");

  // Chair
  var chair = desk
    .append("rect")
    .attr("x", 20)
    .attr("y", 15)
    .attr("width", chairDimensions.width)
    .attr("height", chairDimensions.height)
    .attr("class", "desk");

  // Table
  var table = desk
    .append("rect")
    .attr("x", 0)
    .attr("y", deskAreaDimensions.height - tableDimensions.height)
    .attr("width", tableDimensions.width)
    .attr("height", tableDimensions.height)
    .attr("class", "desk");

  // Front
  var front = desk
    .append("line")
    .attr("x1", 0)
    .attr("y1", deskAreaDimensions.height)
    .attr("x2", deskAreaDimensions.width)
    .attr("y2", deskAreaDimensions.height)
    .attr("stroke", "rgb(14 165 233)")
    .attr("stroke-width", 4)
    .attr("visibility", "hidden")
    .attr("class", "deskFrontLine");

  // Group attributes
  desk
    .attr(
      "transform-origin",
      deskAreaDimensions.width / 2 + " " + deskAreaDimensions.height / 2
    )
    .attr(
      "transform",
      "translate(" +
        xPos +
        "," +
        yPos +
        ") translate(" +
        -(deskAreaDimensions.width / 2) +
        "," +
        -(deskAreaDimensions.width / 2) +
        ") rotate(" +
        rotation +
        ")"
    )
    .attr("class", "desk");
}

// Find desk placements
function findAvailablePlacements(walls) {
  allPlacements = [];

  // Start-point of wall (scaled up)
  var wallStart = { x: scaleX(outerWall[0].x), y: scaleY(outerWall[0].y) };

  function getWallPlacements(d) {
    // end-point of current wall (scaled up)
    var wallEnd = {
      x: scaleX(d.x),
      y: scaleY(d.y),
    };

    var placementsAlongWall = [];

    placementsAlongWall = getPlacementCoordinates(
      outerWall,
      wallStart,
      wallEnd,
      deskAreaDimensions,
      clearing,
      allPlacements
    );

    wallStart = { x: wallEnd.x, y: wallEnd.y }; // Move walls startpoint along
    return placementsAlongWall;
  }

  // Find placement coordinates for all walls
  walls.forEach(function (wall, index) {
    allPlacements.push(...getWallPlacements(wall));

    // Find placements along the last wall created by the last and the first point in wall array
    if (index == walls.length - 1) {
      allPlacements.push(...getWallPlacements(walls[0]));
    }
  });
}

function drawRectangleCorners(rec) {
  svg
    .selectAll(".point")
    .data(rec)
    .enter()
    .append("circle")
    .attr("class", "deskCorner")
    .attr("visibility", "hidden")
    .attr("fill", "blue")
    .attr("r", 4)
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
}

// Place desks
export function placeAllDesks() {
  allPlacements.forEach((point) => {
    placeDesk(point.x, point.y, point.r);
  });
}

// Drag room corners
function dragCorner(d, index) {
  var newPosition = {
    x: d3.event.sourceEvent.clientX - margin.left - 10,
    y: d3.event.sourceEvent.clientY - margin.top,
  };

  d3.select(this).attr(
    "transform",
    "translate(" + newPosition.x + "," + newPosition.y + ")"
  );

  if (index)
    outerWall[index] = {
      x: Math.round(scaleX.invert(newPosition.x)),
      y: Math.round(scaleY.invert(newPosition.y)),
    };

  // update room
  svg.selectAll(".area").remove();
  svg.selectAll(".desk").remove();
  svg.selectAll(".desk-area").remove();
  svg.selectAll(".deskCorner").remove();
  drawRoom(outerWall);
  findAvailablePlacements(outerWall);
  placeAllDesks();
}

$(document).ready(function () {
  svg
    .selectAll(".point")
    .data(outerWall)
    .enter()
    .append("text")
    .attr("d", (d, i) => {
      return { d: d, i: i };
    })
    .attr("class", "cornerText")
    .text((t) => outerWall.indexOf(t))
    .attr("visibility", "hidden")
    .attr("transform", function (d) {
      return "translate(" + scaleX(d.x) + "," + scaleY(d.y) + ")";
    })
    .call(
      d3
        .drag()
        .on("start", () => {})
        .on("drag", dragCorner)
        .on("end", () => {})
    );

  // Mark desk placements along wall
  findAvailablePlacements(outerWall);

  svg
    .selectAll(".point")
    .data(allPlacements)
    .enter()
    .append("circle")
    .attr("fill", "blue")
    .attr("class", "deskPlacements")
    .attr("visibility", "hidden")
    .attr("r", 4)
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  svg
    .selectAll(".point")
    .data(test)
    .enter()
    .append("circle")
    .attr("class", "vrwe")
    .attr("fill", "red")
    .attr("r", 4)
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  //placeDesk(position.x, position.y, position.rotation);

  // https://bl.ocks.org/RiseupDev/b07f7ccc1c499efc24e9
  // http://jsfiddle.net/rs7u0qhx/2/

  //placeAllDesks();
});
