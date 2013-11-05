/*jshint node:true*/
'use strict';

module.exports = {
  port: 3030
, host: 'localhost'
, db: 'mongodb://localhost/jab_ref_test'
};


if (module === require.main) {
  // just show the configs
  console.log(exports);
  process.exit(0);
}