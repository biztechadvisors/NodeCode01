'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const columnsOrders = await queryInterface.describeTable('Orders');
      if (!columnsOrders['totalDiscount']) {
        await queryInterface.addColumn('Orders', 'totalDiscount', {
          type: Sequelize.INTEGER,
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
      const columnsOrders = await queryInterface.describeTable('Orders');
      if (columnsOrders['totalDiscount']) {
        await queryInterface.removeColumn('Orders', 'totalDiscount', { transaction });
      }
      await transaction.commit();
      return Promise.resolve();
    } catch (e) {
      await transaction.rollback();
      return Promise.reject(e);
    }
  },
};
