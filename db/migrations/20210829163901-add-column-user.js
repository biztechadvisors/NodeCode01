'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the column 'attempt' already exists in the 'users' table
      const columns = await queryInterface.describeTable('users');
      if ('attempt' in columns) {
        console.log('Column "attempt" already exists in the table "users". Skipping migration.');
        return Promise.resolve();
      }

      // If the column 'attempt' doesn't exist, add it to the 'users' table
      await queryInterface.addColumn('users', 'attempt', {
        type: Sequelize.INTEGER
      });

      // Add the 'loggedOutAt' column to the 'users' table
      await queryInterface.addColumn('users', 'loggedOutAt', {
        type: Sequelize.DATE
      });

      // Check if the column 'attempt' already exists in the 'customers' table
      const customersColumns = await queryInterface.describeTable('customers');
      if ('attempt' in customersColumns) {
        console.log('Column "attempt" already exists in the table "customers". Skipping migration.');
        return Promise.resolve();
      }

      // If the column 'attempt' doesn't exist, add it to the 'customers' table
      await queryInterface.addColumn('customers', 'attempt', {
        type: Sequelize.INTEGER
      });

      // Add the 'loggedOutAt' column to the 'customers' table
      await queryInterface.addColumn('customers', 'loggedOutAt', {
        type: Sequelize.DATE
      });

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove the 'attempt' column from the 'users' table
      await queryInterface.removeColumn('users', 'attempt');

      // Remove the 'loggedOutAt' column from the 'users' table
      await queryInterface.removeColumn('users', 'loggedOutAt');

      // Remove the 'attempt' column from the 'customers' table
      await queryInterface.removeColumn('customers', 'attempt');

      // Remove the 'loggedOutAt' column from the 'customers' table
      await queryInterface.removeColumn('customers', 'loggedOutAt');

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
