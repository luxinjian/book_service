var fs = require('fs');

exports.getChapter = function(book_name, cpt_name, callback) {
  book_name = book_name.trim();
  cpt_name = cpt_name.trim();
  var path = sails.config.book_path + book_name + '/' + cpt_name + '.txt';
  fs.readFile(path, function(err, data) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, data.toString());
    }
  });
}
