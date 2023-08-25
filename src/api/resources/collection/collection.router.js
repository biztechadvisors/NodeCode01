const express = require("express");
const collectionController = require("./collection.controller");
const { jwtStrategy } = require("../../../middleware/strategy");
const upload = require("../../../awsbucket");

const collectionRouter = express.Router();

collectionRouter.route("/create").post(jwtStrategy, collectionController.create);
collectionRouter.route("/list").get(jwtStrategy, collectionController.getList);
collectionRouter.route("/update").put(jwtStrategy, collectionController.update);

collectionRouter.route("/item").post(jwtStrategy, upload.single("thumbnail"), collectionController.itemCreate);
collectionRouter.route("/item/list").get(collectionController.getItem);
collectionRouter.route("/item/delete").post(jwtStrategy, collectionController.deleteItem);

collectionRouter.route("/flash-sale").post(jwtStrategy, upload.single("thumbnail"), collectionController.flashSaleCreate);
collectionRouter.route("/flash-sale-list").get(jwtStrategy, collectionController.getFlashSaleList);
collectionRouter.route("/flash-sale-delete").delete(jwtStrategy, collectionController.deleteProductFromFlash);
collectionRouter.route("/flash-sale-update").put(jwtStrategy, upload.single("thumbnail"), collectionController.flashSaleUpdate);
collectionRouter.route("/flash-sale-status-update").put(jwtStrategy, collectionController.flashSaleStatusUpdate);

module.exports = collectionRouter;
