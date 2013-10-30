/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

module.exports = {

  tableName: 'books',

  attributes: {
    name: 'TEXT',
    author: 'TEXT',
    publish_time: 'DATETIME',
    chapters: 'INTEGER',
    created_at	: 'DATETIME',
    updated_at	: 'DATETIME',
  },

  autoCreatedAt: false,
  autoUpdatedAt: false,
};
