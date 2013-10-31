var fs = require('fs');

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

exports.saveBook = function(name, path, callback) {
  // Read data from upload file
  fs.readFile(path, function(err, data) {
    if (err) {
      callback(err);
    } else {
      var current_book_path = sails.config.book_path + name;
      // Make book folder
      fs.mkdir(current_book_path, function(err) {
        if (err) {
          callback(err);
        } else {
          // Save book as one .txt file with book name as file name
          var file_path = current_book_path + '/' + name + '.txt';
          fs.open(file_path, 'wx', function(err, fd) {
            if (err) {
              callback(err);
            } else {
              // Write to file
              fs.writeFile(file_path, data, function(err) {
                err ? callback(err) : callback(null);
              });
            }
          });
        }
      });
    }
  });
};

exports.split = function(book_name, type, match, callback) {
  // Get origin book content.
  var current_book_path = sails.config.book_path + book_name;
  var origin_text_path = current_book_path + '/' + book_name + '.txt';
  var origin_text = fs.readFileSync(origin_text_path).toString();

  // Split depend on match-string's place
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
    // Implement in future.
    callback('Function does not implement!', null);
  } else {
    callback('unknown type', null);
  }
};

function saveChapter(path, name, content, callback) {
  name = name.trim();
  var cpt_path = path + '/' + name + '.txt';
  // Open or create file
  fs.open(cpt_path, 'w', function(err, fd) {
    if (err) {
      callback(err);
    } else {
      // Write to file
      fs.writeFile(cpt_path, content, function(err) {
        err ? callback(err) : callback(null);
      });
    }
  });
}
