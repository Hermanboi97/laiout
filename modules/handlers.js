import { placeAllDesks } from "../laiout.js";
import { height, width } from "./createRoom.js";
import { deskAreaDimensions } from "./desk.js";

var markDeskFront = false,
  showRoomArea = false,
  enumerateCorners = false,
  togglePlacements = false,
  toggleDeskCorners = false;

$(document).ready(function () {
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
});
