'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const columnsOrders = await queryInterface.describeTable('Orders');
      if (!columnsOrders['razorpay_payment_id']) {
        await queryInterface.addColumn('Orders', 'razorpay_payment_id', {
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
      if (columnsOrders['razorpay_payment_id']) {
        await queryInterface.removeColumn('Orders', 'razorpay_payment_id', { transaction });
      }
      await transaction.commit();
      return Promise.resolve();
    } catch (e) {
      await transaction.rollback();
      return Promise.reject(e);
    }
  },
};
