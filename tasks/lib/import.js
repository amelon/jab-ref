module.exports = function(mongoose) {
  var Promise = require('bluebird')
  var Ref       = require('../../models/ref')(mongoose)

  function findById(id) {
    return Ref.findOneAsync({ _id: id })
  }

  function save(id, ref, data) {
    var nref = ref || new Ref()
    nref.set(data)
    return nref.saveAsync()
      .then(() => console.log('row saved', data._id))
  }

  function processRow(id, row) {
    return findById(id)
      .then(ref => save(id, ref, row))
  }

  function saveRows(rows) {
    // async save sequentialy - http://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
    return Promise.each(
      rows,
      row => processRow(row._id, row)
    )
  }

  return saveRows
}
