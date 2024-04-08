'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'zipcode' column already exists in the 'locations' table
    const columns = await queryInterface.describeTable('locations');
    if ('zipcode' in columns) {
      console.log('Column "zipcode" already exists in the table "locations". Skipping migration.');
      return Promise.resolve();
    }

    // If the 'zipcode' column doesn't exist, add it to the 'locations' table
    return queryInterface.addColumn('locations', 'zipcode', {
      type: Sequelize.INTEGER
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'zipcode' column from the 'locations' table
    return queryInterface.removeColumn('locations', 'zipcode');
  }
};
