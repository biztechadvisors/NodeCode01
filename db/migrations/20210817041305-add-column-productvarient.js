'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the column 'actualPrice' already exists in the 'ProductVariants' table
      const columns = await queryInterface.describeTable('ProductVariants');
      if ('actualPrice' in columns) {
        console.log('Column "actualPrice" already exists in the table "ProductVariants". Skipping migration.');
        return Promise.resolve();
      }

      // If the column 'actualPrice' doesn't exist, add it to the 'ProductVariants' table
      await queryInterface.addColumn('ProductVariants', 'actualPrice', {
        type: Sequelize.DOUBLE
      });

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove the 'actualPrice' column from the 'ProductVariants' table
      await queryInterface.removeColumn('ProductVariants', 'actualPrice');

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
