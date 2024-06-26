const { db } = require('../../../models');
const { Op } = require('sequelize');
const { queue } = require('../../../kue');
const config = require('../../../config');
const AWS = require('aws-sdk');
const moment = require('moment');
const Util = require('../../../helpers/Util');
const xlsx = require('xlsx');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

let deleteFileFromS3 = async (imgUrl) => {
  try {
    const lastItem = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
    let params = {
      Bucket: 'ninocodenox',
      Key: lastItem,
    };
    s3.deleteObject(params, (error, data) => {
      if (error) {
        console.log(error, error.stack);
      }
      return data;
    });
  } catch (error) {
    assert.isNotOk(error, 'Promise error');
    done();
  }
};

function convertToSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

module.exports = {

    async uploadProductsAsync(req, res, next) {
    try {
      const productsData = req.body;

      if (!Array.isArray(productsData) || productsData.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid or empty products data' });
      }

      const t = await db.sequelize.transaction();

      try {
        const createdProducts = [];
        const updatedProducts = [];

        for (const productData of productsData) {
          const {
            categoryName,
            subCategoryName,
            name,
            slug,
            Collection,
            photo,
            status,
            productVariants,
            desc,
            longDesc,
            HighLightDetail,
            ShippingDays,
            PubilshStatus,
            referSizeChart,
            material,
            condition,
          } = productData;

          // Fetch category ID based on category name
          let category;
          let categoryId;
          if (categoryName) {
            category = await db.category.findOne({ where: { name: categoryName } || { slug: categoryName } });
            if (!category) {
              throw new Error(`Category not found for name: ${categoryName}`);
            }
            categoryId = category.id;
          }

          // Fetch subcategory ID based on subcategory name
          let subcategory;
          let subCategoryId;
          if (subCategoryName) {
            subcategory = await db.SubCategory.findOne({ where: { sub_name: subCategoryName } });
            if (!subcategory) {
              throw new Error(`Subcategory not found for name: ${subCategoryName}`);
            }
            subCategoryId = subcategory.id;
          }

          let product = await db.product.findOne({ where: { name: name } });

          const brand = Collection ? await db.collection.findOne({ where: { slug: Collection } }) : null;

          if (product) {
            // Product already exists, update it
            await db.product.update(
              {
                categoryId: categoryId,
                subCategoryId: subCategoryId,
                name: name,
                slug: slug,
                status: 'active',
                brandId: brand ? brand.id : null,
                desc: desc,
                longDesc: longDesc,
                photo: photo ? photo : product.photo,
                HighLightDetail: HighLightDetail,
                ShippingDays: ShippingDays,
                PubilshStatus: PubilshStatus,
                referSizeChart: referSizeChart,
                material: material,
                condition: condition,
                // PubilshStatus: "Published",
              },
              { where: { id: product.id }, transaction: t }
            );

            updatedProducts.push({ id: product.id, name: product.name });
          } else {
            // Product does not exist, create it
            product = await db.product.create(
              {
                categoryId: categoryId,
                subCategoryId: subCategoryId,
                name: name,
                slug: slug,
                status: 'active',
                SellerId: '1',
                brandId: brand ? brand.id : null,
                desc: desc,
                longDesc: longDesc,
                photo: photo ? photo : null,
                HighLightDetail: HighLightDetail,
                ShippingDays: ShippingDays,
                PubilshStatus: 'Published',
                referSizeChart: referSizeChart,
                material: material,
                condition: condition,
              },
              { transaction: t }
            );

            createdProducts.push({ id: product.id, name: product.name });
          }

          // Delete all existing product variants for the current product
          await db.ProductVariant.destroy({ where: { productId: product.id }, transaction: t });

          // Create new product variants based on the uploaded data
          if (Array.isArray(productVariants)) {
            for (const variant of productVariants) {
              const createdVariant = await db.ProductVariant.create({
                productId: product.id,
                productName: variant.productName,
                slug: variant.slug,
                productCode: variant.productCode || 'PD' + Math.random().toString(36).substr(2, 4),
                actualPrice: variant.actualPrice,
                distributorPrice: variant.distributorPrice || 0,
                marginPer: variant.marginPer,
                marginPrice: variant.marginPrice,
                buyerPrice: variant.buyerPrice || 0,
                sellerPrice: variant.sellerPrice,
                unitSize: variant.unitSize,
                qty: variant.qty ? variant.qty : 0,
                discountPer: variant.discountPer,
                discount: variant.discount,
                total: variant.total,
                netPrice: variant.netPrice,
                qtyWarning: variant.qtyWarning,
                youTubeUrl: variant.youTubeUrl,
                COD: variant.COD ? variant.COD : 0,
                brandId: brand ? brand.id : null,
                refundable: variant.refundable ? variant.refundable : 0,
                stockType: variant.stockType,
                Available: variant.Available,
              }, { transaction: t });

              // If the variant is created successfully, proceed to create its variation options
              if (createdVariant && Array.isArray(variant.variationOptions)) {
                for (const option of variant.variationOptions) {
                  if (option.name !== null && option.name !== undefined && option.value !== null && option.value !== undefined) {

                    console.log('createdVariantId***', createdVariant.id)
                    // Create new VariationOption
                    await db.VariationOption.create({
                      name: option.name,
                      value: option.value,
                      productVariantId: createdVariant.id
                    }, { transaction: t });
                  } else {
                    console.error("Error: VariationOption name or value cannot be null or undefined");
                  }
                }
              }
            }
          }
        }

        await t.commit();
        return res.status(201).json({
          success: true,
          createdProducts: createdProducts,
          updatedProducts: updatedProducts,
        });
      } catch (error) {
        console.log("Error:", error);
        await t.rollback();
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    } catch (err) {
      next(err);
    }
  },
  
  /* Add user api start here................................*/

  async addProduct(req, res, next) {
    try {
      const {
        categoryId,
        subCategoryId,
        name,
        slug,
        brand,
        referSizeChart,
        material,
        status,
        productVariants,
        desc,
        longDesc
      } = req.body;

      const variants = JSON.parse(productVariants);

      const product = await db.product.findOne({
        where: { name: name },
      });

      if (!product) {
        const t = await db.sequelize.transaction();
        try {
          const productCreated = await db.product.create(
            {
              categoryId: categoryId,
              subCategoryId: subCategoryId,
              name: name,
              slug: slug,
              status: "active",
              PubilshStatus: "Published",
              SellerId: '1',
              referSizeChart: referSizeChart,
              material: material,
              brandId: brand ? brand : null,
              desc: desc,
              longDesc: longDesc,
              photo: req.file ? req.file.location : "",
            },
            { transaction: t }
          );

          await Promise.all(variants.map(async (variant) => {
            let slug = convertToSlug(variant.productName);
            const productVariant = await db.ProductVariant.create(
              {
                productId: productCreated.id,
                productName: variant.productName,
                slug: slug,
                productCode: variant.productCode
                  ? variant.productCode
                  : `PD${Math.random().toString(36).substr(2, 4)}`,
                actualPrice: variant.actualPrice || 0,
                distributorPrice: variant.distributorPrice || 0,
                buyerPrice: variant.buyerPrice || 0,
                qty: variant.qty || 0,
                discountPer: variant.discountPer || 0,
                discount: variant.discount || 0,
                netPrice: variant.netPrice || 0,
                brandId: brand ? brand : null,
                // shortDesc: variant.shortDesc || "",
                COD: variant.COD || 0
              },
              { transaction: t }
            );

            // Create VariationOptions for the current productVariant
            const variationOptions = [];
            for (const [attributeName, attributeValue] of Object.entries(variant.attribute)) {
              variationOptions.push({
                name: attributeName,
                value: attributeValue,
                productVariantId: productVariant.id
              });
            }
            await db.VariationOption.bulkCreate(variationOptions, { transaction: t });

            return productVariant;
          }));

          await t.commit();

          return res
            .status(201)
            .json({ success: true, msg: "Successfully inserted product" });
        } catch (error) {
          await t.rollback();
          throw error;
        }
      } else {
        throw new RequestError("Already exist product", 409);
      }
    } catch (err) {
      // Handle error
      if (err instanceof RequestError) {
        return res.status(err.statusCode).json({ success: false, msg: err.message });
      } else {
        console.error("Some Error Occurred:", err);
        return res.status(500).json({ success: false, msg: "Internal server error" });
      }
    }
  },

  async index(req, res, next) {
    try {
      const { supplierId, categoryId, subCategoryId } = req.query;
      db.product
        .findAll({
          order: [["createdAt", "DESC"]],
          where: {
            supplierId: supplierId,
            categoryId: categoryId,
            subCategoryId: subCategoryId,
          },
        })
        .then((product) => {
          res.status(200).json({ success: true, product });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getAllProductList(req, res, next) {
    let limit = 40;
    let offset = 0;
    let page = 1;
    if (req.body.limit !== undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    let { status, id, categoryId } = req.body;

    try {
      if (id) {
        const product = await db.product.findOne({
          where: { id: req.body.id },
          include: [
            { model: db.productphoto },
            { model: db.ProductVariant, include: [{ model: db.VariationOption }] },
          ],
        });
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        const imageList = product.productphotos.map((url) => url.imgUrl);
        const variantAttributes = new Map();
        for (const variant of product.ProductVariants) {
          for (const option of variant.VariationOptions) {
            if (!variantAttributes.has(option.name)) {
              variantAttributes.set(option.name, new Set());
            }
            variantAttributes.get(option.name).add(option.value);
          }
        }
        res.status(200).json({ product: { ...product.toJSON(), imageList, variantAttributes } });
      } else if (status && categoryId) {
        const products = await db.product.findAll({
          where: { status: status, categoryId: categoryId },
          include: [
            { model: db.productphoto },
            { model: db.ProductVariant, include: [{ model: db.VariationOption }] },
          ],
        });
        res.status(200).json({ products });
      } else {
        const [count, products] = await Promise.all([
          db.product.count(),
          db.product.findAll({
            order: [["createdAt", "DESC"]],
            include: [
              { model: db.productphoto },
              { model: db.ProductVariant, include: [{ model: db.VariationOption }] },
            ],
            limit: limit,
            offset: (page - 1) * limit,
          }),
        ]);
        const pages = Math.ceil(count / limit);
        res.status(200).json({ products, count, pages });
      }
    } catch (err) {
      console.log("Some error", err);
      next(err);
    }
  },

  async getProductForFlash(req, res, next) {
    try {
      const query = {};
      query.where = {};
      query.where.SellerId = {
        [Op.ne]: null,
      };
      query.where.name = {
        [Op.ne]: null,
      };
      query.where.PubilshStatus = {
        [Op.eq]: "Published",
      };
      query.attributes = ["id", "name", "photo"];
      query.order = [["createdAt", "DESC"]];
      query.include = [
        {
          model: db.ProductVariant,
        },
      ];
      let product = await db.product.findAll({ ...query });
      if (product.length > 0) {
        const arrData = [];
        product.forEach((value) => {
          const dataList = {
            id: value.id,
            VarientId: value.ProductVariants[0]
              ? value.ProductVariants[0].id
              : null,
            name: value.name,
            slug: value.slug,
            Thumbnail: value.ProductVariants[0]
              ? value.ProductVariants[0].thumbnail
              : null,
            distributorPrice: value.ProductVariants[0]
              ? value.ProductVariants[0].distributorPrice
              : null,
            netPrice: value.ProductVariants[0]
              ? value.ProductVariants[0].netPrice
              : null,
            discount: value.ProductVariants[0]
              ? value.ProductVariants[0].discount
              : null,
            discountPer: value.ProductVariants[0]
              ? value.ProductVariants[0].discountPer
              : null,
          };
          arrData.push(dataList);
        });
        var response = Util.getFormatedResponse(false, arrData, {
          message: "Success",
        });
        res.status(response.code).json(response);
      } else {
        var response = Util.getFormatedResponse(false, {
          message: "No data found",
        });
        res.status(response.code).json(response);
      }
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const {
        productId,
        mainCatName,
        subCatName,
        name,
        slug,
        referSizeChart,
        material,
        collection,
        status,
        desc,
        longDesc,
        priceDetails,
        ShippingDays,
        PubilshStatus,
        LocalDeiveryCharge,
        selectedCategory,
        selectedSubCategory,
      } = req.body;

      let variants = priceDetails;

      const updatedProduct = await db.product.findOne({ where: { id: productId } });

      if (!updatedProduct) {
        return res.status(404).json({ success: false, msg: "Product not found" });
      }

      const updatedFields = {
        categoryId: selectedCategory || updatedProduct.categoryId,
        subCategoryId: selectedSubCategory || updatedProduct.subCategoryId,
        name: name || updatedProduct.name,
        slug: convertToSlug(name) || updatedProduct.slug,
        referSizeChart: referSizeChart || updatedProduct.referSizeChart,
        material: material || updatedProduct.material,
        status: parseInt(status) ? "active" : "inactive",
        brandId: collection || updatedProduct.collection,
        desc: desc || updatedProduct.desc,
        longDesc: longDesc || updatedProduct.longDesc,
        ShippingDays: ShippingDays || updatedProduct.ShippingDays,
        PubilshStatus: PubilshStatus || updatedProduct.PubilshStatus,
        LocalDeiveryCharge: LocalDeiveryCharge || updatedProduct.LocalDeiveryCharge,
        photo: req.file ? req.file.location : updatedProduct.photo,
      };

      // Update product
      await db.product.update(updatedFields, { where: { id: productId } });

      // Update product variants and associated variation options
      for (let i = 0; i < variants.length; i++) {
        let variant = variants[i];

        // Check if the variant already exists
        let existingVariant = await db.ProductVariant.findOne({ where: { id: variant.id } });

        if (!existingVariant) {
          // If the variant doesn't exist, create a new one
          existingVariant = await db.ProductVariant.create({
            productId: productId,
            productName: variant.productName,
            slug: convertToSlug(variant.productName),
            productCode: variant.productCode,
            actualPrice: variant.actualPrice || 0,
            distributorPrice: variant.distributorPrice || 0,
            buyerPrice: variant.buyerPrice || 0,
            qty: variant.qty || 0,
            qtyWarning: variant.qtyWarning || 0,
            discountPer: variant.discountPer || 0,
            discount: variant.discount || 0,
            total: variant.total || 0,
            netPrice: variant.netPrice || 0,
            unitSize: variant.unitSize || 1,
            refundable: variant.refundable || "",
            COD: variant.COD,
            stockType: variant.stockType

          });
        } else {
          // If the variant exists, update its fields
          existingVariant = await existingVariant.update({
            productName: variant.productName,
            slug: convertToSlug(variant.productName),
            productCode: variant.productCode,
            actualPrice: variant.actualPrice || 0,
            distributorPrice: variant.distributorPrice || 0,
            buyerPrice: variant.buyerPrice || 0,
            qty: variant.qty || 0,
            qtyWarning: variant.qtyWarning || 0,
            discountPer: variant.discountPer || 0,
            discount: variant.discount || 0,
            total: variant.total || 0,
            netPrice: variant.netPrice || 0,
            unitSize: variant.unitSize || 1,
            refundable: variant.refundable || "",
            COD: variant.COD || 0,
            stockType: variant.stockType || 0
          });
        }

        // Update or create associated variation options
        for (const option of variant.variationOptions) {
          let existingOption = await db.VariationOption.findOne({
            where: { name: option.name, productVariantId: existingVariant.id }
          });

          if (!existingOption) {
            // If the option doesn't exist, create a new one
            await db.VariationOption.create({
              name: option.name,
              value: option.value,
              productVariantId: existingVariant.id
            });
          } else {
            // If the option exists, update its value
            await existingOption.update({ value: option.value });
          }
        }
      }

      res.status(200).json({ success: true, msg: "Updated Successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, msg: "An error occurred" });
    }
  }
  ,

  async searchAllProductList(req, res, next) {
    try {
      db.product
        .findAll({
          order: [["createdAt", "DESC"]],
        })
        .then((product) => {
          res.status(200).json({ success: true, data: product });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getProductListByCategory(req, res, next) {
    try {
      db.product
        .findAll({
          order: [["createdAt", "DESC"]],
          where: {
            categoryId: req.query.categoryId,
            subCategoryId: req.query.subCategoryId,
          },
        })
        .then((list) => {
          res.status(200).json({ success: true, data: list });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getProductListById(req, res, next) {
    try {
      const productId = req.query.id;
      const products = await db.product.findAll({
        where: { id: productId },
        include: [
          { model: db.productphoto, attributes: ["id", "imgUrl"] },
          {
            model: db.ProductVariant,
            include: [{ model: db.VariationOption, as: 'variationOptions' }], // Include VariationOption model
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      if (!products || products.length === 0) {
        // Check if no product found
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }

      const productList = products.map((product) => {
        // Map each product to include variation options
        const imageList = product.productphotos.map((photo) => photo.imgUrl);
        const variantAttributes = new Map();

        // Adding variation options to the map
        product.ProductVariants.forEach((variant) => {
          for (const option of variant.variationOptions) {
            if (!variantAttributes.has(option.name)) {
              variantAttributes.set(option.name, new Set());
            }
            variantAttributes.get(option.name).add(option.value);
          }
        });

        return {
          id: product.id,
          name: product.name,
          imageList: imageList,
          variationOptions: Array.from(variantAttributes.entries()).map(([name, values]) => ({ name, values: Array.from(values) })),
        };
      });

      res.status(200).json({ success: true, products: productList });
    } catch (err) {
      next(err);
    }
  },


  async getWebProductListById(req, res, next) {
    let { varientId, productId } = req.body;
    try {
      if (varientId && productId) {
        db.product
          .findOne({
            where: { id: productId },
            include: [
              // { model: db.productphoto, where: { varientId: varientId ? varientId: '', productId: productId ? productId: ''} },
              {
                model: db.ProductVariant,
                where: { id: varientId, productId: productId },
              },
              { model: db.Seo_Details },
              { model: db.ch_brand_detail, attributes: ["id", "name"] },
            ],
            order: [["createdAt", "DESC"]],
          })
          .then((list) => {
            return db.productphoto
              .findAll({
                where: { varientId: varientId, productId: productId },
              })
              .then((r) => [r, list]);
          })
          .then(([imglist, list]) => {
            // console.log(JSON.stringify(imglist))
            res
              .status(200)
              .json({ success: true, data: list, imglist: imglist });
          })
          .catch(function (err) {
            next(err);
          });
      } else {
        db.product
          .findOne({
            where: { id: req.body.id },
            include: [
              {
                model: db.productphoto,
                attributes: ["id", "imgUrl", "productid", "varientId"],
              },
              { model: db.ProductVariant },
              { model: db.Seo_Details },
              { model: db.ch_brand_detail, attributes: ["id", "name"] },
            ],
            order: [["createdAt", "DESC"]],
          })
          .then((list) => {
            res.status(200).json({ success: true, data: list });
          })
          .catch(function (err) {
            console.log(err);
            next(err);
          });
      }
    } catch (err) {
      console.log(err);
      throw new RequestError("Error");
    }
  },
  async addProductOffer(req, res, next) {
    try {
      const { productId, qty, discount_per, discount_price, total, net_price } =
        req.body;
      db.ProductOffer.findOne({ where: { id: productId } })
        .then((list) => {
          if (!list) {
            return db.ProductOffer.create({
              productId: productId,
              image: req.file ? req.file.location : "",
              qty: qty,
              discount_per: discount_per,
              discount_price: discount_price,
              total: total,
              net_price: net_price,
            });
          } else {
            return db.ProductOffer.update(
              {
                qty: qty,
                discount_per: discount_per,
                discount_price: discount_price,
                total: total,
                net_price: net_price,
              },
              { where: { id: list.id } }
            );
          }
        })
        .then((p) => {
          res.status(200).json({ success: true, msg: "Successfully" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getProductOffer(req, res, next) {
    try {
      db.ProductOffer.findAll({
        include: [
          {
            model: db.product,
            attributes: [
              "id",
              "categoryId",
              "price",
              "item_name",
              "description",
              "brand",
            ],
            include: [{ model: db.category, attributes: ["id", "name"] }],
          },
        ],
      })
        .then((list) => {
          res.status(200).json({ success: true, data: list });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async productDelete(req, res, next) {
    db.product
      .findOne({ where: { id: parseInt(req.query.id) } })
      .then(async (product) => {
        const t = await db.sequelize.transaction();
        if (product) {
          try {
            await db.ProductVariant.destroy(
              { where: { productId: product.id } },
              { transaction: t }
            );
            await db.product.destroy(
              { where: { id: product.id } },
              { transaction: t }
            );

            return t.commit();
          } catch (err) {
            await t.rollback();
            throw error;
          }
        }
        throw new RequestError("Product is not found");
      })
      .then((re) => {
        return res.status(200).json({ status: "deleted Product Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },

  async productVarients(req, res, next) {
    db.ProductVariant.findOne({ where: { id: parseInt(req.query.id) } })
      .then(async (product) => {
        const t = await db.sequelize.transaction();
        if (product) {
          try {
            await db.ProductVariant.destroy(
              { where: { id: product.id } },
              { transaction: t }
            );
            return t.commit();
          } catch (err) {
            await t.rollback();
            throw error;
          }
        }
        throw new RequestError("Productprice is not found");
      })
      .then((re) => {
        return res
          .status(200)
          .json({ status: "Deleted Productprice Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },
  async deleteMainProduct(req, res, next) {
    db.product
      .findOne({ where: { id: parseInt(req.query.id) } })
      .then(async (product) => {
        const t = await db.sequelize.transaction();
        if (product) {
          try {
            await db.product.destroy(
              { where: { id: product.id } },
              { transaction: t }
            );
            return t.commit();
          } catch (err) {
            await t.rollback();
            throw error;
          }
        }
        throw new RequestError("Productprice is not found");
      })
      .then((re) => {
        return res
          .status(200)
          .json({ status: "Deleted Productprice Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },
  async newArrivalProduct(req, res, next) {
    try {
      db.product
        .findAll({
          order: [["createdAt", "DESC"]],
          where: {
            [Op.and]: [
              {
                createdAt: {
                  [Op.gte]: moment().subtract(7, "days").toDate(),
                },
              },
              { status: "active" },
            ],
          },
          include: [
            { model: db.ch_brand_detail, attributes: ["id", "name"] },
            { model: db.productphoto, attributes: ["id", "imgUrl"] },
            { model: db.ProductVariant },
          ],
        })
        .then((list) => {
          res.status(200).json({ success: true, data: list });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async productOfferDelete(req, res, next) {
    db.ProductOffer.findOne({ where: { id: parseInt(req.params.id) } })
      .then((product) => {
        if (product) {
          return db.ProductOffer.destroy({ where: { id: product.id } });
        }
        throw new RequestError("Product is not found");
      })
      .then((re) => {
        return res.status(200).json({ status: "deleted Product Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },

  async multiplePhotoUpload(req, res, next) {
    let attachmentEntries = [];
    var productId = req.body.productId;
    for (var i = 0; i < req.files.length; i++) {
      attachmentEntries.push({
        productId: productId,
        name: req.files[i].filename,
        mime: req.files[i].mimetype,
        imgUrl: req.files[i].location,
      });
    }

    db.product
      .findOne({
        where: { id: productId },
      })
      .then((r) => {
        if (r) {
          return queue
            .create("img-upload", {
              productId: productId,
              productName: r.item_name,
              attachmentEntries: attachmentEntries,
            })
            .save();
        }
        throw new RequestError("ProductId is not found");
      })
      .then((r) => {
        res.status(200).json({ success: r });
      })
      .catch(function (error) {
        console.log(error);
        res.status(500).json({ errors: ["Error insert photo"] });
      });
  },

  async varientImageUpload(req, res, next) {
    let attachmentEntries = [];
    let { productId } = req.body;

    for (var i = 0; i < req.files.length; i++) {
      attachmentEntries.push({
        productId: productId,
        name: req.files[i].filename,
        mime: req.files[i].mimetype,
        imgUrl: req.files[i].location,
      });
    }

    db.ProductVariant.findOne({
      where: {
        productId: productId,
      },
    })
      .then((r) => {
        if (r) {
          return queue
            .create("img-upload", {
              productId: req.body.productId,
              attachmentEntries: attachmentEntries,
            })
            .save();
        }

        throw new RequestError("ProductId is not found");
      })
      .then((r) => {
        res.status(200).json({ success: r });
      })
      .catch(function (error) {
        console.log(error);
        res.status(500).json({ errors: ["Error insert photo"] });
      });
  },

  async getAllPhoto(req, res, next) {
    let limit = 50;
    let offset = 0;
    let page = 1;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    try {
      db.product
        .count({
          include: [{ model: db.productphoto }],
        })
        .then((count) => {
          let pages = Math.ceil(count / limit);
          offset = limit * (page - 1);
          return db.product
            .findAll({
              order: [["createdAt", "DESC"]],
              attributes: ["id", "name"],
              limit: limit,
              offset: offset,
              include: [
                {
                  model: db.productphoto,
                  attributes: ["id", "imgUrl"],
                  limit: limit,
                },
              ],
            })
            .then((r) => [r, pages, count]);
        })
        .then(([list, pages, count]) => {
          res.status(200).json({ data: list, count: count, pages: pages });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getAllPhotoById(req, res, next) {
    const { id } = req.body;
    let whereCond = {};
    if (id) {
      whereCond = { id: id };
    }
    try {
      db.product
        .findAll({
          where: whereCond,
          order: [["createdAt", "DESC"]],
          attributes: ["id", "name"],
          include: [{ model: db.productphoto, attributes: ["id", "imgUrl"] }],
        })
        .then((data) => {
          res.status(200).json({ success: true, data });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async deleteSliderPhoto(req, res, next) {
    db.productphoto
      .findOne({ where: { id: parseInt(req.query.id) } })
      .then((product) => {
        if (product) {
          return db.productphoto.destroy({ where: { id: req.query.id } });
        }
        throw new RequestError("Product is not found");
      })
      .then((re) => {
        return res.status(200).json({ status: "deleted Product Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },

  async getAllProductBySlug(req, res, next) {
    let limit = 50;
    let offset = 0;
    let page = 1;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    let { slug } = req.body;
    let wherecond = {};
    if (slug) {
      wherecond.slug = slug;
    }
    try {
      let result = {};
      result.category = await db.category.findOne({
        where: wherecond,
      });
      result.subcat = await db.SubCategory.findOne({
        where: wherecond,
      });
      result.brand = await db.ch_brand_detail.findOne({
        where: wherecond,
      });
      if (result.category || result.subcat) {
        db.product
          .count({
            order: [["createdAt", "DESC"]],
            where: {
              [Op.or]: [
                {
                  categoryId: result.category ? result.category.id : null,
                  status: "active",
                },
                {
                  subCategoryId: result.subcat ? result.subcat.id : null,
                  status: "active",
                },
              ],
            },
            include: [
              { model: db.productphoto, attributes: ["id", "imgUrl"] },
              { model: db.ProductVariant },
            ],
            limit: limit,
            offset: offset,
          })
          .then((count) => {
            let pages = Math.ceil(count / limit);
            offset = limit * (page - 1);
            return db.product
              .findAll({
                order: [["createdAt", "DESC"]],
                where: {
                  [Op.or]: [
                    {
                      categoryId: result.category ? result.category.id : null,
                      status: "active",
                    },
                    {
                      subCategoryId: result.subcat ? result.subcat.id : null,
                      status: "active",
                    },
                  ],
                },
                include: [
                  { model: db.productphoto, attributes: ["id", "imgUrl"] },
                  { model: db.ProductVariant },
                ],
                limit: limit,
                offset: offset,
              })
              .then((r) => [r, pages, count]);
          })
          .then(([list, pages, count]) => {
            res.status(200).json({ data: list, count: count, pages: pages });
          })
          .catch(function (err) {
            console.log("some error", err);
            next(err);
          });
      }
      if (result.brand) {
        db.product
          .count({
            order: [["createdAt", "DESC"]],
            where: {
              brandId: result.brand.id,
            },
            include: [
              { model: db.productphoto, attributes: ["id", "imgUrl"] },
              { model: db.ProductVariant },
            ],
            limit: limit,
            offset: offset,
          })
          .then((count) => {
            let pages = Math.ceil(count / limit);
            offset = limit * (page - 1);
            return db.product
              .findAll({
                order: [["createdAt", "DESC"]],
                where: {
                  brandId: result.brand.id,
                },
                include: [
                  { model: db.productphoto, attributes: ["id", "imgUrl"] },
                  { model: db.ProductVariant },
                ],
                limit: limit,
                offset: offset,
              })
              .then((r) => [r, pages, count]);
          })
          .then(([list, pages, count]) => {
            res.status(200).json({ data: list, count: count, pages: pages });
          })
          .catch(function (err) {
            next(err);
          });
      }
    } catch (err) {
      throw new RequestError(err);
    }
  },

  // filter product

  async getFilterbyProduct(req, res, next) {
    try {
      let search = "%%";
      if (req.query.search) {
        search = "%" + req.query.search + "%";
      }
      let result = {};
      result.maincat = await db.category.findOne({
        where: { name: { [Op.like]: search } },
      });
      result.subchild = await db.SubChildCategory.findOne({
        where: { name: { [Op.like]: search } },
      });

      result.subcat = await db.SubCategory.findOne({
        where: { sub_name: { [Op.like]: search } },
      });

      result.brand = await db.ch_brand_detail.findOne({
        where: { name: { [Op.like]: search } },
      });

      result.item = await db.product.findOne({
        where: { name: { [Op.like]: search } },
      });

      if (result.maincat) {
        db.product
          .findAll({
            order: [["createdAt", "DESC"]],
            where: {
              status: { [Op.eq]: "active" },
              categoryId: result.maincat.id,
            },
            include: [{ model: db.ProductVariant }, { model: db.productphoto }],
          })
          .then((product) => {
            return db.category
              .findOne({
                // attributes: ['id', 'name'],
                where: { id: result.maincat.id },
                include: [
                  {
                    model: db.SubCategory,
                    as: 'subcategories',
                    attributes: ["id", "sub_name"],
                    include: [
                      {
                        model: db.SubChildCategory,
                        attributes: ["id", "name", "subcategoryId"],
                      },
                    ],
                  },
                ],
              })
              .then((category) => [product, category]);
          })
          .then(([product, category]) => {
            res
              .status(200)
              .json({ success: true, data: product, category: category });
          })
          .catch(function (err) {
            next(err);
          });
      } else if (result.subcat) {
        db.product
          .findAll({
            order: [["createdAt", "DESC"]],
            where: {
              status: { [Op.eq]: "active" },
              subcategoryId: result.subcat.id,
            },
            include: [{ model: db.ProductVariant }, { model: db.productphoto }],
          })
          .then((product) => {
            return db.category
              .findOne({
                // attributes: ['id', 'name'],
                include: [
                  {
                    model: db.SubCategory,
                    as: 'subcategories',
                    where: {
                      // status: { [Op.eq]: 'active' },
                      id: result.subcat.id,
                    },
                    attributes: ["id", "sub_name"],
                    include: [
                      {
                        model: db.SubChildCategory,
                        attributes: ["id", "name", "subcategoryId"],
                      },
                    ],
                  },
                ],
              })
              .then((category) => [product, category]);
          })
          .then(([product, category]) => {
            res
              .status(200)
              .json({ success: true, data: product, category: category });
          })
          .catch(function (err) {
            console.log(err);
            next(err);
          });
      } else if (result.brand) {
        db.product
          .findAll({
            order: [["createdAt", "DESC"]],
            where: {
              status: { [Op.eq]: "active" },
              brandId: result.brand.id,
            },
            include: [{ model: db.ProductVariant }, { model: db.productphoto }],
          })
          .then((product) => {
            return db.category
              .findOne({
                // attributes: ['id', 'name'],
                include: [
                  {
                    model: db.SubCategory,
                    as: 'subcategories',
                    attributes: ["id", "sub_name"],
                    include: [
                      {
                        model: db.SubChildCategory,
                        attributes: ["id", "name", "subcategoryId"],
                      },
                    ],
                  },
                ],
              })
              .then((category) => [product, category]);
          })
          .then(([product, category]) => {
            res.status(200).json({
              success: true,
              data: product,
              category: category,
              brand: result.brand,
            });
          })
          .catch(function (err) {
            console.log(err);
            next(err);
          });
      } else if (result.subchild) {
        db.product
          .findAll({
            where: {
              status: { [Op.eq]: "active" },
              childCategoryId: result.subchild.id,
            },
            include: [{ model: db.ProductVariant }, { model: db.productphoto }],
          })
          .then((product) => {
            return db.category
              .findOne({
                // attributes: ['id', 'name'],
                include: [
                  {
                    model: db.SubCategory,
                    as: 'subcategories',
                    attributes: ["id", "sub_name"],
                    include: [
                      {
                        model: db.SubChildCategory,
                        where: {
                          // status: { [Op.eq]: 'active' },
                          id: result.subchild.id,
                        },
                        attributes: ["id", "name", "subcategoryId"],
                      },
                    ],
                  },
                ],
              })
              .then((category) => [product, category]);
          })
          .then(([product, category]) => {
            res
              .status(200)
              .json({ success: true, data: product, category: category });
          })
          .catch(function (err) {
            console.log(err);
            next(err);
          });
      } else {
        db.product
          .findAll({
            order: [["createdAt", "DESC"]],
            where: {
              status: { [Op.eq]: "active" },
              id: result.item.id,
            },
            include: [{ model: db.ProductVariant }, { model: db.productphoto }],
          })
          .then((product) => {
            return db.category
              .findOne({
                // attributes: ['id', 'name'],
                include: [
                  {
                    model: db.SubCategory,
                    as: 'subcategories',
                    attributes: ["id", "sub_name"],
                    include: [
                      {
                        model: db.SubChildCategory,
                        attributes: ["id", "name", "subcategoryId"],
                      },
                    ],
                  },
                ],
              })
              .then((category) => [product, category]);
          })
          .then(([product, category]) => {
            res
              .status(200)
              .json({ success: true, data: product, category: category });
          })
          .catch(function (err) {
            console.log(err);
            next(err);
          });
      }
    } catch (err) {
      console.log(err);
      throw new RequestError("Error");
    }
  },

  async GetAllByCategory(req, res, next) {
    try {
      db.SubCategory.findOne({
        // attributes: ["id", "sub_name", "slug"],
        where: { slug: req.body.slug },
        include: [
          {
            model: db.product,
            order: [["createdAt", "DESC"]],
            where: { status: "active" },
            include: [
              { model: db.productphoto, attributes: ["id", "imgUrl"] },
              { model: db.ProductVariant },
            ],
          },
        ],
      })
        .then((product) => {
          return db.SubCategory.findOne({
            // attributes: ["id", "sub_name", "slug"],
            where: { slug: req.body.slug },
            include: [
              {
                model: db.SubChildCategory,
                attributes: ["id", "name", "subCategoryId"],
              },
            ],
          }).then((r) => [product, r]);
        })
        .then(([product, r]) => {
          res.status(200).json({ success: true, data: product, category: r });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  // aws image delete
  async awsProductPhotoDelete(req, res, next) {
    try {
      const { id, imgUrl } = req.body;
      deleteFileFromS3(imgUrl)
        .then((data) => {
          if (!data) {
            return db.productphoto.destroy({ where: { id: id } });
          }
          throw new RequestError("error");
        })
        .then((success) => {
          res.status(200).json({
            success: true,
            message: "Successflly deleted image from s3 Bucket",
          });
        });
    } catch (err) {
      next(err);
    }
  },
  async relatedProduct(req, res, next) {
    let limit = 100;
    let offset = 0;
    let page = 1;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    try {
      db.product
        .findOne({
          where: { id: req.body.id },
        })
        .then((list) => {
          if (list) {
            return db.product
              .count({
                where: {
                  childCategoryId: list.childCategoryId,
                  status: "active",
                },
              })
              .then((count) => [count, list]);
          }
        })
        .then(([count, list]) => {
          let pages = Math.ceil(count / limit);
          offset = limit * (page - 1);
          return db.product
            .findAll({
              where: {
                childCategoryId: list.childCategoryId,
                status: "active",
              },
              include: [
                { model: db.ProductVariant },
                { model: db.productphoto },
              ],
              order: [
                ["id", "DESC"],
                ["name", "ASC"],
              ],
              limit: limit,
              offset: offset,
            })
            .then((r) => [r, pages, count]);
        })
        .then(([list, pages, count]) => {
          res.status(200).json({ data: list, count: count, pages: pages });
        })
        .catch(function (err) {
          console.log("some error", err);
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async statusUpdate(req, res, next) {
    try {
      const { productId, PubilshStatus } = req.body;
      db.product
        .findOne({ where: { id: productId } })
        .then((product) => {
          if (product.id) {
            return db.product.update(
              {
                PubilshStatus: PubilshStatus,
              },
              { where: { id: productId } }
            );
          } else {
            throw new RequestError("Not found product", 409);
          }
        })
        .then((p) => {
          res
            .status(200)
            .json({ success: true, message: "Status Updated Successfully" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async stockUpdate(req, res, next) {
    try {
      const { id, Available } = req.body;
      db.ProductVariant.findOne({ where: { id: id } })
        .then(async (product) => {
          if (product) {
            return db.ProductVariant.update(
              {
                Available: Available,
              },
              { where: { id: id } }
            );
          }
        })
        .then((p) => {
          res
            .status(200)
            .json({ success: true, msg: "Status Updated Successfully" });
        })
        .catch(function (err) {
          console.log(err);
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async bannerUpload(req, res, next) {
    try {
      const { id, slug, status, type, heading, content } = req.body;

      db.BannerDetail.findOne({ where: { id: id || null } })
        .then(async (data) => {
          if (data) {
            return db.BannerDetail.update(
              {
                id: id,
                slug: slug ? slug : data.slug,
                heading: heading ? heading : data.heading,
                content: content ? content : data.content,
                status: status ? status : data.status,
                banner: req.file ? req.file.location : data.banner,
                type: type,
              },
              { where: { id: id } }
            );
          } else {
            return db.BannerDetail.create({
              slug: slug,
              heading: heading,
              content: content,
              status: 0,
              type: type,
              banner: req.file ? req.file.location : "",
            });
          }
        })
        .then((p) => {
          res
            .status(200)
            .json({ success: true, message: "Banner Uploaded Successfully" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(error);
    }
  },

  async bannerList(req, res, next) {
    try {
      db.BannerDetail.findAll({
        where: { status: 1 },
      })
        .then((list) => {
          res.status(200).json({ success: true, data: list });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async bannerAdminList(req, res, next) {
    try {
      db.BannerDetail.findAll()
        .then((list) => {
          res.status(200).json({ success: true, data: list });
        })
        .catch(function (err) {
          console.log("==>", err);
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async bannerStatus(req, res, next) {
    try {
      const { id, status } = req.body;

      db.BannerDetail.findOne({ where: { id: id } })
        .then(async (data) => {
          if (data) {
            return db.BannerDetail.update(
              {
                status: status,
              },
              { where: { id: id } }
            );
          }
        })
        .then((p) => {
          res
            .status(200)
            .json({ success: true, msg: "Banner Uploaded Successfully" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async bannerListDelete(req, res, next) {
    try {
      const { id, banner } = req.body;
      deleteFileFromS3(banner)
        .then((data) => {
          if (!data) {
            return db.BannerDetail.destroy({ where: { id: id } });
          }
          throw new RequestError("error");
        })
        .then((success) => {
          res.status(200).json({
            success: true,
            msg: "Successflly deleted image from s3 Bucket",
          });
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async seoDetailsList(req, res, next) {
    const { productId, title, keyword, description } = req.body;
    try {
      db.Seo_Details.findOne({ where: { meta_title: title } })
        .then((list) => {
          if (!list) {
            return db.Seo_Details.create({
              productId: productId,
              meta_title: title,
              meta_desc: description,
              meta_keyword: keyword,
            });
          } else {
            return db.Seo_Details.update(
              {
                productId: productId,
                meta_title: title,
                meta_desc: description,
                meta_keyword: keyword,
              },
              { where: { id: id } }
            );
          }
        })
        .then((success) => {
          res.status(200).json({
            success: true,
            msg: "Successflly deleted image from s3 Bucket",
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      console.log("==>", err);
      throw new RequestError("Error");
    }
  },

  async filtershortby(req, res, next) {
    let limit = 50;
    let offset = 0;
    let page = 1;
    let sortbason;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    let data = req.body;

    sortbason = data.sortbasedon;
    let cond;
    if (sortbason === "1") {
      cond = ["netPrice", "ASC"];
    } else if (sortbason === "2") {
      cond = ["netPrice", "DESC"];
    } else if (sortbason === "3") {
      cond = ["productName", "DESC"];
    } else if (sortbason === "4") {
      cond = ["createdAt", "DESC"];
    }
    // console.log(cond)
    try {
      db.category
        .findOne({
          where: { slug: req.body.slug },
        })
        .then((cat) => {
          db.product
            .count({
              // subQuery:false,
              where: { categoryId: cat.id, status: "active" },
              include: [
                { model: db.productphoto, attributes: ["id", "imgUrl"] },
                {
                  model: db.ProductVariant,
                  separate: true,
                  order: [cond],
                },
              ],
              limit: limit,
              offset: offset,
            })
            .then((count) => {
              let pages = Math.ceil(count / limit);
              offset = limit * (page - 1);
              return db.product
                .findAll({
                  // subQuery:false,
                  where: { categoryId: cat.id, status: "active" },
                  include: [
                    { model: db.productphoto, attributes: ["id", "imgUrl"] },
                    {
                      model: db.ProductVariant,
                      separate: true,
                      order: [cond],
                    },
                  ],
                  limit: limit,
                  offset: offset,
                })
                .then((r) => [r, pages, count]);
            })
            .then(([list, pages, count]) => {
              res.status(200).json({ data: list, count: count, pages: pages });
            })
            .catch(function (err) {
              console.log(err);
              res.status(500).json({ success: false, error: err });
            });
        });
    } catch (err) {
      console.log("new error", err);
      res.status(500).json({ success: false, error: err });
    }
  },

  async getTag(req, res, next) {
    let limit = 40;
    let page = 1;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    try {
      db.tag
        .findAll({
          include: [
            {
              model: db.product,
              as: "product",
              attributes: ["name"],
              where: { SellerId: req.user.id },
            },
          ],
        })
        .then((list) => {
          var response = Util.getFormatedResponse(false, list, {
            message: "Success",
          });
          res.status(response.code).json(response);
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },

  async getDeleteTag(req, res, next) {
    try {
      db.tag
        .findOne({
          where: { id: req.query.id },
        })
        .then((list) => {
          if (list) {
            return db.tag.destroy({ where: { id: list.id } });
          }
          throw new RequestError("Tag is not found");
        })
        .then((success) => {
          res
            .status(200)
            .json({ status: 200, success: true, message: "Success deleted" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },


};
