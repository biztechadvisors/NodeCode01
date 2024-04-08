'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'brandId' column already exists in the 'products' table
    const columns = await queryInterface.describeTable('products');
    if ('brandId' in columns) {
      console.log('Column "brandId" already exists in the table "products". Skipping migration.');
      return Promise.resolve();
    }

    // If the 'brandId' column doesn't exist, add it to the 'products' table
    return queryInterface.addColumn('products', 'brandId', {
      type: Sequelize.INTEGER
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'brandId' column from the 'products' table
    return queryInterface.removeColumn('products', 'brandId');
  }
};
