
module.exports = transformMetaToRefs

//
// => ref = {_id: underscore(meta.full+'.'+ ref.code)}
function transformMetaToRefs(meta_list) {
  var meta_full = meta_list.full
  var ref_list = meta_list.list;
  var shrt = meta_list.shrt || meta_full;

  return ref_list.map((ref_o, i) => {
    var active = ref_o.active && true
    var _id = shrt + '.' + ref_o.code
    var mapping = Array.isArray(ref_o.mapping) ? ref_o.mapping : []
    var ref_id = ref_o.ref_id || _id
    var unused = ref_o.unused || false

    return {
      _id: _id,
      ref_id: ref_id,
      code: ref_o.code,
      name: ref_o.name,
      active: active,
      unused: unused,
      mapping: mapping,
      order: i + 1,
      meta: {
        full: meta_full,
        shrt: shrt,
      },
    }
    
  })
}
