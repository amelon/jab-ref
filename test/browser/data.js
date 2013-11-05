var refs = [
  {
   _id: 'obj.fd.co'
  , ref_id: 'obj.fd.co'
  , meta: {obj: 'obj', fd: 'fd'}
  , code: 'co'
  , name: 'super name'
  , order: 1
  , active: true
  , updatedAt: "2013-11-04T12:32:19.912Z"
  }
, {
   _id: 'obj.fd.c2'
  , ref_id: 'obj.fd.c2'
  , meta: {obj: 'obj', fd: 'fd'}
  , code: 'c2'
  , name: 'super name 2'
  , order: 2
  , active: true
  , updatedAt: "2013-11-04T12:32:19.910Z"
  }
, {
   _id: 'obj.afd.co'
  , ref_id: 'obj.afd.co'
  , meta: {obj: 'obj', fd: 'afd'}
  , code: 'co'
  , name: 'different meta'
  , order: 1
  , active: true
  , updatedAt: "2013-11-04T12:32:19.910Z"
  }
];

var remote_timestamp = '2013-11-04T12:32:19.921Z';

window.jabber_data = {
  refs: {
    items: refs
  , timestamp: remote_timestamp
  }

, ref_ts: {
    updatedAt: remote_timestamp
  , _id: "whatever"
  }

, remote_ts: remote_timestamp
};

