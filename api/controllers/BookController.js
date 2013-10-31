/**
 * BookController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var BH = require(__dirname + '/../helpers/book-helper');
var df = require('dateformat');

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
    Book.findOne({id: req.param('id')}).done(function(err, result) {
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
        result.publish_time = df(result.publish_time, "yyyy-mm-dd");
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
        result.author = req.param('author');
        result.publish_time = req.param('publish_time');
        result.updated_at = new Date();

        if (req.files.book.size != 0) {
          var book_name = result.name;
            BH.removeBook(book_name, function(err) {
              if (err) {
                res.send(err);
              } else {
                BH.saveBook(book_name, req.files.book.path, function(err) {
                  if (err) {
                    res.send(err);
                  } else {
                    result.is_split = false;

                    result.save(function(err, result) {
                      if (err || !result) {
                        res.send(err ? err : result);
                      } else {
                        res.redirect('/book/index');
                      }
                    });
                  }
                });
              }
            });
        } else {
          result.save(function(err, result) {
            if (err || !result) {
              res.send(err ? err : result);
            } else {
              res.redirect('/book/index');
            }
          });
        }
      }
    });
  },

  destroy: function(req, res) {
    console.log('book#destroy');
    Book.findOne({id: req.param('id')}, function(err, result) {
      if (err || !result) {
        res.send(err ? err : result);
      } else {
        result.destroy(function(err) {
          if (err) {
            res.send(err);
          } else {
            BH.removeBook(result.name, function(err) {
              if (err) {
                res.send(err);
              } else {
                res.redirect('/book/index');
              }
            });
          }
        });
      }
    });
  },

  index: function(req, res) {
    console.log('book#index');
    Book.find({}).done(function(err, result) {
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
    console.log(req.param('id') + "***" + req.param('type') + "***" + req.param('match'));
    Book.findOne({id: req.param('id')}).done(function(err, result) {
      if (err || !result) {
        res.send(err ? err : result);
      } else if (result.is_split) {
        res.send('book already splited!');
      } else {
        BH.split(result.name, req.param('type').trim(), req.param('match').trim(), function(err, chapters) {
          if (err) {
            res.send(err);
          } else {
            result.chapters = chapters;
            result.is_split = true;
            result.save(function(err) {
              if (err) {
                res.send(err);
              } else {
                // res.redirect('/book/index');
                // Get follow error
                //postgresql server: could not receive data from client: 连接被对端重置
                //local: Can't set headers after they are sent 
                res.view();
              }
            });
          }
        });
      }
    });
  }
};
