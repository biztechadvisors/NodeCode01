'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'zipcode' column already exists in the 'areas' table
    const columns = await queryInterface.describeTable('areas');
    if ('zipcode' in columns) {
      console.log('Column "zipcode" already exists in the table "areas". Skipping migration.');
      return Promise.resolve();
    }

    // If the 'zipcode' column doesn't exist, add it to the 'areas' table
    return queryInterface.addColumn('areas', 'zipcode', {
      type: Sequelize.INTEGER
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'zipcode' column from the 'areas' table
    return queryInterface.removeColumn('areas', 'zipcode');
  }
};
