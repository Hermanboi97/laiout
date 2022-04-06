/**
 * https://stackoverflow.com/a/12414951
 *
 * Helper function to determine whether there is an intersection between the two polygons described
 * by the lists of vertices. Uses the Separating Axis Theorem
 *
 * @param a an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @param b an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @return true if there is any intersection between the 2 polygons, false otherwise
 */
export function doPolygonsIntersect(a, b) {
  var polygons = [a, b];
  var minA, maxA, projected, i, i1, j, minB, maxB;

  for (i = 0; i < polygons.length; i++) {
    // for each polygon, look at each edge of the polygon, and determine if it separates
    // the two shapes
    var polygon = polygons[i];
    for (i1 = 0; i1 < polygon.length; i1++) {
      // grab 2 vertices to create an edge
      var i2 = (i1 + 1) % polygon.length;
      var p1 = polygon[i1];
      var p2 = polygon[i2];

      // find the line perpendicular to this edge
      var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

      minA = maxA = undefined;
      // for each vertex in the first shape, project it onto the line perpendicular to the edge
      // and keep track of the min and max of these values
      for (j = 0; j < a.length; j++) {
        projected = normal.x * a[j].x + normal.y * a[j].y;
        if (minA === undefined || projected < minA) {
          minA = projected;
        }
        if (maxA === undefined || projected > maxA) {
          maxA = projected;
        }
      }

      // for each vertex in the second shape, project it onto the line perpendicular to the edge
      // and keep track of the min and max of these values
      minB = maxB = undefined;
      for (j = 0; j < b.length; j++) {
        projected = normal.x * b[j].x + normal.y * b[j].y;
        if (minB === undefined || projected < minB) {
          minB = projected;
        }
        if (maxB === undefined || projected > maxB) {
          maxB = projected;
        }
      }

      // if there is no overlap between the projects, the edge we are looking at separates the two
      // polygons, and we know there is no overlap
      if (maxA < minB || maxB < minA) {
        return false;
      }
    }
  }
  console.log("Polygons do intersect!");
  return true;
}

/**
 * https://stackoverflow.com/a/41899250
 */

export function getEdgesOfRectangle(center, width, height, rotation) {
  // Convert to radians
  rotation = rotation * (Math.PI / 180);
  var topRight = {
    x:
      center.x +
      (width / 2) * Math.cos(rotation) -
      (height / 2) * Math.sin(rotation),
    y:
      center.y +
      (width / 2) * Math.sin(rotation) +
      (height / 2) * Math.cos(rotation),
  };

  var topLeft = {
    x:
      center.x -
      (width / 2) * Math.cos(rotation) -
      (height / 2) * Math.sin(rotation),
    y:
      center.y -
      (width / 2) * Math.sin(rotation) +
      (height / 2) * Math.cos(rotation),
  };

  var bottomLeft = {
    x:
      center.x -
      (width / 2) * Math.cos(rotation) +
      (height / 2) * Math.sin(rotation),
    y:
      center.y -
      (width / 2) * Math.sin(rotation) -
      (height / 2) * Math.cos(rotation),
  };

  var bottomRight = {
    x:
      center.x +
      (width / 2) * Math.cos(rotation) +
      (height / 2) * Math.sin(rotation),
    y:
      center.y +
      (width / 2) * Math.sin(rotation) -
      (height / 2) * Math.cos(rotation),
  };

  return [topRight, topLeft, bottomLeft, bottomRight];
}

export function distToSegment(x, y, x1, y1, x2, y2) {
  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0)
    //in case of 0 length line
    param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}

// 1 end of line, 2 start of line, s square position, sw width, sh height
export function lineRect(
  x1,
  y1,
  x2,
  y2,
  topRight,
  topLeft,
  bottomLeft,
  bottomRight
) {
  // check if the line has hit any of the rectangle's sides
  // uses the Line/Line function below
  var left = lineLine(
    x1,
    y1,
    x2,
    y2,
    topLeft.x,
    topLeft.y,
    bottomLeft.x,
    bottomLeft.y
  );
  var right = lineLine(
    x1,
    y1,
    x2,
    y2,
    topRight.x,
    topRight.y,
    bottomRight.x,
    bottomRight.y
  );
  var top = lineLine(
    x1,
    y1,
    x2,
    y2,
    topLeft.x,
    topLeft.y,
    topRight.x,
    topRight.y
  );
  var bottom = lineLine(
    x1,
    y1,
    x2,
    y2,
    bottomLeft.x,
    bottomLeft.y,
    bottomRight.x,
    bottomRight.y
  );

  // if ANY of the above are true, the line
  // has hit the rectangle
  if (left || right || top || bottom) {
    return true;
  }
  return false;
}

function lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {
  // calculate the direction of the lines
  var uA =
    ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  var uB =
    ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

  // if uA and uB are between 0-1, lines are colliding
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    return true;
  }
  return false;
}
