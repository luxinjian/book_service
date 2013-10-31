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
