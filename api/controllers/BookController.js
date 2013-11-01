/**
 * BookController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var BH = require(__dirname + '/../helpers/book-helper');
var df = require('dateformat');
var async = require('async');

module.exports = {
  /**
   * get /book/new
   */
  new: function(req, res) {
    console.log('book#new');
    res.view();
  },

  /**
   * post /book/create
   */
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

    async.waterfall([
        // 保存书文件到特定文件夹
        function(callback) {
          BH.saveBook(book_name, req.files.book.path, function(err) {
            info.chapters = [book_name];
            info.is_split = false;
            callback(err, info);
          });
        },
        // 保存书信息到数据库
        function(info, callback) {
          Book.create(info, function(err, result) {
            callback(err, result);
          });
        }
        ], function(err, result) {
          if (err) {
            res.send(err);
          } else {
            res.redirect('/book/index');
          }
        });
  },

  /**
   * get /book/find?id=123
   */
  find: function(req, res) {
    console.log('book#find');
    BH.findBookById(req.param('id'), function(err, result) {
      if (err) {
        res.send(err);
      } else {
        res.view({ object: result });
      }
    });
  },

  /**
   * get /book/edit?id=123
   */
  edit: function(req, res) {
    console.log('book#edit');
    BH.findBookById(req.param('id'), function(err, result) {
      if (err) {
        res.send(err);
      } else {
        result.publish_time = df(result.publish_time, "yyyy-mm-dd");
        res.view({ object: result });
      }
    });
  },

  /**
   * post /book/update
   */
  update: function(req, res) {
    console.log('book#update');
    // 定义 find() 方法
    // 从数据库读取书信息，并更新信息
    var find = function(callback) {
      BH.findBookById(req.param('id'), function(err, result) {
        if (err) {
          callback(err, null);
        } else {
          result.author = req.param('author');
          result.publish_time = req.param('publish_time');
          result.updated_at = new Date();
          callback(err, result);
        }
      });
    };
    // 判断用户是否更新书文件
    if (req.files.book.size != 0) {
      async.waterfall([
          // 从数据库读取书信息，并更新信息
          find,
          // 从文件系统移除书文件
          function(book, callback) {
            BH.removeBook(book.name, function(err) {
              callback(err, book);
            });
          },
          // 保存书文件到特定文件夹
          function(book, callback) {
            BH.saveBook(book.name, req.files.book.path, function(err) {
              book.chapters = [book.name];
              book.is_split = false;
              callback(err, book);
            });
          },
          // 保存书信息到数据库
          function(book, callback) {
            book.save(function(err, result) {
              callback(err, result);
            });
          }
      ], function(err, result) {
        if (err) {
          res.send(err);
        } else {
          res.redirect('/book/index');
        }
      });
    } else {
      async.waterfall([
          // 从数据库读取书信息，并更新信息
          find,
          // 保存书信息到数据库
          function(book, callback) {
            book.save(function(err, result) {
              callback(err, result);
            });
          }
          ], function(err, result) {
            if (err) {
              res.send(err);
            } else {
              res.redirect('/book/index');
            }
          });
    }
  },

  /**
   * get /book/destroy?id=123
   */
  destroy: function(req, res) {
    console.log('book#destroy');
    async.waterfall([
        // 从数据库读取书信息
        function(callback) {
          BH.findBookById(req.param('id'), function(err, result) {
            callback(err, result);
          });
        },
        // 从数据库删除书信息
        function(book, callback) {
          book.destroy(function(err) {
            callback(err, book);
          });
        },
        // 从文件系统移除书文件
        function(book, callback) {
          BH.removeBook(book.name, function(err) {
            callback(err, book);
          });
        }
        ], function(err, result) {
          if (err) {
            res.send(err);
          } else {
            res.redirect('/book/index');
          }
        });
  },

  /**
   * get /book/index
   */
  index: function(req, res) {
    console.log('book#index');
    Book.find({}).done(function(err, result) {
      if (err || !result) {
        res.send('find books error');
      } else {
        res.view({ objects: result });
      }
    });
  },

  /**
   * get /book/getChapter?bname=abc&cname=def
   */
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

  /**
   * get /book/split?id=123&type=start&match=rgexp
   */
  split: function(req, res) {
    console.log('book#split');
    console.log(req.param('id') + "***" + req.param('type') + "***" + req.param('match'));
    // 从数据库读取书信息
    BH.findBookById(req.param('id'), function(err, result) {
      if (err) {
        res.send(err);
      } else if (result.is_split) {
        res.send('book already splited!');
      } else {
        async.waterfall([
          // 拆分书文件
          function(callback) {
            BH.split(result.name, req.param('type').trim(), req.param('match').trim(), function(err, chapters) {
              callback(err, chapters);
            });
          },
          // 更新书信息
          function(chapters, callback) {
            result.chapters = chapters;
            result.is_split = true;
            result.save(function(err) {
              callback(err, result);
            });
          }
          ], function(err, result) {
            if (err) {
              res.send(err);
            } else {
              // res.redirect('/book/index');
              // 执行上行命令，得到如下错误
              //postgresql server: could not receive data from client: 连接被对端重置
              //local: Can't set headers after they are sent 
              res.view();
            }
          });
      }
    });
  }
};
