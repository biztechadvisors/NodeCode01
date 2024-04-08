'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'price' column exists in the 'products' table
    const columns = await queryInterface.describeTable('products');
    if ('price' in columns) {
      // If the 'price' column exists, remove it
      await queryInterface.removeColumn('products', 'price');
    }
    // Repeat the same process for other columns if needed
    if ('unitSize' in columns) {
      await queryInterface.removeColumn('products', 'unitSize');
    }
    if ('buyerPrice' in columns) {
      await queryInterface.removeColumn('products', 'buyerPrice');
    }
    if ('qty' in columns) {
      await queryInterface.removeColumn('products', 'qty');
    }
    if ('discountPer' in columns) {
      await queryInterface.removeColumn('products', 'discountPer');
    }
    if ('discount' in columns) {
      await queryInterface.removeColumn('products', 'discount');
    }
    if ('total' in columns) {
      await queryInterface.removeColumn('products', 'total');
    }
    if ('netPrice' in columns) {
      await queryInterface.removeColumn('products', 'netPrice');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Add the 'price' column back to the 'products' table
    await queryInterface.addColumn('products', 'price', {
      type: Sequelize.INTEGER,
      allowNull: false // Adjust this according to your schema
    });
    // Repeat the same process for other columns if needed
    await queryInterface.addColumn('products', 'unitSize', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('products', 'buyerPrice', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addColumn('products', 'qty', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addColumn('products', 'discountPer', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addColumn('products', 'discount', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addColumn('products', 'total', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addColumn('products', 'netPrice', {
      type: Sequelize.INTEGER
    });
  }
};
