import { scaleX, scaleY, svg } from "./createRoom.js";
import {
  chairDimensions,
  deskAreaDimensions,
  tableDimensions,
} from "./desk.js";
import {
  angle,
  distanceBetweenPoints,
  doPolygonsIntersect,
  extendPointPerpendicularly,
  findPointOnLine,
  getEdgesOfRectangle,
  lineRect,
} from "./helperFunctions.js";

var allPlacements = [];

// clearing around furniture, must be greater than 0.
var clearing = 1;

// Gets center coordinates of where furniture can be placed along given wall
export function getPlacementCoordinates(
  outerWall,
  wallStart,
  wallEnd,
  furnitureDimensions,
  clearing,
  allPlacements
) {
  var remainingSpace = distanceBetweenPoints(wallStart, wallEnd);
  var lastRecEnd = wallStart;
  var totalDeskWidth = furnitureDimensions.width + clearing * 1;
  var placements = [];

  var point;
  var offsetPoint;

  function getPlacementCoordinate(
    furnitureWidth,
    furnitureHeight,
    offsetRight
  ) {
    // Set the point to be at the edge of our last placed desk + half width of desk
    point = findPointOnLine(
      lastRecEnd,
      wallEnd,
      furnitureWidth / 2 + offsetRight
    );

    // Find new remaining space
    remainingSpace = distanceBetweenPoints(point, wallEnd);

    console.log(point, wallEnd, Math.round(remainingSpace));

    // Distance to offset our placement point from the wall
    var offsetDistance = furnitureHeight / 2;

    // Offset point from wall with given distance
    offsetPoint = extendPointPerpendicularly(
      wallStart,
      wallEnd,
      point,
      offsetDistance
    );

    // Our new point to place a desk on with correct rotation to face wall
    point = {
      x: offsetPoint.x,
      y: offsetPoint.y,
      r: angle(point.x, point.y, wallEnd.x, wallEnd.y),
    };
  }

  // While there is still place for more desks along wall
  while (remainingSpace >= totalDeskWidth) {
    // do: see if our placement-point is feasible or move 1 px if collision occurs
    // while: collision occurs and there is sufficient with space left along wall to retry placement
    var tries = 0;
    do {
      getPlacementCoordinate(
        totalDeskWidth,
        furnitureDimensions.height + clearing * 2,
        tries
      );

      var rec1 = getEdgesOfRectangle(
        { x: point.x, y: point.y },
        furnitureDimensions.width,
        furnitureDimensions.height,
        point.r
      );

      var collision = false;
      var collidesWithWall = false;

      // Check if furniture collides with the wall
      // http://www.jeffreythompson.org/collision-detection/line-rect.php
      for (let i = 0; i < outerWall.length; i++) {
        var a = outerWall[i];

        a = {
          x: scaleX(a.x),
          y: scaleY(a.y),
        };

        let nextPoint = outerWall[i + 1];

        if (nextPoint === undefined) nextPoint = outerWall[0];

        let b = {
          x: scaleX(nextPoint.x),
          y: scaleY(nextPoint.y),
        };

        if (lineRect(b.x, b.y, a.x, a.y, rec1[0], rec1[1], rec1[2], rec1[3])) {
          collidesWithWall = true;
          break;
        }
      }

      if (collidesWithWall) {
        break;
      }
      // Check if furniture collides with other furniture in the room
      for (let b of allPlacements) {
        var rec2 = getEdgesOfRectangle(
          { x: b.x, y: b.y },
          furnitureDimensions.width,
          furnitureDimensions.height,
          b.r
        );

        if (doPolygonsIntersect(rec1, rec2)) {
          collision = true;
          break;
        }
      }

      tries++;
    } while (collision && remainingSpace >= totalDeskWidth);

    if (!(collision || collidesWithWall)) {
      placements.push(point);
    }
    // Set the new edge of our last placed desk
    lastRecEnd = findPointOnLine(lastRecEnd, wallEnd, totalDeskWidth + tries);

    // Find new remaining space
    remainingSpace = distanceBetweenPoints(lastRecEnd, wallEnd);
  }
  return placements;
}

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
export function findAvailablePlacements(walls) {
  allPlacements = [];

  // Start-point of wall (scaled up)
  var wallStart = { x: scaleX(walls[0].x), y: scaleY(walls[0].y) };

  function getWallPlacements(d) {
    // end-point of current wall (scaled up)
    var wallEnd = {
      x: scaleX(d.x),
      y: scaleY(d.y),
    };

    var placementsAlongWall = [];

    placementsAlongWall = getPlacementCoordinates(
      walls,
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

// Place desks
export function placeAllDesks() {
  allPlacements.forEach((point) => {
    placeDesk(point.x, point.y, point.r);
  });
}
