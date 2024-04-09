// models/variationOption.js

'use strict';
module.exports = (sequelize, DataTypes) => {
    const VariationOption = sequelize.define('VariationOption', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false
        },
        productVariantId: {
            type: DataTypes.INTEGER,
            allowNull: false, // Adjust this based on your requirement
        }
    }, {});

    VariationOption.associate = function (models) {
        VariationOption.belongsTo(models.ProductVariant, {
            foreignKey: 'productVariantId',
            onDelete: 'CASCADE'
        });
    };

    return VariationOption;
};
