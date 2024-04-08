'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const columnsOrders = await queryInterface.describeTable('Orders');
      if (!columnsOrders['shipment_id']) {
        await queryInterface.addColumn('Orders', 'shipment_id', {
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
      if (columnsOrders['shipment_id']) {
        await queryInterface.removeColumn('Orders', 'shipment_id', { transaction });
      }
      await transaction.commit();
      return Promise.resolve();
    } catch (e) {
      await transaction.rollback();
      return Promise.reject(e);
    }
  },
};
