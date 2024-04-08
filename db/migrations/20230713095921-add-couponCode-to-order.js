'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const columnsOrders = await queryInterface.describeTable('Orders');
      if (!columnsOrders['couponCode']) {
        await queryInterface.addColumn('Orders', 'couponCode', {
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
      const columnsOrders = await queryInterface.describeTable('Orders');
      if (columnsOrders['couponCode']) {
        await queryInterface.removeColumn('Orders', 'couponCode', { transaction });
      }
      await transaction.commit();
      return Promise.resolve();
    } catch (e) {
      await transaction.rollback();
      return Promise.reject(e);
    }
  },
};
