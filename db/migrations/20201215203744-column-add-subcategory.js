'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'slug' column already exists in the 'SubCategories' table
    const columns = await queryInterface.describeTable('SubCategories');
    if ('slug' in columns) {
      console.log('Column "slug" already exists in the table "SubCategories". Skipping migration.');
      return Promise.resolve();
    }

    // If the 'slug' column doesn't exist, add it to the 'SubCategories' table
    return queryInterface.addColumn('SubCategories', 'slug', {
      type: Sequelize.STRING
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'slug' column from the 'SubCategories' table
    return queryInterface.removeColumn('SubCategories', 'slug');
  }
};
