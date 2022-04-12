import {
  drawRoom,
  margin,
  outerWall as outerwallOriginal,
  scaleX,
  scaleY,
  svg,
} from "./modules/createRoom.js";
import {
  findAvailablePlacements,
  placeAllDesks,
} from "./modules/placeFurniture.js";

export class FurnitureDimensions {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
}

var outerWall = [...outerwallOriginal];

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

  //placeDesk(position.x, position.y, position.rotation);

  // https://bl.ocks.org/RiseupDev/b07f7ccc1c499efc24e9
  // http://jsfiddle.net/rs7u0qhx/2/

  //placeAllDesks();
});
