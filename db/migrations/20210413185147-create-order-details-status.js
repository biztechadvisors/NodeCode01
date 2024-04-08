'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the 'status' column already exists in the 'Order_Details_Statuses' table
    const columns = await queryInterface.describeTable('Order_Details_Statuses');
    if ('status' in columns) {
      console.log('Column "status" already exists in the table "Order_Details_Statuses". Skipping migration.');
      return Promise.resolve();
    }

    // If the 'status' column doesn't exist, create it in the 'Order_Details_Statuses' table
    await queryInterface.createTable('Order_Details_Statuses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.BOOLEAN
      },
      custId: {
        type: Sequelize.INTEGER
      },
      orderId: {
        type: Sequelize.INTEGER
      },
      productId: {
        type: Sequelize.INTEGER
      },
      issue: {
        type: Sequelize.STRING
      },
      comment: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add the 'status' column to 'Cart_Details' table only if it doesn't exist
    await queryInterface.addColumn('Cart_Details', 'status', {
      type: Sequelize.ENUM('processing', 'shipping', 'delivered', 'cancelRequest', 'cancel'),
      defaultValue: 'processing'
    });

    // Add the 'deliveryDate' column to 'Cart_Details' table only if it doesn't exist
    await queryInterface.addColumn('Cart_Details', 'deliveryDate', {
      type: Sequelize.DATE
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the 'Order_Details_Statuses' table
    await queryInterface.dropTable('Order_Details_Statuses');

    // Remove the 'status' column from the 'Cart_Details' table
    await queryInterface.removeColumn('Cart_Details', 'status');

    // Remove the 'deliveryDate' column from the 'Cart_Details' table
    await queryInterface.removeColumn('Cart_Details', 'deliveryDate');
  }
};
