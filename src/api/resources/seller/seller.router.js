const express = require("express");
const sellerController = require("./seller.controller");
const { jwtStrategy } = require("../../../middleware/strategy");
const upload = require("../../../awsbucket");

const sellerRouter = express.Router();

sellerRouter.route("/product/create").post(
  jwtStrategy,
  sellerController.createProduct
);

sellerRouter.route("/product/update").put(
  jwtStrategy,
  sellerController.updateProduct
);

sellerRouter.route("/product/list").post(
  jwtStrategy,
  sellerController.getAllProduct
);

sellerRouter.route("/product/list-by-id").post(
  jwtStrategy,
  sellerController.getPrductById
);

sellerRouter.route("/admin/product/search").get(
  sellerController.sellerImageDetailByid
);

sellerRouter.route("/image/single-upload").put(
  jwtStrategy,
  upload.single("thumbnail"),
  sellerController.uploadSingleImage
);

sellerRouter.route("/image/main-upload").put(
  upload.single("thumbnail"),
  sellerController.uploadMainProdImage
);

sellerRouter.route("/image/delete").put(
  jwtStrategy,
  sellerController.deleteThumbnail
);

sellerRouter.route("/image/main-delete").put(
  jwtStrategy,
  sellerController.deleteMainProdImage
);

sellerRouter.route("/product/getAllList").get(
  jwtStrategy,
  sellerController.getAllList
);

sellerRouter.route("/coupon/create").post(
  jwtStrategy,
  sellerController.couponCreate
);

sellerRouter.route("/coupon/list").get(
  jwtStrategy,
  sellerController.couponList
);

sellerRouter.route("/coupon").delete(
  jwtStrategy,
  sellerController.couponDelete
);

sellerRouter.route("/brand/list").get(
  jwtStrategy,
  sellerController.getAllBrandList
);

sellerRouter.route("/all-product-list").get(
  sellerController.getAllProductList
);

sellerRouter.route("/history-product").get(
  sellerController.historyProduct
);

sellerRouter.route("/common-name").put(
  jwtStrategy,
  sellerController.CommonName
);

module.exports = sellerRouter;
