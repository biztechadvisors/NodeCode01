'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'productName' column already exists in the 'ProductVariants' table
    const columns = await queryInterface.describeTable('ProductVariants');
    if ('productName' in columns) {
      console.log('Column "productName" already exists in the table "ProductVariants". Skipping migration.');
      return Promise.resolve();
    }

    // If the 'productName' column doesn't exist, add it to the 'ProductVariants' table
    return queryInterface.addColumn('ProductVariants', 'productName', {
      type: Sequelize.STRING
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'productName' column from the 'ProductVariants' table
    return queryInterface.removeColumn('ProductVariants', 'productName');
  }
};
