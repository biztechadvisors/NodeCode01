const express = require("express");
const categoryController = require("./category.controller");
const { jwtStrategy } = require("../../../middleware/strategy");
const upload = require("../../../awsbucket");

const categoryRouter = express.Router();

categoryRouter.route("/getAllCategory").get(categoryController.getCategoryList);
categoryRouter.route("/getAllSubCategory").get(categoryController.getSubCategoryList);
categoryRouter.route("/getAllSubChildCategory").get(categoryController.getSubChildCategoryList);
categoryRouter.route("/create").post(categoryController.addCategory);
categoryRouter.route("/child-list").get(categoryController.getSubChildList);
categoryRouter.route("/getCategoryById").get(categoryController.getCategoryById);
categoryRouter.route("/create-sub").post(jwtStrategy, categoryController.addSubCategory);
categoryRouter.route("/create-sub-child").post(jwtStrategy, categoryController.addSubChildCategory);
categoryRouter.route("/update").post(jwtStrategy, categoryController.updateCategory);
categoryRouter.route("/search/allcombine").post(categoryController.getAllCombine);
categoryRouter.route("/super-create").post(jwtStrategy, categoryController.createSuperCat);
categoryRouter.route("/super-update").put(jwtStrategy, categoryController.SuperCategoryUpdate);
categoryRouter.route("/super-list").get(jwtStrategy, categoryController.SuperCategoryList);
categoryRouter.route("/super/delete").post(jwtStrategy, categoryController.SuperCategoryDelete);
categoryRouter.route("/main-list").get(categoryController.getMainList);
categoryRouter.route("/search-by-value").post(categoryController.getSearchdropdown);
categoryRouter.route("/admin/main-list").get(jwtStrategy, categoryController.getAdminMainList);
categoryRouter.route("/main-list/update").post(jwtStrategy, upload.single("thumbnail"), categoryController.getMainListUpdate);
categoryRouter.route("/main/delete").delete(jwtStrategy, categoryController.getMainCatDelete);
categoryRouter.route("/sub-list").get(categoryController.getSubCategory);
categoryRouter.route("/sub-list/update").post(jwtStrategy, upload.single("thumbnail"), categoryController.getSubCatListUpdate);
categoryRouter.route("/sub-list/delete").delete(jwtStrategy, categoryController.getDeletedSubCatList);
categoryRouter.route("/child/deleteById").delete(jwtStrategy, categoryController.deleteCategory);
categoryRouter.route("/child/update").put(jwtStrategy, categoryController.childCatUpdate);
categoryRouter.route("/cn/list").get(categoryController.getAllCategoryBySlug);
categoryRouter.route("/findbysubchild").post(categoryController.filterByCategoryList);
categoryRouter.route("/covid-offer/senetry-pad").get(categoryController.getAllCovidProduct);
categoryRouter.route("/catlogsearch/child-category").post(categoryController.getFilterbyCategory);
categoryRouter.route("/catlogsearch/product").post(categoryController.getProductBySubcategory);
categoryRouter.route("/subcatlog/search/product").post(categoryController.getFilterbyChildCategory);
categoryRouter.route("/category-brand-list").post(categoryController.getBrandCatList);
categoryRouter.route("/banner-category-list").get(categoryController.getAllCategoryBannerlist);

module.exports = categoryRouter;
