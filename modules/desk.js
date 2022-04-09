import { FurnitureDimensions } from "../laiout.js";

// Dimensions of desk
export const deskAreaDimensions = new FurnitureDimensions(70, 70);
export const tableDimensions = new FurnitureDimensions(
  deskAreaDimensions.width,
  deskAreaDimensions.height / 2
);
export const chairDimensions = new FurnitureDimensions(25, 25);
