'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'addressId' column already exists in the 'Orders' table
    const columns = await queryInterface.describeTable('Orders');
    if ('addressId' in columns) {
      console.log('Column "addressId" already exists in the table "Orders". Skipping migration.');
      return Promise.resolve();
    }

    // If the 'addressId' column doesn't exist, add it to the 'Orders' table
    return queryInterface.addColumn('Orders', 'addressId', {
      type: Sequelize.INTEGER
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'addressId' column from the 'Orders' table
    return queryInterface.removeColumn('Orders', 'addressId');
  }
};
