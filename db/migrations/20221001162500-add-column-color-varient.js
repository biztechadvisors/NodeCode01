module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tables = await queryInterface.showAllTables();

      if (tables.includes('ProductVariants')) {
        const columnsProductVariants = await queryInterface.describeTable('ProductVariants');
        if (!columnsProductVariants['internationalWarranty']) {
          await queryInterface.addColumn(
            "ProductVariants",
            "internationalWarranty",
            {
              type: Sequelize.INTEGER,
              after: "stockType",
            },
            { transaction }
          );
        }
      }

      if (tables.includes('ch_color_details')) {
        const columnsColorDetails = await queryInterface.describeTable('ch_color_details');
        if (!columnsColorDetails['thumbnail']) {
          await queryInterface.addColumn("ch_color_details", "thumbnail", {
            type: Sequelize.TEXT,
            after: "STATUS",
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

      if (tables.includes('ProductVariants')) {
        const columnsProductVariants = await queryInterface.describeTable('ProductVariants');
        if (columnsProductVariants['internationalWarranty']) {
          await queryInterface.removeColumn(
            "ProductVariants",
            "internationalWarranty",
            { transaction }
          );
        }
      }

      if (tables.includes('ch_color_details')) {
        const columnsColorDetails = await queryInterface.describeTable('ch_color_details');
        if (columnsColorDetails['thumbnail']) {
          await queryInterface.removeColumn("ch_color_details", "thumbnail", { transaction });
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
