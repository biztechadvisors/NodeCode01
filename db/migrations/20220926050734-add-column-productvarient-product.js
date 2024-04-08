module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tables = await queryInterface.showAllTables();

      if (tables.includes('products')) {
        const columnsProducts = await queryInterface.describeTable('products');
        if (!columnsProducts['condition']) {
          await queryInterface.addColumn("products", "condition", {
            type: Sequelize.INTEGER,
            after: "slug",
          }, { transaction });
        }
      }

      if (tables.includes('ProductVariants')) {
        const columnsProductVariants = await queryInterface.describeTable('ProductVariants');
        if (!columnsProductVariants['storageSize']) {
          await queryInterface.addColumn("ProductVariants", "storageSize", {
            type: Sequelize.INTEGER,
            after: "compatibility",
          }, { transaction });
        }
        if (!columnsProductVariants['storageType']) {
          await queryInterface.addColumn("ProductVariants", "storageType", {
            type: Sequelize.INTEGER,
            after: "storageSize",
          }, { transaction });
        }
        if (!columnsProductVariants['displayResolutionType']) {
          await queryInterface.addColumn("ProductVariants", "displayResolutionType", {
            type: Sequelize.INTEGER,
            after: "storageType",
          }, { transaction });
        }
        if (!columnsProductVariants['laptopType']) {
          await queryInterface.addColumn("ProductVariants", "laptopType", {
            type: Sequelize.INTEGER,
            after: "displayResolutionType",
          }, { transaction });
        }
        if (!columnsProductVariants['graphicsMemory']) {
          await queryInterface.addColumn("ProductVariants", "graphicsMemory", {
            type: Sequelize.INTEGER,
            after: "laptopType",
          }, { transaction });
        }
        if (!columnsProductVariants['osVersion']) {
          await queryInterface.addColumn("ProductVariants", "osVersion", {
            type: Sequelize.INTEGER,
            after: "laptopType",
          }, { transaction });
        }
        if (!columnsProductVariants['processorId']) {
          await queryInterface.addColumn("ProductVariants", "processorId", {
            type: Sequelize.INTEGER,
            after: "osVersion",
          }, { transaction });
        }
      }

      if (tables.includes('collection')) {
        const columnsCollection = await queryInterface.describeTable('collection');
        if (!columnsCollection['thumbnail']) {
          await queryInterface.addColumn("collection", "thumbnail", {
            type: Sequelize.STRING,
            after: "status",
          }, { transaction });
        }
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
      const tables = await queryInterface.showAllTables();

      if (tables.includes('products')) {
        const columnsProducts = await queryInterface.describeTable('products');
        if (columnsProducts['condition']) {
          await queryInterface.removeColumn("products", "condition", { transaction });
        }
      }

      if (tables.includes('ProductVariants')) {
        const columnsProductVariants = await queryInterface.describeTable('ProductVariants');
        if (columnsProductVariants['storageSize']) {
          await queryInterface.removeColumn("ProductVariants", "storageSize", { transaction });
        }
        if (columnsProductVariants['storageType']) {
          await queryInterface.removeColumn("ProductVariants", "storageType", { transaction });
        }
        if (columnsProductVariants['displayResolutionType']) {
          await queryInterface.removeColumn("ProductVariants", "displayResolutionType", { transaction });
        }
        if (columnsProductVariants['laptopType']) {
          await queryInterface.removeColumn("ProductVariants", "laptopType", { transaction });
        }
        if (columnsProductVariants['graphicsMemory']) {
          await queryInterface.removeColumn("ProductVariants", "graphicsMemory", { transaction });
        }
        if (columnsProductVariants['osVersion']) {
          await queryInterface.removeColumn("ProductVariants", "osVersion", { transaction });
        }
        if (columnsProductVariants['processorId']) {
          await queryInterface.removeColumn("ProductVariants", "processorId", { transaction });
        }
      }

      if (tables.includes('collection')) {
        const columnsCollection = await queryInterface.describeTable('collection');
        if (columnsCollection['thumbnail']) {
          await queryInterface.removeColumn("collection", "thumbnail", { transaction });
        }
      }

      await transaction.commit();
      return Promise.resolve();
    } catch (e) {
      await transaction.rollback();
      return Promise.reject(e);
    }
  },
};
