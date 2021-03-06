var Ref
var Promise  = require("bluebird")

function find(predicate, list) {
  var l = list.length
  for (var i = 0; i < l; i++) {
    if (predicate(list[i]) === true) return list[i]
  }
  return false
}

module.exports = function(mongoose) {
  if (Ref) return Ref
  var Schema = mongoose.Schema
  var mymongoose = Promise.promisifyAll(mongoose)

  var RefSchema = new Schema({
    // manually defined - underscore version of meta + code
    // eg comp_type_inst
    _id: { type: String, required: true },
    // default equal to _id
    // special use case for ref depending on ref (shallow copy)
    // when ref_id != _id, it means this ref is a copy of a ref (where _id = ref_id)
    ref_id: { type: String, required: true },
    // if not defined, should be a short value of name
    code: { type: String, required: true },
    name: { type: String, required: true },
    // meta should be formed by object.field or obj.fld (eg comp.type or company.type or comp.ty)
    meta: {
      obj: { type: String, required: true },
      fd: { type: String, required: true },
    },
    active: { type: Boolean, 'default': true },
    unused: { type: Boolean, 'default': false },
    order: { type: Number },
    mapping: [String],
    // reference RefSchema _id to build hierarchy (métier -> métier détaillé)
    parent: String,
    createdAt: Date,
    updatedAt: Date,
  })

  RefSchema.virtual('meta.full').get(function() {
    return this.meta.obj +'.'+ this.meta.fd
  })

  RefSchema.pre('save', function (next) {
    if (this.isNew) {
      this.createdAt = new Date()
      this.updatedAt = this.createdAt
    } else {
      this.updatedAt = new Date()
    }
    next()
  })


  RefSchema.virtual('meta.full').set(function(meta) {
    var split = meta.split('.')
    this.meta.obj = split[0]
    this.meta.fd = split[1]
  })


  RefSchema.statics.timestamp = function() {
    return this.findOne().select('updatedAt').sort('-updatedAt').execAsync()
  }

  RefSchema.statics.used = function() {
    return this.findAsync({unused: false})
  }

  RefSchema.statics.meta = function(shortMeta) {
    return this.findAsync({_id: new RegExp('^'+shortMeta)})
  }


  Ref = mymongoose.model('Ref', RefSchema)

  return Ref
}
