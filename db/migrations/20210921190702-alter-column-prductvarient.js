'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the column 'SellerId' already exists in the 'products' table
      const columns = await queryInterface.describeTable('products');
      if ('SellerId' in columns) {
        console.log('Column "SellerId" already exists in the table "products". Skipping migration.');
      } else {
        // If the column 'SellerId' doesn't exist, add it to the 'products' table
        await queryInterface.addColumn('products', 'SellerId', {
          type: Sequelize.INTEGER,
          allowNull: true
        });

        // Add other columns to the 'products' table
        await queryInterface.addColumn('products', 'LocalDeliveryCharge', {
          type: Sequelize.DOUBLE,
          allowNull: true
        });
        await queryInterface.addColumn('products', 'ZonalDeliveryCharge', {
          type: Sequelize.DOUBLE,
          allowNull: true
        });
        await queryInterface.addColumn('products', 'NationalDeliveryCharge', {
          type: Sequelize.DOUBLE,
          allowNull: true
        });
        await queryInterface.addColumn('products', 'WarrantyType', {
          type: Sequelize.ENUM('Local', 'No', 'International', '100% orginal', 'Brand', 'Seller'),
          defaultValue: '100% orginal'
        });
        await queryInterface.addColumn('products', 'WarrantyPeriod', {
          type: Sequelize.STRING,
          allowNull: true
        });
        await queryInterface.addColumn('products', 'PublishStatus', {
          type: Sequelize.ENUM('Pending', 'Processing', 'Unpublished', 'Published'),
          defaultValue: 'Pending'
        });
        await queryInterface.addColumn('products', 'ShippingDays', {
          type: Sequelize.STRING,
          allowNull: true
        });
        await queryInterface.addColumn('products', 'HighlightDetail', {
          type: Sequelize.JSON,
          allowNull: true
        });

        // Add columns to the 'ProductVariants' table
        await queryInterface.addColumn('ProductVariants', 'ColorId', {
          type: Sequelize.INTEGER,
          allowNull: true
        });
        await queryInterface.addColumn('ProductVariants', 'BrandId', {
          type: Sequelize.INTEGER,
          allowNull: true
        });
        await queryInterface.addColumn('ProductVariants', 'LongDescription', {
          type: Sequelize.TEXT,
          allowNull: true
        });
        await queryInterface.addColumn('ProductVariants', 'ShortDescription', {
          type: Sequelize.TEXT,
          allowNull: true
        });
        await queryInterface.addColumn('ProductVariants', 'Thumbnail', {
          type: Sequelize.TEXT,
          allowNull: true
        });
        await queryInterface.addColumn('ProductVariants', 'YouTubeUrl', {
          type: Sequelize.TEXT,
          allowNull: true
        });
        await queryInterface.addColumn('ProductVariants', 'StockType', {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: true
        });
        await queryInterface.addColumn('ProductVariants', 'Refundable', {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: true
        });
        await queryInterface.addColumn('ProductVariants', 'QtyWarning', {
          type: Sequelize.INTEGER,
          allowNull: true
        });
        await queryInterface.addColumn('ProductVariants', 'COD', {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: true
        });
      }
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove added columns from the tables
      await queryInterface.removeColumn('products', 'SellerId');
      await queryInterface.removeColumn('products', 'LocalDeliveryCharge');
      await queryInterface.removeColumn('products', 'ZonalDeliveryCharge');
      await queryInterface.removeColumn('products', 'NationalDeliveryCharge');
      await queryInterface.removeColumn('products', 'WarrantyType');
      await queryInterface.removeColumn('products', 'WarrantyPeriod');
      await queryInterface.removeColumn('products', 'PublishStatus');
      await queryInterface.removeColumn('products', 'ShippingDays');
      await queryInterface.removeColumn('products', 'HighlightDetail');
      await queryInterface.removeColumn('ProductVariants', 'ColorId');
      await queryInterface.removeColumn('ProductVariants', 'BrandId');
      await queryInterface.removeColumn('ProductVariants', 'LongDescription');
      await queryInterface.removeColumn('ProductVariants', 'ShortDescription');
      await queryInterface.removeColumn('ProductVariants', 'Thumbnail');
      await queryInterface.removeColumn('ProductVariants', 'YouTubeUrl');
      await queryInterface.removeColumn('ProductVariants', 'StockType');
      await queryInterface.removeColumn('ProductVariants', 'Refundable');
      await queryInterface.removeColumn('ProductVariants', 'QtyWarning');
      await queryInterface.removeColumn('ProductVariants', 'COD');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
