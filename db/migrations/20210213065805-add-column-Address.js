'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'StreetAddress' column already exists in the 'Addresses' table
    const columns = await queryInterface.describeTable('Addresses');
    if ('StreetAddress' in columns) {
      console.log('Column "StreetAddress" already exists in the table "Addresses". Skipping migration.');
      return Promise.resolve();
    }

    // If the 'StreetAddress' column doesn't exist, add it to the 'Addresses' table
    return queryInterface.addColumn('Addresses', 'StreetAddress', {
      type: Sequelize.TEXT
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'StreetAddress' column from the 'Addresses' table
    return queryInterface.removeColumn('Addresses', 'StreetAddress');
  }
};
