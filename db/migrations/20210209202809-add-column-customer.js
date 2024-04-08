'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'verf_key' column already exists in the 'customers' table
    const columns = await queryInterface.describeTable('customers');
    if ('verf_key' in columns) {
      console.log('Column "verf_key" already exists in the table "customers". Skipping migration.');
      return Promise.resolve();
    }

    // If the 'verf_key' column doesn't exist, add it to the 'customers' table
    return queryInterface.addColumn('customers', 'verf_key', {
      type: Sequelize.STRING
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'verf_key' column from the 'customers' table
    return queryInterface.removeColumn('customers', 'verf_key');
  }
};
