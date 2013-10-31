/**
 * BookController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var BH = require(__dirname + '/../helpers/book-helper');

module.exports = {
  new: function(req, res) {
    console.log('book#new');
    res.view();
  },

  create: function(req, res) {
    console.log('book#create');
    var book_name = req.param('name').trim();
    var info = {
      name: book_name,
      author: req.param('author'),
      publish_time: req.param('publish_time'),
      created_at: new Date(),
      updated_at: new Date()
    };

    // Save book
    BH.saveBook(book_name, req.files.book.path, function(err) {
      if (err) {
        res.send(err);
      } else {
        info.chapters = [book_name];
        Book.create(info, function(err, result) {
          if (err || !result) {
            res.send(err ? err : result);
          } else {
            res.redirect('/book/index');
          }
        });
      }
    });
  },

  find: function(req, res) {
    console.log('book#find');
    Book.findOne({id: req.param('id')}, function(err, result) {
      if (err || !result) {
        res.send(err ? err : result);
      } else {
        res.view({ object: result });
      }
    });
  },

  edit: function(req, res) {
    console.log('book#edit');
    Book.findOne({id: req.param('id')}, function(err, result) {
      if (err || !result) {
        res.send(err ? err : result);
      } else {
        res.view({ object: result });
      }
    });
  },

  update: function(req, res) {
    console.log('book#update');
    Book.findOne({id: req.param('id')}, function(err, result) {
      if (err || !result) {
        res.send(err ? err : result);
      } else {
        result.name = req.param('name');
        result.author = req.param('author');
        result.publish_time = req.param('publish_time');
        result.updated_at = new Date();
        result.save(function(err, result) {
          if (err || !result) {
            res.send(err ? err : result);
          } else {
            res.redirect('/book/index');
          }
        });
      }
    });
  },

  destroy: function(req, res) {
    console.log('book#destroy');
    Book.findOne({id: req.param('id')}, function(err, result) {
      if (err || !result) {
        res.send(err ? err : result);
      } else {
        Book.destroy({id: req.param('id')}, function(err, result) {
          if (err || !result) {
            res.send(err ? err : result);
          } else {
            res.redirect('/book/index');
          }
        });
      }
    });
  },

  index: function(req, res) {
    console.log('book#index');
    Book.find({}, function(err, result) {
      if (err || !result) {
        res.send(err ? err : result);
      } else {
        res.view({ objects: result });
      }
    });
  },

  getChapter: function(req, res) {
    console.log('book#getChapter');
    BH.getChapter(req.param('bname').trim(), req.param('cname').trim(), function(err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    });
  },

  split: function(req, res) {
    console.log('book#split');
    BH.split(req.param('type').trim(), req.param('marker').trim(), function(err) {
      err ? res.send(err) : res.redirect('book/index');
    });
  }
};
