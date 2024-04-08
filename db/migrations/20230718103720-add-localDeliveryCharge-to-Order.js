'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const columnsOrders = await queryInterface.describeTable('Orders');
      if (!columnsOrders['localDeliveryCharge']) {
        await queryInterface.addColumn('Orders', 'localDeliveryCharge', {
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
      if (columnsOrders['localDeliveryCharge']) {
        await queryInterface.removeColumn('Orders', 'localDeliveryCharge', { transaction });
      }
      await transaction.commit();
      return Promise.resolve();
    } catch (e) {
      await transaction.rollback();
      return Promise.reject(e);
    }
  },
};
