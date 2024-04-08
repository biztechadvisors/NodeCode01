'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'Available' column already exists in the 'ProductVariants' table
    const columns = await queryInterface.describeTable('ProductVariants');
    if ('Available' in columns) {
      console.log('Column "Available" already exists in the table "ProductVariants". Skipping migration.');
      return Promise.resolve();
    }

    // If the 'Available' column doesn't exist, add it to the 'ProductVariants' table
    return queryInterface.addColumn('ProductVariants', 'Available', {
      type: Sequelize.BOOLEAN
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'Available' column from the 'ProductVariants' table
    return queryInterface.removeColumn('ProductVariants', 'Available');
  }
};
