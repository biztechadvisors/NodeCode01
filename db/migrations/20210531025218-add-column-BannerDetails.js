'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'status' column already exists in the 'BannerDetails' table
    const columns = await queryInterface.describeTable('BannerDetails');
    if ('status' in columns) {
      console.log('Column "status" already exists in the table "BannerDetails". Skipping migration.');
      return Promise.resolve();
    }

    // If the 'status' column doesn't exist, add it to the 'BannerDetails' table
    return queryInterface.addColumn('BannerDetails', 'status', {
      type: Sequelize.BOOLEAN
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'status' column from the 'BannerDetails' table
    return queryInterface.removeColumn('BannerDetails', 'status');
  }
};
