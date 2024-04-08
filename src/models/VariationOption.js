// models/variationoption.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class VariationOption extends Model {
        static associate(models) {
            VariationOption.belongsTo(models.ProductVariant, {
                foreignKey: 'productVariantId',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            });
        }
    };
    VariationOption.init({
        name: DataTypes.STRING,
        value: DataTypes.STRING,
        productVariantId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'VariationOption',
    });
    return VariationOption;
};
