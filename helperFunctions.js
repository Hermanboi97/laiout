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
  if (rotation > 0) {
    rotation = 360 + rotation;
  }
  var topRight = {
    x: center.x + (width / 2) * Cos(rotation) - (height / 2) * Sin(rotation),
    y: center.y + (width / 2) * Sin(rotation) + (height / 2) * Cos(rotation),
  };

  var topLeft = {
    x: center.x - (width / 2) * Cos(rotation) - (height / 2) * Sin(rotation),
    y: center.y - (width / 2) * Sin(rotation) + (height / 2) * Cos(rotation),
  };

  var bottomLeft = {
    x: center.x - (width / 2) * Cos(rotation) + (height / 2) * Sin(rotation),
    y: center.y - (width / 2) * Sin(rotation) - (height / 2) * Cos(rotation),
  };

  var bottomRight = {
    x: center.x + (width / 2) * Cos(rotation) + (height / 2) * Sin(rotation),
    y: center.y + (width / 2) * Sin(rotation) - (height / 2) * Cos(rotation),
  };

  return [topRight, topLeft, bottomLeft, bottomRight];
}

function Cos(angle) {
  return Math.cos(angle);
}

function Sin(angle) {
  return Math.sin(angle);
}
