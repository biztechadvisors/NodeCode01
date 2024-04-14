"use strict";
module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define(
    "ProductVariant",
    {
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      actualPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      distributorPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      marginPer: {
        type: DataTypes.INTEGER,
        // allowNull:false,
      },
      buyerPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      sellerPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      unitSize: {
        type: DataTypes.INTEGER,
      },
      qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      discountPer: {
        type: DataTypes.INTEGER,
      },
      discount: {
        type: DataTypes.INTEGER,
      },
      marginPrice: {
        type: DataTypes.INTEGER,
      },
      total: {
        type: DataTypes.INTEGER,
      },
      netPrice: {
        type: DataTypes.INTEGER,
      },
      productName: {
        type: DataTypes.STRING,
      },
      slug: {
        type: DataTypes.STRING,
      },
      Available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      productCode: {
        type: DataTypes.STRING(10),
        unique: true,
      },

      brandId: {
        type: DataTypes.INTEGER,
      },
      longDesc: {
        type: DataTypes.TEXT,
      },
      shortDesc: {
        type: DataTypes.TEXT,
      },
      thumbnail: {
        type: DataTypes.TEXT,
      },
      youTubeUrl: {
        type: DataTypes.TEXT,
      },
      stockType: {
        type: DataTypes.BOOLEAN,
      },
      internationalWarranty: {
        type: DataTypes.INTEGER,
      },
      refundable: {
        type: DataTypes.BOOLEAN,
      },
      qtyWarning: {
        type: DataTypes.INTEGER,
      },
      COD: {
        type: DataTypes.BOOLEAN,
      },
    },
    {}
  );
  ProductVariant.associate = function (models) {
    // associations can be defined here
    models.ProductVariant.belongsTo(models.product, {
      foreignKey: "productId",
    });
    models.ProductVariant.hasMany(models.productphoto, {
      foreignKey: "varientId",
    });

    models.ProductVariant.hasMany(models.VariationOption, {
      foreignKey: 'productVariantId',
      as: 'variationOptions', // This is optional
    });
  };
  return ProductVariant;
};
