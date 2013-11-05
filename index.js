
module.exports = function(mongoose) {
  'use strict';
  var model = require('./models/ref')(mongoose);
  var ref_ctrl = require('./controllers/ref')(mongoose);

  return {
    model: model
  , ctrl: ref_ctrl
  };
};
