'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the 'title' column already exists in the 'categories' table
      const categoriesColumns = await queryInterface.describeTable('categories');
      if (!('title' in categoriesColumns)) {
        await queryInterface.addColumn('categories', 'title', {
          type: Sequelize.STRING
        });
      }

      // Check if the 'keyword' column already exists in the 'categories' table
      if (!('keyword' in categoriesColumns)) {
        await queryInterface.addColumn('categories', 'keyword', {
          type: Sequelize.STRING
        });
      }

      // Check if the 'desc' column already exists in the 'categories' table
      if (!('desc' in categoriesColumns)) {
        await queryInterface.addColumn('categories', 'desc', {
          type: Sequelize.TEXT
        });
      }

      // Check if the 'title' column already exists in the 'SubCategories' table
      const subCategoriesColumns = await queryInterface.describeTable('SubCategories');
      if (!('title' in subCategoriesColumns)) {
        await queryInterface.addColumn('SubCategories', 'title', {
          type: Sequelize.STRING
        });
      }

      // Check if the 'keyword' column already exists in the 'SubCategories' table
      if (!('keyword' in subCategoriesColumns)) {
        await queryInterface.addColumn('SubCategories', 'keyword', {
          type: Sequelize.STRING
        });
      }

      // Check if the 'desc' column already exists in the 'SubCategories' table
      if (!('desc' in subCategoriesColumns)) {
        await queryInterface.addColumn('SubCategories', 'desc', {
          type: Sequelize.TEXT
        });
      }

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('categories', 'title');
      await queryInterface.removeColumn('categories', 'keyword');
      await queryInterface.removeColumn('categories', 'desc');
      await queryInterface.removeColumn('SubCategories', 'title');
      await queryInterface.removeColumn('SubCategories', 'keyword');
      await queryInterface.removeColumn('SubCategories', 'desc');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
