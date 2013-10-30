/**
 * BookController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */


module.exports = {
  index: function(req, res) {
    console.log('book#index');
    res.view();
  },
  create: function(req, res) {
    console.log('book#create');
  },

  update: function(req, res) {
    console.log('book#update');
  },

  destroy: function(req, res) {
    console.log('book#destroy');
  },
};
