
module.exports = function(mongoose) {
  return {
    model: require('./models/ref')(mongoose),
    ctrl: require('./controllers/ref')(mongoose)
  }
}
