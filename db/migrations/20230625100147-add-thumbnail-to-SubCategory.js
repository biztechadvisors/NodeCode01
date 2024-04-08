'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const columnsSubCategories = await queryInterface.describeTable('SubCategories');
      if (!columnsSubCategories['thumbnail']) {
        await queryInterface.addColumn(
          'SubCategories',
          'thumbnail', {
          type: Sequelize.STRING,
        }, { transaction });
      }
      await transaction.commit();
      return Promise.resolve();
    } catch (e) {
      await transaction.rollback();
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const columnsSubCategories = await queryInterface.describeTable('SubCategories');
      if (columnsSubCategories['thumbnail']) {
        await queryInterface.removeColumn(
          'SubCategories',
          'thumbnail',
          { transaction }
        );
      }
      await transaction.commit();
      return Promise.resolve();
    } catch (e) {
      await transaction.rollback();
      return Promise.reject(e);
    }
  },
};
