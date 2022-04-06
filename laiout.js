import {
  drawRoom,
  height,
  margin,
  outerWall as outerwallOriginal,
  svg,
  width,
  x,
  y,
} from "./createRoom.js";
import {
  chairDimensions,
  deskAreaDimensions,
  tableDimensions,
} from "./desk.js";
import {
  distToSegment,
  doPolygonsIntersect,
  getEdgesOfRectangle,
  lineRect,
} from "./helperFunctions.js";

export class FurnitureDimensions {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
}

var outerWall = [...outerwallOriginal];

var deskPlacements = [];

// clearing around furniture, must be greater than 0.
var clearing = 1;

var markDeskFront = false,
  showRoomArea = false,
  enumerateCorners = false,
  togglePlacements = false,
  toggleDeskCorners = false;

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

function findAvailablePlacements(array) {
  deskPlacements = [];
  var lastPoint = { x: x(outerWall[0].x), y: y(outerWall[0].y) };

  function fillArrayWithPlacements(d) {
    // current x and y
    var xPos = x(d.x);
    var yPos = y(d.y);

    // a and b for pythagoras
    var a = xPos - lastPoint.x;
    var b = yPos - lastPoint.y;

    // helper var to console.log
    var currentFormatted = { x: xPos, y: yPos };

    // Distance using pythagoras
    var distance = Math.sqrt(a * a + b * b);

    // How many furnitures fits along wall
    var availablePlacements = Math.floor(
      distance / (deskAreaDimensions.width + clearing * 2)
    );
    var availablePlacementsArray = [];

    // Formula for point between two points x distance from point 1:
    // https://math.stackexchange.com/a/2045181
    var p1 = {
      x: lastPoint.x + (deskAreaDimensions.width / distance) * a,
      y: lastPoint.y + (deskAreaDimensions.width / distance) * b,
    };

    function getPlacementCoordinates() {
      for (var i = 0; i <= availablePlacements - 1; i++) {
        var p2 = {
          x:
            lastPoint.x +
            (((deskAreaDimensions.width + clearing * 2) * i +
              deskAreaDimensions.width / 2) /
              distance) *
              a,
          y:
            lastPoint.y +
            (((deskAreaDimensions.width + clearing * 2) * i +
              deskAreaDimensions.width / 2) /
              distance) *
              b,
        };

        // Calculate rotation needed for desk front to stand parallel to wall
        function angle(cx, cy, ex, ey) {
          var dy = ey - cy;
          var dx = ex - cx;
          var theta = Math.atan2(dy, dx); // range (-PI, PI]
          theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
          //if (theta < 0) theta = 360 + theta; // range [0, 360)
          return theta;
        }

        // Find the point perpundicular to the wall laying a given length from the wall
        // https://stackoverflow.com/a/47042912/6817961
        var L = Math.sqrt(a * a + b * b);
        var U = { x: -b / L, y: a / L };
        var newX = p2.x - U.x * (deskAreaDimensions.height / 2 + clearing);
        var newY = p2.y - U.y * (deskAreaDimensions.height / 2 + clearing);

        p2 = {
          x: newX,
          y: newY,
          r: angle(p2.x, p2.y, xPos, yPos),
        };

        availablePlacementsArray.push(p2);
      }
    }

    getPlacementCoordinates();

    /*     console.log(
      outerWall.indexOf(d) +
        " Last: " +
        JSON.stringify(lastPoint) +
        ", Curr: " +
        JSON.stringify(currentFormatted) +
        ", Dist: " +
        distance +
        " Placements: " +
        availablePlacements
    );
    console.log(availablePlacementsArray); */

    deskPlacements.push(...availablePlacementsArray);
    lastPoint = { x: xPos, y: yPos };
  }

  array.forEach(function (d) {
    fillArrayWithPlacements(d);
  });

  lastPoint = {
    x: x(array[array.length - 1].x),
    y: y(array[array.length - 1].y),
  };
  fillArrayWithPlacements(array[0]);
}

function placeAllDesks() {
  //console.log(deskPlacements);

  var placedDesks = [];

  deskPlacements.forEach((d) => {
    var xPos = d.x;
    var yPos = d.y;

    var rec1 = getEdgesOfRectangle(
      { x: xPos, y: yPos },
      deskAreaDimensions.width,
      deskAreaDimensions.height,
      d.r
    );

    var collision = false;

    if (deskPlacements.indexOf(d) > 0) {
      for (let b of placedDesks) {
        var rec2 = getEdgesOfRectangle(
          { x: b.x, y: b.y },
          deskAreaDimensions.width - 1,
          deskAreaDimensions.height - 1,
          b.r
        );

        if (doPolygonsIntersect(rec1, rec2)) {
          collision = true;
          break;
        }
      }

      var collidesWithWall = false;

      // Only works for circles, use instead: http://www.jeffreythompson.org/collision-detection/line-rect.php
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

        var tooCloseToWall =
          distToSegment(xPos, yPos, a.x, a.y, b.x, b.y) <
          deskAreaDimensions.width / 2;

        if (lineRect(b.x, b.y, a.x, a.y, rec1[0], rec1[1], rec1[2], rec1[3])) {
          console.log(
            deskPlacements.indexOf(d),
            i,
            a.x,
            a.y,
            b.x,
            b.y,
            lineRect(b.x, b.y, a.x, a.y, rec1[0], rec1[1], rec1[2], rec1[3])
          );
          collidesWithWall = true;
          break;
        }
      }

      if (!(collision || collidesWithWall)) {
        placeDesk(xPos, yPos, d.r);
        placedDesks.push(d);
        svg
          .selectAll(".point")
          .data(rec1)
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
    } else {
      placeDesk(xPos, yPos, d.r);
      placedDesks.push(d);
    }
  });
}

$(document).ready(function () {
  $(".desk").click(() => {
    console.log("click");
  });

  $(".desk")
    .on("mousedown", function () {
      $().mousemove(function (e) {
        window.mouseXPos = e.pageX;
        window.mouseYPos = e.pageY;
      });
    })
    .on("mouseup mouseleave", function () {
      console.log("dropped");
    });

  var position = {
    x: deskAreaDimensions.width / 2,
    y: deskAreaDimensions.height / 2,
    rotation: 0,
  };

  $("#placeAllDesks").click(() => {
    placeAllDesks();
  });

  $("#markFront").click(() => {
    markDeskFront = !markDeskFront;
    $(".deskFrontLine").css("visibility", markDeskFront ? "visible" : "hidden");
  });

  $("#toggleArea").click(() => {
    showRoomArea = !showRoomArea;
    $("#room").css("visibility", showRoomArea ? "visible" : "hidden");
  });

  $("#enumerateCorners").click(() => {
    enumerateCorners = !enumerateCorners;
    $(".cornerText").css("visibility", enumerateCorners ? "visible" : "hidden");
  });

  $("#togglePlacements").click(() => {
    togglePlacements = !togglePlacements;
    $(".deskPlacements").css(
      "visibility",
      togglePlacements ? "visible" : "hidden"
    );
  });

  $("#toggleDeskCorners").click(() => {
    toggleDeskCorners = !toggleDeskCorners;
    $(".deskCorner").css(
      "visibility",
      toggleDeskCorners ? "visible" : "hidden"
    );
  });

  // Setting boundary for postion sliders

  $("#x").attr({
    max: width - deskAreaDimensions.width / 2,
    min: deskAreaDimensions.width / 2,
  });
  $("#y").attr({
    max: height - deskAreaDimensions.height / 2,
    min: deskAreaDimensions.height / 2,
  });

  function updateDesk() {
    svg.selectAll(".desk").remove();
    placeDesk(position.x, position.y, position.rotation);
  }

  $("#rotation").on("input change", (e) => {
    position.rotation = e.target.value;
    updateDesk();
  });

  $("#x").on("input change", (e) => {
    position.x = e.target.value;
    updateDesk();
  });

  $("#y").on("input change", (e) => {
    position.y = e.target.value;
    updateDesk();
  });

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
      return "translate(" + x(d.x) + "," + y(d.y) + ")";
    })
    .call(
      d3
        .drag()
        .on("start", () => {})
        .on("drag", dragCorner)
        .on("end", () => {})
    );

  // Does not work fully
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
        x: Math.round(x.invert(newPosition.x)),
        y: Math.round(y.invert(newPosition.y)),
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

  // Mark desk placements along wall
  findAvailablePlacements(outerWall);

  svg
    .selectAll(".point")
    .data(deskPlacements)
    .enter()
    .append("circle")
    .attr("fill", "blue")
    .attr("class", "deskPlacements")
    .attr("visibility", "hidden")
    .attr("r", 4)
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  //placeDesk(position.x, position.y, position.rotation);

  placeAllDesks();
});
