module.exports = function(mongoose) {
  var Ref       = require('../../models/ref')(mongoose)

  function findById(id) {
    Ref.findOne({ _id: id }).exec()
  }
  function save(id, ref) {
    var nref = ref || new Ref()
    nref.set(data)
    return nref.save()
  }

  function processRow(id, data) {
    return findById(id)
      .then(ref => save(id, ref))
  }

  function saveRows(rows) {
    // async save sequentialy - http://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
    var p = new Promise()
    return rows.reduce((p, row) => (
      p.then(() => processRow(row._id, row))
    ))
  }

  return saveRows
}
