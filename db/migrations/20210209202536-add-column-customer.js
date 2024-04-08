'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'verify' column already exists in the 'customers' table
    const columns = await queryInterface.describeTable('customers');
    if (!('verify' in columns)) {
      // Add the 'verify' column to the 'customers' table if it doesn't exist
      await queryInterface.addColumn('customers', 'verify', {
        type: Sequelize.BOOLEAN
      });
    }

    // Check if the 'verf_key' column already exists in the 'customers' table
    if (!('verf_key' in columns)) {
      // Add the 'verf_key' column to the 'customers' table if it doesn't exist
      await queryInterface.addColumn('customers', 'verf_key', {
        type: Sequelize.STRING
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'verf_key' column from the 'customers' table
    await queryInterface.removeColumn('customers', 'verf_key');

    // Remove the 'verify' column from the 'customers' table
    await queryInterface.removeColumn('customers', 'verify');
  }
};
