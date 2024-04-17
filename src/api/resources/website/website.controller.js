const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const Util = require("../../../helpers/Util");
const mailer = require("../../../mailer");
const { db } = require('../../../models');
const moment = require("moment");
const dummyList = require("../../../config/dummy.json");

const findAddressList = (id) => {
  return new Promise((resolve, reject) => {
    db.Address.findOne({
      where: {
        id: id,
      },
    })
      .then((list) => {
        return list;
      })
      .then((r) => {
        resolve(r);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getUniqueListBy = (arr, key) => {
  try {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
  } catch (error) {
    throw new RequestError(error);
  }
};

const filterSellerProduct = (arr1, arr2) => {
  const temp = [];
  arr1.forEach((x) => {
    arr2.forEach((y) => {
      if (x.productId === y.id) {
        let sellerIds = JSON.parse(JSON.stringify(y));
        temp.push({ ...x, ...sellerIds });
      }
    });
  });

  return temp;
};

const checkEmpty = (arr) => {
  return arr.filter(function (e) {
    return e.id != null;
  });
};

const uniqueArr = (arr) => {
  return arr.reduce((unique, o) => {
    if (!unique.some((obj) => obj.id === o.id)) {
      unique.push(o);
    }
    return unique;
  }, []);
};

module.exports = {

  async collectionList(req, res, next) {
    const query = {};
    query.where = {};
    query.where.sequence = {
      [Op.ne]: 0,
    };
    query.order = [["Sequence", "ASC"]];
    query.attributes = ["id", "name", "slug"];
    query.include = [
      {
        model: db.product,
        attributes: ["id", "name", "slug", "photo"],
      }
    ];
    try {
      db.collection
        .findAll(query)
        .then((list) => {
          let response = Util.getFormatedResponse(false, list, {
            message: "Successfully",
          });
          res.status(response.code).json(response);
        })
        .catch((error) => {
          let response = Util.getFormatedResponse(false, {
            message: error,
          });
          res.status(response.code).json(response);
        });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Unfortuntely something is wrong" });
    }
  },

  async getCategoryList(req, res, next) {
    try {
      db.category
        .findAll({
          order: [["id", "desc"]],
          where: { status: true },
          attributes: ["id", "name", "thumbnail", "slug"],
          include: [
            {
              model: db.SubCategory,
              order: [["id", "asc"]],
              attributes: ["id", "sub_name", "slug", "thumbnail"],
            }
          ]
        })
        .then((list) => {
          res.status(200).json({
            status: 200,
            message: "Successfully",
            success: true,
            data: list,
          });
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async getBannerList(req, res, next) {
    try {
      const { type } = req.query;
      db.BannerDetail.findAll({
        where: { status: 1, type: type },
        attributes: ["id", "banner", "slug", "heading", "content"],
      }).then((list) => {
        let response = Util.getFormatedResponse(false, list, {
          message: "Success",
        });
        res.status(response.code).json(response);
      });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async getCollectionProducts(req, res, next) {
    const { slug } = req.query;

    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? Math.max(1, parseInt(req.query.page)) : 1;

    try {
      const collection = await db.collection.findOne({ where: { slug } });

      if (!collection) {
        const response = Util.getFormatedResponse(false, {
          message: 'Collection not found',
        });
        return res.status(response.code).json(response);
      }

      const collectionId = collection.id;

      const products = await db.product.findAndCountAll({
        where: {
          brandId: collectionId,
          [Op.and]: [
            { name: { [Op.ne]: null } },
            { PubilshStatus: { [Op.eq]: 'Published' } },
          ],
        },
        include: [
          {
            model: db.ProductVariant,
            include: [
              {
                model: db.VariationOption,
                as: 'variationOptions',
                attributes: ['name', 'value'],
              },
            ],
          },
          { model: db.category, as: 'maincat', attributes: ['id', 'name'] },
          { model: db.SubCategory, attributes: ['id', 'sub_name'] },
        ],
        order: [['id', 'DESC']],
      });

      if (products.count > 0) {
        const arrData = [];

        for (const value of products.rows) {
          const variantAttributes = new Map(); // Define variantAttributes outside the loop

          for (const variant of value.ProductVariants) {
            // Adding variation options to the map
            for (const option of variant.variationOptions) {
              if (!variantAttributes.has(option.name)) {
                variantAttributes.set(option.name, new Set());
              }
              variantAttributes.get(option.name).add(option.value);
            }
          }

          const dataList = {
            id: value.id,
            variantId: value.ProductVariants[0] ? value.ProductVariants[0].id : null,
            category_name: value.maincat.name,
            subCategorie_name: value.SubCategory?.sub_name,
            Name: value.name,
            PublishStatus: value.PubilshStatus,
            HighLightDetail: value.HighLightDetail,
            slug: value.slug,
            Thumbnail: value.photo,
            actualPrice: value.ProductVariants[0] ? value.ProductVariants[0].actualPrice : null,
            netPrice: value.ProductVariants[0] ? value.ProductVariants[0].netPrice : null,
            discount: value.ProductVariants[0] ? value.ProductVariants[0].discount : null,
            discountPer: value.ProductVariants[0] ? value.ProductVariants[0].discountPer : null,
            desc: value.desc,
            PubilshStatus: value.PubilshStatus,
            productCode: value.ProductVariants[0] ? value.ProductVariants[0].productCode : null,
            Available: value.ProductVariants[0] ? value.ProductVariants[0].Available : null,
            badges: 'new',
            referSizeChart: value.referSizeChart ? value.referSizeChart : "",
            material: value.material ? value.material : "",

            Attributes: Array.from(variantAttributes.entries()).map(([name, values]) => ({ name, values: Array.from(values) })),
          };
          arrData.push(dataList);
        }

        const startIndex = (page - 1) * limit;
        const paginatedData = arrData.slice(startIndex, startIndex + limit);

        const response = Util.getFormatedResponse(false, {
          count: arrData.length,
          pages: Math.ceil(arrData.length / limit),
          items: paginatedData,
        }, {
          message: 'Success',
        });

        return res.status(response.code).json(response);
      } else {
        const response = Util.getFormatedResponse(false, {
          message: 'No data found',
        });
        return res.status(response.code).json(response);
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
  ,

  async getProductDetail(req, res, next) {
    const { productId } = req.query;

    try {
      const product = await db.product.findOne({
        where: { id: productId },
        include: [
          {
            model: db.productphoto,
            attributes: ["id", "imgUrl"],
            order: [["createdAt", "DESC"]],
          },
          {
            model: db.ProductVariant,
            include: [
              {
                model: db.VariationOption, // Include VariationOption model
                attributes: ["name", "value"],
                as: "variationOptions", // Set the alias
              },
              {
                model: db.product,
                include: [
                  { model: db.category, attributes: ["name"], as: "maincat" },
                  { model: db.SubCategory, attributes: ["sub_name"] },
                  { model: db.ch_specification },
                  {
                    model: db.user,
                    as: "users",
                    attributes: ["id", "email"],
                    include: [
                      {
                        model: db.ch_seller_shopdetail,
                        attributes: ["id", "SELLERID", "SHOPNAME"],
                      },
                    ],
                  },
                  {
                    model: db.Seo_Details,
                    attributes: ["meta_title", "meta_keyword", "meta_desc"],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (product) {
        const imageList = product.productphotos.map((url) => url.imgUrl);
        const variants = product.ProductVariants;

        variants.forEach((variant) => {

        });

        const finalResult = {
          variants: variants.map((variant) => ({
            variantId: variant.id,
            productId: variant.productId,
            MainCat: variant.product.maincat.name,
            SubCat: variant.product.SubCategory.sub_name,
            Name: variant.productName,
            productCode: variant.productCode,
            Quantity: variant.qtyWarning,
            Available: variant.Available,
            StockType: variant.stockType,
            Cod: variant.COD,
            actualPrice: variant.actualPrice,
            netPrice: variant.netPrice,
            discount: variant.discount,
            discountPer: variant.discountPer,
            SortDesc: variant.shortDesc,
            LongDesc: variant.longDesc,
            HighLightDetail: variant.product.HighLightDetail,
            Specification: variant.product.ch_specifications,
            // Add Variation Options
            variationOptions: variant.variationOptions.map((option) => ({
              name: option.name,
              value: option.value,
            })),
          })),
          Thumbnail: product ? product.photo : "",
          referSizeChart: product.referSizeChart ? product.referSizeChart : "",
          material: product.material ? product.material : "",
          Photo: imageList ? imageList : [],
        };

        let response = Util.getFormatedResponse(false, finalResult, {
          message: "success",
        });
        res.status(response.code).json(response);
      } else {
        let response = Util.getFormatedResponse(false, {
          message: "No data found",
        });
        res.status(response.code).json(response);
      }
    } catch (err) {
      next(err);
    }
  },

  async getCategoryByProduct(req, res, next) {
    const { slug } = req.body;
    try {
      const result = {};

      result.maincat = await db.category.findOne({
        where: { slug: slug, status: "1" },
      });

      result.subcat = await db.SubCategory.findOne({
        where: { slug: slug },
      });

      if (result.maincat) {
        const products = await db.product.findAll({
          where: {
            categoryId: result.maincat.id,
            PubilshStatus: { [Op.eq]: "Published" },
          },
          include: [
            {
              model: db.ProductVariant,
              include: [
                { model: db.productphoto, attributes: ["id", "imgUrl"] },
              ],
            },
            { model: db.category, as: "maincat", attributes: ["id", "name"] },
            { model: db.SubCategory, attributes: ["id", "sub_name"] },
          ],
        });

        const arrData = products.map((value) => {
          return {
            productName: value.ProductVariants[0].productName,
            slug: value.ProductVariants[0].slug,
            Available: value.ProductVariants[0].Available,
            qty: value.ProductVariants[0].qty,
            unitSize: value.ProductVariants[0].unitSize,
            thumbnail: value.ProductVariants[0].thumbnail,
            gallery: value.ProductVariants[0].productphotos,
            youTubeUrl: value.ProductVariants[0].youTubeUrl,
            qtyWarning: value.ProductVariants[0].qtyWarning,
            shortDesc: value.ProductVariants[0].shortDesc,
            longDesc: value.ProductVariants[0].longDesc,
            distributorPrice: value.ProductVariants[0].distributorPrice,
            netPrice: value.ProductVariants[0].netPrice,
            discount: Math.round(
              value.ProductVariants[0].distributorPrice -
              value.ProductVariants[0].netPrice
            ),
            discountPer: Math.round(
              (value.ProductVariants[0].distributorPrice -
                value.ProductVariants[0].netPrice) /
              100
            ),
            maincat: value.maincat.name,
            subcat: value.SubCategory.sub_name,
            LocalDeiveryCharge: value.LocalDeiveryCharge,
            ZonalDeiveryCharge: value.ZonalDeiveryCharge,
            NationalDeiveryCharge: value.NationalDeiveryCharge,
            WarrantyType: value.WarrantyType,
            WarrantyPeriod: value.WarrantyPeriod,
            HighLightDetail: value.HighLightDetail,
            ShippingDays: value.ShippingDays,
            referSizeChart: value.referSizeChart ? value.referSizeChart : "",
            material: value.material ? value.material : "",

          };
        });

        return res
          .status(200)
          .json({ status: 200, success: true, data: arrData });
      }

      if (result.subcat) {
        const products = await db.product.findAll({
          where: { subCategoryId: result.subcat.id },
          include: [
            {
              model: db.ProductVariant,
              include: [
                { model: db.productphoto, attributes: ["id", "imgUrl"] },
              ],
            },
            { model: db.category, as: "maincat", attributes: ["id", "name"] },
            { model: db.SubCategory, attributes: ["id", "sub_name"] },
          ],
        });

        const arrData = products.map((value) => {
          return {
            productName: value.ProductVariants[0].productName,
            slug: value.ProductVariants[0].slug,
            Available: value.ProductVariants[0].Available,
            qty: value.ProductVariants[0].qty,
            unitSize: value.ProductVariants[0].unitSize,
            thumbnail: value.ProductVariants[0].thumbnail,
            gallery: value.ProductVariants[0].productphotos,
            youTubeUrl: value.ProductVariants[0].youTubeUrl,
            qtyWarning: value.ProductVariants[0].qtyWarning,
            shortDesc: value.ProductVariants[0].shortDesc,
            longDesc: value.ProductVariants[0].longDesc,
            distributorPrice: value.ProductVariants[0].distributorPrice,
            netPrice: value.ProductVariants[0].netPrice,
            discount: Math.round(
              value.ProductVariants[0].distributorPrice -
              value.ProductVariants[0].netPrice
            ),
            discountPer: Math.round(
              (value.ProductVariants[0].distributorPrice -
                value.ProductVariants[0].netPrice) /
              100
            ),
            maincat: value.maincat.name,
            subcat: value.SubCategory.sub_name,
            LocalDeiveryCharge: value.LocalDeiveryCharge,
            ZonalDeiveryCharge: value.ZonalDeiveryCharge,
            NationalDeiveryCharge: value.NationalDeiveryCharge,
            WarrantyType: value.WarrantyType,
            WarrantyPeriod: value.WarrantyPeriod,
            HighLightDetail: value.HighLightDetail,
            ShippingDays: value.ShippingDays,
          };
        });

        return res
          .status(200)
          .json({ status: 200, success: true, data: arrData });
      }
    } catch (err) {
      next(err);
    }
  },

  async getFilterAllProduct(req, res, next) {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? Math.max(1, parseInt(req.query.page)) : 1;
    const {
      filter_category,
      filter_SubCategory,
      filter_price,
      filter_attribute,
    } = req.query;

    const whereCond = {};
    const whereCond0 = [];

    // Apply filters

    if (filter_category) {
      const categories = filter_category.split(",");
      const categoryId = await db.category.findAll({
        attributes: ["id"],
        where: { slug: { [Op.in]: categories } },
        raw: true,
      });
      if (categoryId.length > 0) {
        whereCond0.push({ categoryId: { [Op.in]: categoryId.map(({ id }) => id) } });
      }
    }

    if (filter_SubCategory) {
      const [subCategory] = await db.SubCategory.findAll({
        attributes: ["id"],
        where: { sub_name: filter_SubCategory },
        raw: true,
      });
      if (subCategory) {
        whereCond0.push({ subCategoryId: subCategory.id });
      }
    }

    if (filter_attribute) {
      let filterAttributeArray;

      try {
        filterAttributeArray = JSON.parse(filter_attribute);
      } catch (error) {
        console.error('Error parsing filter_attribute:', error);
        const response = Util.getFormatedResponse(false, null, { message: 'Invalid filter attribute format' });
        return res.status(400).json(response);
      }

      if (Array.isArray(filterAttributeArray)) {
        const filterAttributes = filterAttributeArray.map(attribute => {
          const [name, value] = attribute.split(':');
          return { name, value };
        });

        // Construct an array of conditions for each attribute value
        const attributeAndConditions = filterAttributes.map(({ name, value }) => ({
          name,
          value: { [Op.like]: `%${value}%` } // Use like operator to match partial attribute values
        }));

        // Find products that match all specified attribute names and values
        const productsWithAttributeValues = await db.ProductVariant.findAll({
          attributes: ["productId"],
          include: [
            {
              model: db.VariationOption,
              as: 'variationOptions',
              where: { [Op.or]: attributeAndConditions },
            },
          ],
          group: ['ProductVariant.productId'],
          having: Sequelize.literal(`COUNT(DISTINCT CASE WHEN variationOptions.name IN (${filterAttributes.map(attr => `'${attr.name}'`).join(',')}) THEN variationOptions.name END) = ${filterAttributes.length}`),
          raw: true,
        });

        if (productsWithAttributeValues.length > 0) {
          // Extract product IDs from the filtered products
          const productIds = productsWithAttributeValues.map(({ productId }) => productId);

          // Add condition to include only products with matching IDs
          whereCond0.push({ id: { [Op.in]: productIds } });
        } else {
          const response = Util.getFormatedResponse(false, {
            count: 0,
            pages: 0,
            items: [],
          }, {
            message: 'No products found with the specified attribute values.',
          });
          return res.status(response.code).json(response);
        }

      } else {
        console.error('filter_attribute is not an array');
        const response = Util.getFormatedResponse(false, null, { message: 'Invalid filter attribute format' });
        return res.status(400).json(response);
      }

    }

    if (filter_price) {
      const price = filter_price.split("-");
      const startPrice = Number(price[0]);
      const endPrice = Number(price[1]);
      if (!isNaN(startPrice) && !isNaN(endPrice)) {
        whereCond.netPrice = { [Op.between]: [startPrice, endPrice] };
      }
    }

    whereCond0.push({ PubilshStatus: { [Op.eq]: 'Published' } });

    try {
      const products = await db.product.findAndCountAll({
        where: whereCond0,
        attributes: ["id", "categoryId", "subCategoryId", "desc", "name", "photo", "slug", 'brandId', 'PubilshStatus'],
        include: [
          {
            model: db.ProductVariant,
            where: whereCond,
            attributes: [
              "id",
              "productName",
              "qty",
              "thumbnail",
              "actualPrice",
              "netPrice",
              "discount",
              "discountPer",
              "productCode",
              "shortDesc",
              "longDesc",
              "Available",
            ],
            include: [
              {
                model: db.VariationOption,
                as: 'variationOptions',
                attributes: ['name', 'value'],
              },
              {
                model: db.productphoto,
                attributes: ["id", "imgUrl"]
              }
            ],
          },
          { model: db.category, as: 'maincat', attributes: ['id', 'name'] },
          { model: db.SubCategory, attributes: ['id', 'sub_name'] },
        ],
        order: [['id', 'DESC']],
      });

      if (products.count > 0) {
        const arrData = products.rows.map(value => ({
          id: value.id,
          variantId: value.ProductVariants[0] ? value.ProductVariants[0].id : null,
          category_name: value.maincat.name,
          subCategorie_name: value.SubCategory.sub_name,
          Name: value.name,
          PublishStatus: value.PubilshStatus,
          HighLightDetail: value.HighLightDetail,
          slug: value.slug,
          Thumbnail: value.photo,
          referSizeChart: value.referSizeChart ? value.referSizeChart : "",
          material: value.material ? value.material : "",
          actualPrice: value.ProductVariants[0] ? value.ProductVariants[0].actualPrice : null,
          netPrice: value.ProductVariants[0] ? value.ProductVariants[0].netPrice : null,
          discount: value.ProductVariants[0] ? value.ProductVariants[0].discount : null,
          discountPer: value.ProductVariants[0] ? value.ProductVariants[0].discountPer : null,
          shortDesc: value.ProductVariants[0] ? value.ProductVariants[0].shortDesc : null,
          longDesc: value.ProductVariants[0] ? value.ProductVariants[0].longDesc : null,
          PubilshStatus: value.PubilshStatus,
          productCode: value.ProductVariants[0] ? value.ProductVariants[0].productCode : null,
          badges: 'new',
          Available: value.ProductVariants[0] ? value.ProductVariants[0].Available : null,
          Attributes: value.ProductVariants.reduce((acc, variant) => {
            if (variant.variationOptions && variant.variationOptions.length > 0) {
              variant.variationOptions.forEach(option => {
                const existingIndex = acc.findIndex(item => item.name === option.name);
                if (existingIndex !== -1) {
                  // Check if the value is already present
                  if (!acc[existingIndex].values.includes(option.value)) {
                    acc[existingIndex].values.push(option.value);
                  }
                } else {
                  acc.push({ name: option.name, values: [option.value] });
                }
              });
            }
            return acc;
          }, [])

        }));

        const startIndex = (page - 1) * limit;
        const paginatedData = arrData.slice(startIndex, startIndex + limit);

        const response = Util.getFormatedResponse(false, {
          count: arrData.length,
          pages: Math.ceil(arrData.length / limit),
          items: paginatedData,
        }, {
          message: 'Success',
        });

        return res.status(response.code).json(response);
      } else {
        const response = Util.getFormatedResponse(false, {
          count: 0,
          pages: 0,
          items: [],
        }, {
          message: 'Products not found',
        });
        return res.status(response.code).json(response);
      }
    } catch (err) {
      console.log("catch error", err);
      throw new RequestError(err);
    }
  },

  async getFilterAllCategoryBrand(req, res, next) {
    const { queryString } = req.query;
    const query = {};
    query.where = {};
    try {
      let search = "%%";
      if (queryString) {
        search = `%${queryString}%`;
      }

      const result = {};

      // Fetch main categories and associated subcategories
      result.maincat = await db.category.findAll({
        attributes: ["id", "name", "slug", "title", "keyword", "desc"],
        where: {
          [Op.or]: [
            { slug: { [Op.like]: search } },
            { name: { [Op.like]: search } },
          ],
        },
        include: [{ model: db.SubCategory, attributes: ["id", "sub_name", "slug"] }],
      });

      // Fetch subcategories and associated subchild categories
      result.subcat = await db.SubCategory.findAll({
        where: {
          [Op.or]: [
            { slug: { [Op.like]: search } },
            { sub_name: { [Op.like]: search } },
          ],
        },
        include: [{ model: db.SubChildCategory, attributes: ["id", "name", "slug"] }],
      });

      // Set up query for fetching products
      query.include = [{ model: db.ProductVariant }];

      let product;
      if (result.maincat.length > 0) {
        const maincatIds = result.maincat.map(cat => cat.id);
        query.where.categoryId = { [Op.in]: maincatIds };
        query.where.PubilshStatus = "Published";
        product = await db.product.findAll({ ...query });
      } else if (result.subcat.length > 0) {
        const subcatIds = result.subcat.map(cat => cat.id);
        query.where.subcategoryId = { [Op.in]: subcatIds };
        query.where.PubilshStatus = "Published";
        product = await db.product.findAll({ ...query });
      }

      // Prepare filters
      const filters = [
        {
          type: "category",
          slug: "category",
          name: "Categories",
          checkVal: result.maincat.length,
          items: result.maincat,
        },
        {
          type: "range",
          slug: "price",
          name: "Price",
          min: 0,
          max: 100000,
          value: [0, 100000],
        },
      ];

      // Prepare response
      const response = Util.getFormatedResponse(false, filters, { message: "Success" });
      res.status(response.code).json(response);
    } catch (error) {
      console.error('Error in getFilterAllCategoryBrand:', error);
      const response = Util.getFormatedResponse(true, null, { message: "Error retrieving filter data" });
      res.status(response.code).json(response);
    }
  },

  // Search Query
  async searchProducts(req, res) {
    const { query } = req.query;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? Math.max(1, parseInt(req.query.page)) : 1;

    try {
      const searchWords = query.split(" ");

      const productResults = await db.product.findAndCountAll({
        where: {
          [Op.and]: [
            { PubilshStatus: 'Published' }, // Filter by 'Published' status
            {
              [Op.or]: searchWords.map((word) => ({
                [Op.or]: [
                  { name: { [Op.substring]: word } },
                  { slug: { [Op.substring]: word } },
                  { '$ProductVariants.productName$': { [Op.substring]: word } },
                  { '$ProductVariants.slug$': { [Op.substring]: word } },
                  { '$ProductVariants.shortDesc$': { [Op.substring]: word } },
                  { '$ProductVariants.longDesc$': { [Op.substring]: word } },
                  { '$ProductVariants.netPrice$': { [Op.substring]: word } },
                  { '$ProductVariants.actualPrice$': { [Op.substring]: word } },
                ],
              })),
            },
          ],
        },
        include: [
          {
            model: db.ProductVariant,
            attributes: [
              "id",
              "productName",
              "qty",
              "thumbnail",
              "actualPrice",
              "netPrice",
              "discount",
              "discountPer",
              "productCode",
            ],
            include: [
              {
                model: db.VariationOption,
                as: 'variationOptions',
                attributes: ["name", "value"],
              },
              {
                model: db.productphoto,
                attributes: ["id", "imgUrl"]
              }
            ],
          },
          {
            model: db.category,
            as: 'maincat',
            attributes: ['id', 'name'],
          },
          {
            model: db.SubCategory,
            attributes: ['id', 'sub_name'],
          },
        ],
        order: [['id', 'DESC']],
        subQuery: false,
      });




      if (productResults.count > 0) {
        const arrData = [];

        for (const value of productResults.rows) {
          const dataList = {
            id: value.id,
            variantId: value.ProductVariants[0] ? value.ProductVariants[0].id : null,
            category_name: value.maincat.name,
            subCategorie_name: value.SubCategory.sub_name,
            Name: value.name,
            PublishStatus: value.PubilshStatus,
            HighLightDetail: value.HighLightDetail,
            slug: value.slug,
            Thumbnail: value.photo,
            referSizeChart: value.referSizeChart ? value.referSizeChart : "",
            material: value.material ? value.material : "",
            actualPrice: value.ProductVariants[0] ? value.ProductVariants[0].actualPrice : null,
            netPrice: value.ProductVariants[0] ? value.ProductVariants[0].netPrice : null,
            discount: value.ProductVariants[0] ? value.ProductVariants[0].discount : null,
            discountPer: value.ProductVariants[0] ? value.ProductVariants[0].discountPer : null,
            desc: value.desc,
            PubilshStatus: value.PubilshStatus,
            productCode: value.ProductVariants[0] ? value.ProductVariants[0].productCode : null,
            badges: 'new',
            Attributes: value.ProductVariants.reduce((acc, variant) => {
              if (variant.variationOptions && variant.variationOptions.length > 0) {
                variant.variationOptions.forEach(option => {
                  const existingIndex = acc.findIndex(item => item.name === option.name);
                  if (existingIndex !== -1) {
                    // Check if the value is already present
                    if (!acc[existingIndex].values.includes(option.value)) {
                      acc[existingIndex].values.push(option.value);
                    }
                  } else {
                    acc.push({ name: option.name, values: [option.value] });
                  }
                });
              }
              return acc;
            }, [])
          };
          arrData.push(dataList);
        }

        const startIndex = (page - 1) * limit;
        const paginatedData = arrData.slice(startIndex, startIndex + limit);

        const response = Util.getFormatedResponse(false, {
          count: arrData.length,
          pages: Math.ceil(arrData.length / limit),
          items: paginatedData,
        }, {
          message: 'Success',
        });

        return res.status(response.code).json(response);
      } else {
        const response = Util.getFormatedResponse(false, {
          message: 'No data found',
        });
        return res.status(response.code).json(response);
      }
    } catch (err) {
      console.error(err);
      const response = Util.getFormatedResponse(false, { message: err.message });
      return res.status(response.code).json(response);
    }
  },

  async getAutoSuggestList(req, res, next) {
    let { query } = req.query;
    let search = "%";
    if (query) {
      search = query + "%";
    }
    try {
      let result = {};
      result.tag = await db.tag.findAll({
        attributes: [
          [Sequelize.fn("DISTINCT", Sequelize.col("title")), "title"],
        ],
        where: { title: { [Op.like]: search } },
      });
      result.maincat = await db.category.findAll({
        where: { name: { [Op.like]: search }, status: "1" },
      });
      result.subcat = await db.SubCategory.findAll({
        where: { sub_name: { [Op.like]: search } },
      });
      result.subchild = await db.SubChildCategory.findAll({
        where: { name: { [Op.like]: search } },
      });
      result.varient = await db.ProductVariant.findAll({
        where: { productName: { [Op.like]: search } },
        include: [
          {
            model: db.product,
            attributes: ["id"],
            where: {
              SellerId: { [Op.ne]: null },
              PubilshStatus: { [Op.eq]: "Published" },
            },
          },
        ],
      });
      var newList = [];
      if (
        (result.tag && result.tag.length) ||
        (result.maincat && result.maincat.length) ||
        (result.subcat && result.subcat.length) ||
        (result.subchild && result.subchild.length) ||
        // (result.brand && result.brand.length) ||
        result.varient
      ) {
        for (let i = 0; i < result.tag.length; i++) {
          const assignee = result.tag[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.title,
            slug: assignee.title,
          };
          newList.push(assigneeData);
        }
        for (let i = 0; i < result.maincat.length; i++) {
          const assignee = result.maincat[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.name,
            slug: assignee.slug,
            thumbnail: assignee.thumbnail,
          };
          newList.push(assigneeData);
        }
        for (let i = 0; i < result.subcat.length; i++) {
          const assignee = result.subcat[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.sub_name,
            slug: assignee.slug,
          };
          newList.push(assigneeData);
        }
        for (let i = 0; i < result.subchild.length; i++) {
          const assignee = result.subchild[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.name,
            slug: assignee.slug,
          };
          newList.push(assigneeData);
        }
        for (let i = 0; i < result.varient.length; i++) {
          const assignee = result.varient[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.productName,
            slug: assignee.slug,
            thumbnail: assignee.thumbnail,
          };
          newList.push(assigneeData);
        }
        var response = Util.getFormatedResponse(false, newList, {
          message: "Success",
        });
        res.status(response.code).json(response);
      } else {
        let response = Util.getFormatedResponse(true, {
          message: "No data found",
        });
        res.status(response.code).json(response);
      }
    } catch (err) {
      console.log(err);
      throw new RequestError(err);
    }
  },

  async relatedProduct(req, res, next) {
    const { productId, slug } = req.query;
    // console.log("Ram")
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? Math.max(1, parseInt(req.query.page)) : 1;
    const query = {};
    query.where = {};
    query.limit = limit;
    query.order = [["id", "DESC"]];
    query.attributes = [
      "id",
      "name",
      "slug",
      "SellerId",
      "PubilshStatus",
      "categoryId",
      "subCategoryId",
      "childCategoryId",
    ];
    query.include = [
      {
        model: db.ProductVariant,
        attributes: [
          "id",
          "productName",
          "qty",
          "thumbnail",
          "distributorPrice",
          "netPrice",
          "discount",
          "discountPer",
        ],
        include: [{ model: db.productphoto, attributes: ["id", "imgUrl"] }],
      },
    ];
    query.where.PubilshStatus = {
      [Op.eq]: "Published",
    };
    try {
      const product = await db.product.findOne({
        where: {
          id: productId,
          slug: slug,
          SellerId: { [Op.ne]: null },
          PubilshStatus: { [Op.eq]: "Published" },
        },
      });

      if (product && product.id) {
        const finalResult = await db.product.findAndCountAll({
          WHERE: query,
          include: [
            {
              model: db.ProductVariant,
              include: [

              ],
            },
            { model: db.category, as: 'maincat', attributes: ['id', 'name'] },
            { model: db.SubCategory, attributes: ['id', 'sub_name'] },
          ],
          order: [['id', 'DESC']],
        });

        const arrData = [];
        for (const value of finalResult.rows) {

          for (const variant of value.ProductVariants) {

          }

          const dataList = {
            id: value.id,
            variantId: value.ProductVariants[0] ? value.ProductVariants[0].id : null,
            category_name: value.maincat.name,
            subCategorie_name: value.SubCategory.sub_name,
            Name: value.name,
            referSizeChart: value.referSizeChart ? value.referSizeChart : "",
            material: value.material ? value.material : "",
            PublishStatus: value.PubilshStatus,
            HighLightDetail: value.HighLightDetail,
            slug: value.slug,
            Thumbnail: value.photo,
            actualPrice: value.ProductVariants[0] ? value.ProductVariants[0].actualPrice : null,
            netPrice: value.ProductVariants[0] ? value.ProductVariants[0].netPrice : null,
            discount: value.ProductVariants[0] ? value.ProductVariants[0].discount : null,
            discountPer: value.ProductVariants[0] ? value.ProductVariants[0].discountPer : null,
            desc: value.desc,
            PubilshStatus: value.PubilshStatus,
            productCode: value.ProductVariants[0] ? value.ProductVariants[0].productCode : null,
            badges: 'new',
          };
          arrData.push(dataList);
        }
        // console.log("arrData", arrData)

        const startIndex = (page - 1) * limit;
        const paginatedData = arrData.slice(startIndex, startIndex + limit);

        const response = Util.getFormatedResponse(false, {
          count: arrData.length,
          pages: Math.ceil(arrData.length / limit),
          items: paginatedData,
        }, {
          message: 'Success',
        });

        return res.status(response.code).json(response);
      }
      else {
        var response = Util.getFormatedResponse(false, {
          message: "No data found",
        });
        res.status(response.code).json(response);
      }
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async getPopularCategory(req, res, next) {
    try {
      await db.category.findAll().then((list) => {
        let response = Util.getFormatedResponse(false, list, {
          message: "Success",
        });
        res.status(response.code).json(response);
      });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async createAddress(req, res, next) {
    try {
      const { fullName, phone, zoneName, city, shippingAddress } = req.body;
      db.customer
        .findOne({
          where: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
          },
        })
        .then((customer) => {
          if (customer) {
            return db.Address.create({
              custId: req.user.id,
              fullname: fullName,
              phone: phone,
              city: city,
              states: zoneName,
              shipping: shippingAddress,
            });
          } else {
            var response = Util.getFormatedResponse(false, {
              message: "No found data",
            });
            res.status(response.code).json(response);
          }
        })
        .then((re) => {
          var response = Util.getFormatedResponse(false, {
            message: "Success",
          });
          res.status(response.code).json(response);
        })
        .catch((err) => {
          var response = Util.getFormatedResponse(false, {
            message: err,
          });
          res.status(response.code).json(response);
        });
    } catch (err) {
      var response = Util.getFormatedResponse(false, {
        message: err,
      });
      res.status(response.code).json(response);
    }
  },

  async orderHistory(req, res, next) {
    const arrData = [];
    const limit = parseInt(req.body.limit);
    const page = Math.max(1, parseInt(req.body.page));
    const query = {};
    query.where = {};

    query.where.custId = req.user.id;
    query.attributes = ["id", "number", "grandtotal", "createdAt"];
    query.order = [["createdAt", "DESC"]];
    query.include = [
      {
        model: db.Cart_Detail,
        attributes: ["id", "qty", "status", "deliveryDate"],
        include: [
          {
            model: db.ProductVariant,
            as: "varient",
            attributes: ["id", "productId", "productName", "thumbnail"],
          },
        ],
      },
    ];
    try {
      db.Order.findAndCountAll(query).then((list) => {
        if (list) {
          list.rows.forEach((value) => {
            const dataList = {
              id: value.id,
              OrderNo: value.number,
              OrderDate: value.createdAt,
              Status: value.name,
              Total: value.grandtotal,
              count: value.Cart_Details.length,
              Items: value.Cart_Details,
            };
            arrData.push(dataList);
          });

          let pages = Math.ceil(list.count / limit);
          const finalResult = {
            count: list.count,
            pages: pages,
            items: arrData,
          };
          var response = Util.getFormatedResponse(false, finalResult, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          var response = Util.getFormatedResponse(false, {
            message: "No found data",
          });
          res.status(response.code).json(response);
        }
      });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async getReviewList(req, res) {
    try {
      const { productId, review, rating, personGmail } = req.body;

      // console.log("productId", productId)

      // If the request body is not empty, insert the review into the database
      if (review && rating && personGmail) {
        // Create the new review
        await db.Review.create({
          review,
          rating,
          productId,
          personGmail,
        });
      }

      // Get the count of reviews for the product
      const reviewCount = await db.Review.count({ where: { productId } });

      // If the number of reviews exceeds 10, delete the oldest ones
      if (reviewCount > 10) {
        const oldestReviews = await db.Review.findAll({
          where: { productId },
          order: [['createdAt', 'ASC']],
          limit: reviewCount - 10, // Get the number of reviews to be deleted
        });

        // Delete the oldest reviews
        for (const oldestReview of oldestReviews) {
          await oldestReview.destroy();
        }
      }

      const reviewList = await db.Review.findAll({ where: { productId } });

      // console.log("List", reviewList)

      return res.status(201).json(reviewList); // Return the reviews array in the response

    } catch (error) {
      // console.error(error);
      return res.status(500).json({ error: 'An error occurred while adding or fetching the reviews.' });
    }
  },

  async getAllProductList(req, res, next) {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? Math.max(1, parseInt(req.query.page)) : 1;

    try {
      const products = await db.product.findAndCountAll({
        where: {
          PubilshStatus: { [Op.eq]: 'Published' },
        },
        include: [
          {
            model: db.productphoto,
            attributes: ['id', 'imgUrl'],
            order: [['createdAt', 'DESC']],
          },
          {
            model: db.ProductVariant,
            include: [
              {
                model: db.VariationOption,
                as: 'variationOptions', // Use the correct alias here
                attributes: ['name', 'value'],
              },
            ],
          },
          { model: db.category, as: 'maincat', attributes: ['id', 'name'] },
          { model: db.SubCategory, attributes: ['id', 'sub_name'] },
        ],
        order: [['id', 'DESC']],
      });

      if (products.count > 0) {
        const arrData = [];

        for (const value of products.rows) {
          const imageList = value.productphotos.map((url) => url.imgUrl);

          // Moving the definition outside the loop
          const variantAttributes = new Map();

          for (const variant of value.ProductVariants) {
            for (const option of variant.variationOptions) {
              if (!variantAttributes.has(option.name)) {
                variantAttributes.set(option.name, new Set());
              }
              variantAttributes.get(option.name).add(option.value);
            }
          }

          const dataList = {
            id: value.id,
            variantId: value.ProductVariants[0] ? value.ProductVariants[0].id : null,
            category_name: value.maincat.name,
            subCategorie_name: value.SubCategory.sub_name,
            Name: value.name,
            PublishStatus: value.PubilshStatus,
            HighLightDetail: value.HighLightDetail,
            slug: value.slug,
            Thumbnail: value.photo,
            referSizeChart: value.referSizeChart ? value.referSizeChart : "",
            material: value.material ? value.material : "",
            actualPrice: value.ProductVariants[0] ? value.ProductVariants[0].actualPrice : null,
            netPrice: value.ProductVariants[0] ? value.ProductVariants[0].netPrice : null,
            discount: value.ProductVariants[0] ? value.ProductVariants[0].discount : null,
            discountPer: value.ProductVariants[0] ? value.ProductVariants[0].discountPer : null,
            desc: value.desc,
            PubilshStatus: value.PubilshStatus,
            productCode: value.ProductVariants[0] ? value.ProductVariants[0].productCode : null,
            badges: 'new',
            Available: value.ProductVariants[0] ? value.ProductVariants[0].Available : null,
            Photo: imageList,
            Attributes: Array.from(variantAttributes.entries()).map(([name, values]) => ({ name, values: Array.from(values) })),
          };
          arrData.push(dataList);
        }

        const startIndex = (page - 1) * limit;
        const paginatedData = arrData.slice(startIndex, startIndex + limit);

        const response = Util.getFormatedResponse(false, {
          count: arrData.length,
          pages: Math.ceil(arrData.length / limit),
          items: paginatedData,
        }, {
          message: 'Success',
        });

        return res.status(response.code).json(response);
      } else {
        const response = Util.getFormatedResponse(false, {
          message: 'No data found',
        });
        return res.status(response.code).json(response);
      }
    } catch (err) {
      next(err);
    }
  },


  async orderProductList(req, res, next) {
    const arrData = [];
    const query = {};
    query.where = {};
    query.where.orderId = req.body.orderId;
    query.attributes = ["id", "qty", "status", "deliveryDate"];
    query.order = [["createdAt", "DESC"]];
    query.include = [
      {
        model: db.ProductVariant,
        as: "varient",
        attributes: [
          "id",
          "productId",
          "productName",
          "thumbnail",
          "unitSize",
          "netPrice",
        ],
        // include: [
        //   { model: db.ch_brand_detail, as: "brand", attributes: ["name"] },
        // ],
      },
    ];
    try {
      db.Cart_Detail.findAll(query).then((list) => {
        if (list) {
          list.forEach((value) => {
            const dataList = {
              id: value.varient ? value.varient.id : null,
              thumbnail: value.varient ? value.varient.thumbnail : null,
              name: value.varient ? value.varient.productName : null,
              qty: value.qty,
              size: value.varient ? value.varient.unitSize : null,
              total: value.varient ? value.qty * value.varient.netPrice : null,
              status: value.status,
            };
            arrData.push(dataList);
          });
          var response = Util.getFormatedResponse(false, arrData, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          var response = Util.getFormatedResponse(false, {
            message: "No found data",
          });
          res.status(response.code).json(response);
        }
      });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async orderProductDetail(req, res, next) {
    const query = {};
    query.where = {};

    query.where = {
      [Op.and]: [
        {
          orderId: req.body.orderId,
        },
        {
          varientId: req.body.varientId,
        },
      ],
    };
    query.attributes = ["id", "qty", "status", "deliveryDate"];
    query.order = [["createdAt", "DESC"]];
    query.include = [
      {
        model: db.ProductVariant,
        as: "varient",
        attributes: [
          "id",
          "productId",
          "productName",
          "thumbnail",
          "unitSize",
          "netPrice",
        ],
        // include: [
        //   { model: db.ch_brand_detail, as: "brand", attributes: ["name"] },
        // ],
      },
      { model: db.Address, as: "address" },
    ];
    try {
      db.Cart_Detail.findOne(query).then((list) => {
        if (list) {
          const dataList = {
            id: list.id,
            thumbnail: list.varient.thumbnail,
            name: list.varient.productName,
            qty: list.qty,
            size: list.varient.unitSize,
            total: list.qty * list.varient.netPrice,
            // brand: list.varient.brand.name,
            status: list.status,
            deliveryDate: list.deliveryDate,
            customerName: list.address.fullname,
            phone: list.address.phone,
            city: list.address.city,
            zone: list.address.states,
            shipping: list.address.shipping,
          };
          var response = Util.getFormatedResponse(false, dataList, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          var response = Util.getFormatedResponse(false, {
            message: "No found data",
          });
          res.status(response.code).json(response);
        }
      });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async orderdProductCancel(req, res, next) {
    const { varientId, issue, comment } = req.body;
    try {
      db.Cart_Detail.findOne({
        where: { varientId: varientId },
      })
        .then(async (list) => {
          const t = await db.sequelize.transaction();
          if (list) {
            try {
              await db.Order_Details_Status.create(
                {
                  orderId: list.orderId,
                  custId: req.user.id,
                  productId: list.varientId,
                  status: 0,
                  issue: issue,
                  comment: comment,
                },
                { transaction: t }
              );

              await db.Cart_Detail.update(
                {
                  status: "cancelRequest",
                  deliveryDate: new Date(),
                },
                { where: { id: list.id } }
              );

              return t.commit();
            } catch (err) {
              await t.rollback();
              throw new RequestError(err);
            }
          }
        })
        .then((success) => {
          var response = Util.getFormatedResponse(false, {
            message: "Success",
          });
          res.status(response.code).json(response);
        });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Unfortuntely something is wrong" });
    }
  },

  async customizationPage(req, res, next) {
    // console.log("Ram", req.body);
    try {
      const customization = await db.customization.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        message: req.body.message,
      });
      res.status(201).json({ success: true, customization });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Unfortunately something is wrong" });
    }
  },

  async customizationList(req, res, next) {
    // console.log("Ram", req.body);
    try {
      const customization = await db.customization.findAll();
      res.status(201).json({ success: true, customization });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Unfortunately something is wrong" });
    }
  },

  async allEvent(req, res) {
    try {
      const { query, ...filters } = req.query;
      const limit = parseInt(req.query.limit) || 10;
      const page = Math.max(1, parseInt(req.query.page)) || 1;
      const whereCond0 = {
        PubilshStatus: 'Published',

      };
      const whereCond = {};
      if (query) {
        const searchWords = query ? query.split(' ') : [];
        const productResults = await db.product.findAndCountAll({
          where: {
            [Op.or]: [
              ...searchWords.map((word) => ({
                [Op.or]: [
                  { name: { [Op.like]: `%${word}%` } },
                  { slug: { [Op.like]: `%${word}%` } },
                ],
              })),

              ...searchWords.map((word) => ({
                '$ProductVariants.slug$': { [Op.like]: `%${word}%` },
              })),

              ...searchWords.map((word) => ({
                '$ProductVariants.productName$': { [Op.like]: `%${word}%` },
              })),

              ...searchWords.map((word) => ({
                '$ProductVariants.netPrice$': { [Op.like]: `%${word}%` },
              })),

              ...searchWords.map((word) => ({
                '$ProductVariants.actualPrice$': { [Op.like]: `%${word}%` },
              })),

              ...searchWords.map((word) => ({
                '$ProductVariants.shortDesc$': { [Op.like]: `%${word}%` },
              })),

              ...searchWords.map((word) => ({
                '$ProductVariants.longDesc$': { [Op.like]: `%${word}%` },
              })),

              ...searchWords.map((word) => ({
                '$maincat.slug$': { [Op.substring]: word },
              })),

              ...searchWords.map((word) => ({
                '$maincat.name$': { [Op.substring]: word },
              })),

              ...searchWords.map((word) => ({
                '$SubCategory.slug$': { [Op.substring]: word },
              })),

              ...searchWords.map((word) => ({
                '$SubCategory.sub_name$': { [Op.substring]: word },
              })),
            ],

          },

          include: [
            {
              model: db.ProductVariant,
              attributes: [
                "id",
                "productName",
                "qty",
                "thumbnail",
                "actualPrice",
                "netPrice",
                "discount",
                "discountPer",
                "productCode",
              ],

              include: [
                {
                  model: db.productphoto,
                  attributes: ["id", "imgUrl"]
                }
              ],
            },
            {
              model: db.category,
              as: 'maincat',
              attributes: ['id', 'name'],
            },
            {
              model: db.SubCategory,
              attributes: ['id', 'sub_name'],
            },
          ],
          order: [['id', 'DESC']],
        });

        if (productResults.count > 0) {
          const arrData = [];
          for (const value of productResults.rows) {

            for (const variant of value.ProductVariants) {

            }

            const dataList = {
              id: value.id,
              variantId: value.ProductVariants[0] ? value.ProductVariants[0].id : null,
              category_name: value.maincat.name,
              subCategorie_name: value.SubCategory.sub_name,
              Name: value.name,
              PublishStatus: value.PubilshStatus,
              HighLightDetail: value.HighLightDetail,
              slug: value.slug,
              Thumbnail: value.photo,
              actualPrice: value.ProductVariants[0] ? value.ProductVariants[0].actualPrice : null,
              netPrice: value.ProductVariants[0] ? value.ProductVariants[0].netPrice : null,
              discount: value.ProductVariants[0] ? value.ProductVariants[0].discount : null,
              discountPer: value.ProductVariants[0] ? value.ProductVariants[0].discountPer : null,
              desc: value.desc,
              PubilshStatus: value.PubilshStatus,
              productCode: value.ProductVariants[0] ? value.ProductVariants[0].productCode : null,
              badges: 'new',

            };
            arrData.push(dataList);
          }

          const startIndex = (page - 1) * limit;
          const paginatedData = arrData.slice(startIndex, startIndex + limit);
          const response = Util.getFormatedResponse(false, {
            count: arrData.length,
            pages: Math.ceil(arrData.length / limit),
            items: paginatedData,

          }, {
            message: 'Success',
          });

          return res.status(response.code).json(response);
        } else {
          const response = Util.getFormatedResponse(false, {
            message: 'No data found',
          });
          return res.status(response.code).json(response);
        }

      } else {

        if (filters.filter_category) {
          const categories = filters.filter_category.split(',');
          const categoryIds = await db.category.findAll({
            attributes: ['id'],
            where: { slug: { [Op.in]: categories } },
            raw: true,
          });
          whereCond0.categoryId = { [Op.in]: categoryIds.map(({ id }) => id) };
        }

        if (filters.filter_SubCategory) {
          const subCategories = filters.filter_SubCategory.split(",");
          const subCategoryId = await db.SubCategory.findAll({
            attributes: ["id"],
            where: { slug: { [Op.in]: subCategories } },
            raw: true,
          });

          if (subCategoryId.length > 0) {
            whereCond0.subCategoryId = { [Op.in]: subCategoryId.map(({ id }) => id) };
          }
        }

        if (filters.filter_price) {
          const price = filters.filter_price.split("-");
          const startPrice = Number(price[0]);
          const endPrice = Number(price[1]);
          if (!isNaN(startPrice) && !isNaN(endPrice)) {
            whereCond['$ProductVariants.netPrice$'] = { [Op.between]: [startPrice, endPrice] };
          }
        }
      }

      const productResults = await db.product.findAndCountAll({
        where: whereCond0,
        include: [
          {
            model: db.ProductVariant,
            where: whereCond,
            as: 'ProductVariants',
            include: [

            ],
          },
          { model: db.category, as: 'maincat', attributes: ['id', 'name'] },
          { model: db.SubCategory, attributes: ['id', 'sub_name'] },
        ],

        order: [['id', 'DESC']],
        limit,
        offset: (page - 1) * limit,
      });

      const formattedProducts = await Promise.all(productResults.rows.map(async (value) => {

        for (const variant of value.ProductVariants) {

        }

        return {
          id: value.id,
          variantId: value.ProductVariants[0] ? value.ProductVariants[0].id : null,
          category_name: value.maincat.name,
          subCategorie_name: value.SubCategory.sub_name,
          Name: value.name,
          PublishStatus: value.PubilshStatus,
          HighLightDetail: value.HighLightDetail,
          slug: value.slug,
          Thumbnail: value.photo,
          actualPrice: value.ProductVariants[0] ? value.ProductVariants[0].actualPrice : null,
          netPrice: value.ProductVariants[0] ? value.ProductVariants[0].netPrice : null,
          discount: value.ProductVariants[0] ? value.ProductVariants[0].discount : null,
          discountPer: value.ProductVariants[0] ? value.ProductVariants[0].discountPer : null,
          desc: value.desc,
          PubilshStatus: value.PubilshStatus,
          productCode: value.ProductVariants[0] ? value.ProductVariants[0].productCode : null,
          badges: 'new',

        };

      }));
      const response = Util.getFormatedResponse(false, {
        count: productResults.count,
        pages: Math.ceil(productResults.count / limit),
        items: formattedProducts,
      }, {
        message: 'Success',
      });

      return res.status(response.code).json(response);
    } catch (err) {
      console.error(err);
      const response = Util.getFormatedResponse(false, { message: err.message });
      return res.status(response.code).json(response);
    }
  }

};




