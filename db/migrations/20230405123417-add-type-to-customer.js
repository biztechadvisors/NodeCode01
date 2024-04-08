'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const columnsCustomers = await queryInterface.describeTable('customers');
      if (!columnsCustomers['type']) {
        await queryInterface.addColumn('customers', 'type', {
          type: Sequelize.STRING,
          allowNull: true,
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
      const columnsCustomers = await queryInterface.describeTable('customers');
      if (columnsCustomers['type']) {
        await queryInterface.removeColumn('customers', 'type', { transaction });
      }
      await transaction.commit();
      return Promise.resolve();
    } catch (e) {
      await transaction.rollback();
      return Promise.reject(e);
    }
  },
};
