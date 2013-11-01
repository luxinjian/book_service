var fs = require('fs');
var rimraf = require('rimraf');
var async = require('async');


// 根据id从数据库读取书信息
exports.findBookById = function(id, callback) {
  Book.findOne({id: id}, function(err, result) {
    if (err) {
      callback('find book err: ' + e, null);
    } else if (!result) {
      callback('invalid book id: ' + id, null);
    } else {
      callback(null, result);
    }
  });
};

// 根据书名及篇名得到篇章信息
exports.getChapter = function(book_name, cpt_name, callback) {
  var path = sails.config.book_path + book_name + '/' + cpt_name + '.txt';
  fs.readFile(path, function(err, data) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, data.toString());
    }
  });
};

// 保存书文件到特定文件夹
exports.saveBook = function(name, path, cb) {
  var current_book_path = sails.config.book_path + name;
  var file_path = current_book_path + '/' + name + '.txt';
  async.waterfall([
      // 读取上传书文件数据
      function(callback) {
        fs.readFile(path, function(err, data) {
          callback(err, data);
        });
      },
      // 在文件系统建立书文件存放文件夹
      function(data, callback) {
        fs.mkdir(current_book_path, function(err) {
          callback(err, data);
        });
      },
      // 在文件系统相应路径下建立书文件
      function(data, callback) {
        fs.open(file_path, 'wx', function(err, fd) {
          callback(err, data);
        });
      },
      // 存放书文件数据到书文件
      function(data, callback) {
        fs.writeFile(file_path, data, function(err) {
          callback(err, null);
        });
      }
  ], function(err, result) {
    cb(err);
  });
};

// 从文件系统删除书文件
exports.removeBook = function(name, callback) {
  var path = sails.config.book_path + name;
  rimraf(path, function(err) {
    err ? callback(err) : callback(null);
  });
};

exports.split = function(book_name, type, match, callback) {
  // 得到未拆分前书文件的内容
  var current_book_path = sails.config.book_path + book_name;
  var origin_text_path = current_book_path + '/' + book_name + '.txt';
  var origin_text = fs.readFileSync(origin_text_path).toString();

  // 判断拆分字符串的位置并分别处理
  if('start' == type) {
    match = eval('/' + match + '/g');
    var matches = origin_text.match(match);
    matches.unshift('序');
    var start = 0;
    var end = 0;
    var cpt_name;
    var cpt_content;

    // 得到每一章节，并存放为一独立文件
    for(var i=0; i<matches.length; i++) {
      // 循环到达最后一章节时，end为书末尾
      if (i == matches.length - 1) {
        end = origin_text.length;
      } else {
        end = origin_text.search(matches[i + 1]);
      }

      // 得到每一章节的名称及内容
      cpt_name = matches[i];
      cpt_content = origin_text.slice(start, end);
      start = end;

      // 保存每一章节
      saveChapter(current_book_path, cpt_name, cpt_content, function(err) {
        err ? callback(err, null) : callback(null, matches);
      });
    }
  } else if ('end' == type) {
    // 放在以后实现
    callback('Function does not implement!', null);
  } else {
    callback('unknown type', null);
  }
};

function saveChapter(path, name, content, callback) {
  name = name.trim();
  var cpt_path = path + '/' + name + '.txt';
  // 根据路径打开或创建文件
  fs.open(cpt_path, 'w', function(err, fd) {
    if (err) {
      callback(err);
    } else {
      // 将数据写入特定文件
      fs.writeFile(cpt_path, content, function(err) {
        err ? callback(err) : callback(null);
      });
    }
  });
};
