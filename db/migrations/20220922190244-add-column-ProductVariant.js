module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const columns = await queryInterface.describeTable('ProductVariants');
      if (!columns['networkType']) {
        await queryInterface.addColumn("ProductVariants", "networkType", {
          type: Sequelize.STRING,
          after: "slug",
        }, { transaction });
      }
      if (!columns['modelYear']) {
        await queryInterface.addColumn("ProductVariants", "modelYear", {
          type: Sequelize.STRING,
          after: "slug",
        }, { transaction });
      }
      if (!columns['osType']) {
        await queryInterface.addColumn("ProductVariants", "osType", {
          type: Sequelize.STRING,
          after: "slug",
        }, { transaction });
      }
      if (!columns['memory']) {
        await queryInterface.addColumn("ProductVariants", "memory", {
          type: Sequelize.STRING,
          after: "slug",
        }, { transaction });
      }
      if (!columns['screenSize']) {
        await queryInterface.addColumn("ProductVariants", "screenSize", {
          type: Sequelize.STRING,
          after: "slug",
        }, { transaction });
      }
      if (!columns['batteryCapacity']) {
        await queryInterface.addColumn("ProductVariants", "batteryCapacity", {
          type: Sequelize.STRING,
          after: "slug",
        }, { transaction });
      }
      if (!columns['primaryCamera']) {
        await queryInterface.addColumn("ProductVariants", "primaryCamera", {
          type: Sequelize.STRING,
          after: "slug",
        }, { transaction });
      }
      if (!columns['secondaryCamera']) {
        await queryInterface.addColumn("ProductVariants", "secondaryCamera", {
          type: Sequelize.STRING,
          after: "slug",
        }, { transaction });
      }
      if (!columns['simCount']) {
        await queryInterface.addColumn("ProductVariants", "simCount", {
          type: Sequelize.STRING,
          after: "slug",
        }, { transaction });
      }
      if (!columns['interface']) {
        await queryInterface.addColumn("ProductVariants", "interface", {
          type: Sequelize.STRING,
          after: "slug",
        }, { transaction });
      }
      if (!columns['compatibility']) {
        await queryInterface.addColumn("ProductVariants", "compatibility", {
          type: Sequelize.STRING,
          after: "slug",
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
      const columns = await queryInterface.describeTable('ProductVariants');
      if (columns['networkType']) {
        await queryInterface.removeColumn("ProductVariants", "networkType", { transaction });
      }
      if (columns['modelYear']) {
        await queryInterface.removeColumn("ProductVariants", "modelYear", { transaction });
      }
      if (columns['osType']) {
        await queryInterface.removeColumn("ProductVariants", "osType", { transaction });
      }
      if (columns['memory']) {
        await queryInterface.removeColumn("ProductVariants", "memory", { transaction });
      }
      if (columns['screenSize']) {
        await queryInterface.removeColumn("ProductVariants", "screenSize", { transaction });
      }
      if (columns['batteryCapacity']) {
        await queryInterface.removeColumn("ProductVariants", "batteryCapacity", { transaction });
      }
      if (columns['primaryCamera']) {
        await queryInterface.removeColumn("ProductVariants", "primaryCamera", { transaction });
      }
      if (columns['secondaryCamera']) {
        await queryInterface.removeColumn("ProductVariants", "secondaryCamera", { transaction });
      }
      if (columns['simCount']) {
        await queryInterface.removeColumn("ProductVariants", "simCount", { transaction });
      }
      if (columns['interface']) {
        await queryInterface.removeColumn("ProductVariants", "interface", { transaction });
      }
      if (columns['compatibility']) {
        await queryInterface.removeColumn("ProductVariants", "compatibility", { transaction });
      }
      await transaction.commit();
      return Promise.resolve();
    } catch (e) {
      await transaction.rollback();
      return Promise.reject(e);
    }
  },
};
