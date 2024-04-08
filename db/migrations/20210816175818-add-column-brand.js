'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'title' column already exists in the 'ch_brand_details' table
    const columns = await queryInterface.describeTable('ch_brand_details');
    if ('title' in columns) {
      console.log('Column "title" already exists in the table "ch_brand_details". Skipping migration.');
      return Promise.resolve();
    }

    // If the 'title' column doesn't exist, add it to the 'ch_brand_details' table
    await queryInterface.addColumn('ch_brand_details', 'title', {
      type: Sequelize.STRING
    });

    // Add the 'keyword' column to the 'ch_brand_details' table
    await queryInterface.addColumn('ch_brand_details', 'keyword', {
      type: Sequelize.TEXT
    });

    // Add the 'desc' column to the 'ch_brand_details' table
    await queryInterface.addColumn('ch_brand_details', 'desc', {
      type: Sequelize.TEXT
    });

    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'title' column from the 'ch_brand_details' table
    await queryInterface.removeColumn('ch_brand_details', 'title');

    // Remove the 'keyword' column from the 'ch_brand_details' table
    await queryInterface.removeColumn('ch_brand_details', 'keyword');

    // Remove the 'desc' column from the 'ch_brand_details' table
    await queryInterface.removeColumn('ch_brand_details', 'desc');

    return Promise.resolve();
  }
};
