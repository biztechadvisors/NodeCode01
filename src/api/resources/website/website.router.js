const express = require("express");
const websiteController = require("./website.controller");
const { jwtCustomerStrategy } = require("../../../middleware/strategy");

const websiteRouter = express.Router();

// check
websiteRouter.route("/category/list").get(websiteController.getCategoryList);

// collection list
websiteRouter.route("/collection/list").post(websiteController.collectionList);

// check
websiteRouter.route("/search/searchProducts").get(websiteController.searchProducts);

// check
websiteRouter.route("/catalog/product/search").get(websiteController.getFilterAllProduct);

// check
websiteRouter.route("/product/collection-Product").get(websiteController.getCollectionProducts);

// check
websiteRouter.route("/getAllProductLists").get(websiteController.getAllProductList);

// check
websiteRouter.route("/product/detail").get(websiteController.getProductDetail);

// check
websiteRouter.route("/relatedProduct").get(websiteController.relatedProduct);

// check
websiteRouter.route("/reveiw-list").post(websiteController.getReviewList);

// check
websiteRouter.route("/image/banner").get(websiteController.getBannerList);

websiteRouter.route("/popular/category-list").get(websiteController.getPopularCategory);

websiteRouter.route("/category/getAllProduct").post(websiteController.getCategoryByProduct);

websiteRouter.route("/catalog/category/search").get(websiteController.getFilterAllCategoryBrand);

websiteRouter.route("/autosuggest/search").get(websiteController.getAutoSuggestList);

websiteRouter.route("/address/create").post(websiteController.createAddress);

// check
websiteRouter.route("/customization").post(websiteController.customizationPage);

websiteRouter.route("/customization-List").get(websiteController.customizationList);

// Order
websiteRouter.route("/order/product_list").post(websiteController.orderProductList);

websiteRouter.route("/order/history").get(websiteController.orderHistory);

websiteRouter.route("/order/product_detail").post(websiteController.orderProductDetail);

websiteRouter.route("/order/cancel-by-product").post(websiteController.orderdProductCancel);

websiteRouter.route("/allEvent").get(websiteController.allEvent);

module.exports = websiteRouter;
