'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) =>
      queryInterface.createTable(
        'groups',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: Sequelize.UUIDV4,
          },
          name: {
            type: Sequelize.JSON,
            allowNull: false,
          },
          created: {
            type: 'TIMESTAMP WITH TIME ZONE',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
          },
          modified: {
            type: 'TIMESTAMP WITH TIME ZONE',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
          },
          display_order: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          is_hidden: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          multiset: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          step_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'steps',
              key: 'id',
            },
          },
        },
        { transaction: t },
      ),
    )
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) =>
      queryInterface.dropTable('groups', { transaction: t }),
    )
  },
}
