import { x, y } from "./createRoom.js";
import {
  angle,
  distanceBetweenPoints,
  doPolygonsIntersect,
  extendPointPerpendicularly,
  findPointOnLine,
  getEdgesOfRectangle,
  lineRect,
} from "./helperFunctions.js";

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
          x: x(a.x),
          y: y(a.y),
        };

        let nextPoint = outerWall[i + 1];

        if (nextPoint === undefined) nextPoint = outerWall[0];

        let b = {
          x: x(nextPoint.x),
          y: y(nextPoint.y),
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
