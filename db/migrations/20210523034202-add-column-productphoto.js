'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'varientId' column already exists in the 'productphotos' table
    const columns = await queryInterface.describeTable('productphotos');
    if ('varientId' in columns) {
      console.log('Column "varientId" already exists in the table "productphotos". Skipping migration.');
      return Promise.resolve();
    }

    // If the 'varientId' column doesn't exist, add it to the 'productphotos' table
    return queryInterface.addColumn('productphotos', 'varientId', {
      type: Sequelize.INTEGER
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'varientId' column from the 'productphotos' table
    return queryInterface.removeColumn('productphotos', 'varientId');
  }
};
