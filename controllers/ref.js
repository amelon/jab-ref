function mapC(fn) {
  return function mapCFinal(arr) {
    return arr.map(fn)
  }
}

module.exports = function(mongoose) {
  var Ref = require('../models/ref')(mongoose)

  function used() {
    return Ref.used().exec()
      .then( mapC( item => item.toJSON() ) )
      .then(items => {
        return Ref.timestamp().exec()
          .then(maxItem => (
            { timestamp: maxItem.updatedAt, items: items }
          ))
      })
  }


  return {
    timestamp(req, res, next) {
      Ref.timestamp().exec()
      .then(item => res.send(item))
      .catch(next)
    },

    used(req, res, next) {
      used()
      .then(results => res.send(results))
      .catch(next)
    },
  }
}
