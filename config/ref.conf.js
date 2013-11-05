var refs = [
 {
    full: 'module.type'
  , shrt: 'mod.type'
  // pattern: short meta +'.'+ list[].code
  // , parent: 'mod.type.autodiag'
  , list: [
      {
        code: 'autodiag'
      , name: 'Auto-diagnostic'
      // default to true
      // , active: true
      // pattern: same as parent
      // , ref_id
      }
    , {
        code: 'eval'
      , name: 'Evaluation'
      }
    ]
  }

, {
    full: 'content.type'
  , shrt: 'cont.ty'
  , list: [
      { code: 'autodiag', name: 'Auto-diagnostic' }
    , { code: 'prez', name: 'Présentation' }
    , { code: 'unused', name: 'Unused', unused: true }
    ]
  }
];


module.exports = refs;