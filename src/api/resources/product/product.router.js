const express = require('express');
const productController = require('./product.controller');
const { jwtStrategy } = require('../../../middleware/strategy');
const upload = require('../../../awsbucket');

const productRouter = express.Router();

productRouter.route('/add').post(
  jwtStrategy,
  upload.single('photo'),
  productController.addProduct
);

productRouter.route('/uploadPro').post(
  upload.single('photo'),
  productController.uploadProductsAsync
);

productRouter.route('/getAllproduct').get(productController.index);

productRouter.route('/getAllproductList').post(
  jwtStrategy,
  productController.getAllProductList
);

productRouter.route('/search/getAllproductList').get(
  jwtStrategy,
  productController.searchAllProductList
);

productRouter.route('/update').post(
  jwtStrategy,
  upload.single('photo'),
  productController.update
);

productRouter.route('/getProductByCategory').get(
  productController.getProductListByCategory
);

productRouter.route('/getProductById').get(
  productController.getProductListById
);

productRouter.route('/getWebProductById').post(
  productController.getWebProductListById
);

productRouter.route('/product-offer').post(
  productController.addProductOffer
);

productRouter.route('/getAllProductOffer').get(
  productController.getProductOffer
);

productRouter.route('/delete').delete(
  jwtStrategy,
  productController.productDelete
);

productRouter.route('/deleteOfferById/:id').get(
  jwtStrategy,
  productController.productOfferDelete
);

productRouter.route('/upload-img').post(
  jwtStrategy,
  upload.array('file', 10),
  productController.multiplePhotoUpload
);

productRouter.route('/upload/varient-img').post(
  upload.array('file', 10),
  productController.varientImageUpload
);

productRouter.route('/getAllPhoto').post(
  productController.getAllPhoto
);

productRouter.route('/getAllPhotoById').post(
  productController.getAllPhotoById
);

productRouter.route('/slider-photo/delete').delete(
  jwtStrategy,
  productController.deleteSliderPhoto
);

productRouter.route('/varients-delete').delete(
  jwtStrategy,
  productController.productVarients
);

productRouter.route('/main-delete').delete(
  jwtStrategy,
  productController.deleteMainProduct
);

productRouter.route('/new-arrival').get(
  productController.newArrivalProduct
);

productRouter.route('/list').post(
  productController.getAllProductBySlug
);

productRouter.route('/getAllByCategory').post(
  productController.GetAllByCategory
);

productRouter.route('/catalogsearch/result').get(
  productController.getFilterbyProduct
);

productRouter.route('/filtersortby').post(
  productController.filtershortby
);

productRouter.route('/status/update').post(
  jwtStrategy,
  productController.statusUpdate
);

productRouter.route('/update-stock').post(
  jwtStrategy,
  productController.stockUpdate
);

productRouter.route('/banner-upload').post(
  jwtStrategy,
  upload.single('banner'),
  productController.bannerUpload
);

productRouter.route('/admin/banner-list').get(
  jwtStrategy,
  productController.bannerAdminList
);

productRouter.route('/banner-list').get(
  productController.bannerList
);

productRouter.route('/banner-status').post(
  jwtStrategy,
  productController.bannerStatus
);

productRouter.route('/aws/delete/photo').post(
  jwtStrategy,
  productController.awsProductPhotoDelete
);

productRouter.route('/website/relatedProduct').post(
  productController.relatedProduct
);

productRouter.route('/banner-delete').post(
  jwtStrategy,
  productController.bannerListDelete
);

productRouter.route('/seo-create').post(
  jwtStrategy,
  productController.seoDetailsList
);

productRouter.route('/color/create').post(
  upload.single('thumbnail'),
  jwtStrategy,
  productController.createColorDetails
);

productRouter.route('/color-update').post(
  upload.single('thumbnail'),
  jwtStrategy,
  productController.updateColorDetails
);

productRouter.route('/color/list').post(
  jwtStrategy,
  productController.getColorList
);

productRouter.route('/color/delete').delete(
  jwtStrategy,
  productController.deleteColorById
);

productRouter.route('/color/list').get(
  jwtStrategy,
  productController.productColourList
);

productRouter.route('/getAllList').get(
  jwtStrategy,
  productController.getProductForFlash
);

productRouter.route('/tag').get(
  jwtStrategy,
  productController.getTag
);

productRouter.route('/tag').delete(
  jwtStrategy,
  productController.getDeleteTag
);

module.exports = productRouter;
