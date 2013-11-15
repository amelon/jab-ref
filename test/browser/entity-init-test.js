/* global describe, it, chai, before, after, sinon, jabber_data*/

var assert = chai.assert;
var  App = JabberApp;


/**
 * [initServer description]
 * @param  {[type]} ctx [description]
 * @return {[type]}     [description]
 */
function initServer(ctx) {
  ctx.server.respondWith('GET', 'ref', [200, { 'Content-Type': 'application/json'},
    JSON.stringify(jabber_data.refs)
  ]);

  ctx.server.respondWith('GET', 'ref/timestamp', [200, { 'Content-Type': 'application/json'},
    JSON.stringify(jabber_data.ref_ts)
  ]);

  App.execute('ref:entities:clear');

  // error detection
  App.vent.on('ref:entities:error', function(err) {
    throw new Error(JSON.stringify(err));
  });

  ctx.ajaxSpy = sinon.spy($, "ajax");
}


before(function() {
  this.server = sinon.fakeServer.create();
});

after(function() {
  this.server.restore();
});

describe('Ref entities', function() {
  it('should be defined when app started', function() {
    assert(JabberApp);
    JabberApp.start({environment: 'test'});
    assert(JabberApp.Entities.Ref);
    assert(JabberApp.Entities.RefCollection);
  });

  describe('Syncing (after store cleared)', function() {
    before(function() {
      initServer(this);
    });

    after(function() {
      $.ajax.restore();
    });

    it('should have no local timestamp', function() {
      assert.notOk(App.request('ref:entities:timestamp:local'));
    });

    describe('no remote timestamp provided', function() {

      it('should synced directly', function(done) {
        var ref_length = jabber_data.refs.items.length;
        var ajaxSpy = this.ajaxSpy;

        App.vent.once('ref:entities:synced', function(refs) {
          assert.equal(refs.length, ref_length);
          assert(ajaxSpy.calledOnce);
          assert(ajaxSpy.getCall(0).args[0].url == 'ref');
          done();
        });

        App.execute('ref:entities:init');
        this.server.respond();
      });

      it('should have local timestamp once synced', function() {
        assert(App.request('ref:entities:timestamp:local'));
      });


      it('should only check remote ts on second call', function(done) {
        var ajaxSpy = this.ajaxSpy;
        var ref_length = jabber_data.refs.items.length;

        // reset spy
        ajaxSpy.reset();

        App.vent.once('ref:entities:synced', function(refs) {
          assert(ajaxSpy.calledOnce);
          assert.equal(ajaxSpy.getCall(0).args[0].url, 'ref/timestamp');
          assert.equal(refs.length, ref_length);
          done();
        });

        App.execute('ref:entities:init');
        this.server.respond();
      });

    });

    describe('with remote timestamp provided', function() {
      it('should not call ajax with uptodate local ts', function(done) {
        var ajaxSpy = this.ajaxSpy;
        var ref_length = jabber_data.refs.items.length;

        var remote_ts = +new Date(jabber_data.remote_ts);

        // reset spy
        ajaxSpy.reset();

        App.vent.once('ref:entities:synced', function(refs) {
          assert.equal(ajaxSpy.callCount, 0);
          assert.equal(refs.length, ref_length);
          done();
        });

        App.execute('ref:entities:init', remote_ts);
        this.server.respond();
      });


      it('should call ref with outdated local ts', function(done) {
        var ajaxSpy = this.ajaxSpy;
        var ref_length = jabber_data.refs.items.length;

        var remote_ts = +new Date();

        // reset spy
        ajaxSpy.reset();

        App.vent.once('ref:entities:synced', function(refs) {
          assert.equal(ajaxSpy.callCount, 1);
          assert.equal(refs.length, ref_length);
          assert(ajaxSpy.getCall(0).args[0].url == 'ref');
          done();
        });

        App.execute('ref:entities:init', remote_ts);
        this.server.respond();
      });
    });

  });


  describe('Meta', function() {
    before(function() {
      initServer(this);
    });

    after(function() {
      $.ajax.restore();
    });

    describe('without init', function() {
      it('should throw error', function() {
        var fn = function() {
          App.request('ref:entities:meta', 'obj.fd');
        };
        assert.throw(fn);

      });
    });

    describe('after init', function() {
      before(function(done) {
        App.vent.once('ref:entities:synced', function(refs) {
          done();
        });

        App.execute('ref:entities:init');
        this.server.respond();
      });

      it('should not throw error', function() {
        var fn = function() {
          App.request('ref:entities:meta', 'obj.fd');
        };
        assert.doesNotThrow(fn);
      });


      it('should throw error with invalid meta format', function() {
        var fn = function() {
          App.request('ref:entities:meta', 'obj');
        };
        assert.throw(fn);

        var fn = function() {
          App.request('ref:entities:meta', {});
        };
        assert.throw(fn);

        var fn = function() {
          App.request('ref:entities:meta', {obj: 'obj'});
        };
        assert.throw(fn);

        var fn = function() {
          App.request('ref:entities:meta', {obj: 'obj', fd: false });
        };
        assert.throw(fn);
      });


      it('should not throw error with valid meta format', function() {
        var fn = function() {
          App.request('ref:entities:meta', 'obj.fd');
        };
        assert.doesNotThrow(fn);

        var fn = function() {
          App.request('ref:entities:meta', {obj: 'obj', fd: 'fd' });
        };
        assert.doesNotThrow(fn);
      });

      it('should return array', function() {
        var refs = App.request('ref:entities:meta', 'obj.fd');

        assert.typeOf(refs, 'array');
        assert.equal(refs.length, 2);

        refs = App.request('ref:entities:meta', {obj: 'obj', fd: 'fd'});
        assert.typeOf(refs, 'array');
        assert.equal(refs.length, 2);

        refs = App.request('ref:entities:meta', {obj: 'obj', fd: 'afd'});
        assert.typeOf(refs, 'array');
        assert.equal(refs.length, 1);

        refs = App.request('ref:entities:meta', 'obj.unknown');
        assert.typeOf(refs, 'array');
        assert.equal(refs.length, 0);

      });


      describe.only('#attrs', function() {
        it('should return array with filtered attributes', function() {
           var refs = App.request('ref:entities:meta', 'obj.fd');

           _.each(refs.attrs(), function(item) {
            assert(_.has(item, 'id'));
            assert.notOk(_.has(item, 'name'));
           });

           _.each(refs.attrs('name'), function(item) {
            assert(_.has(item, 'id'));
            assert(_.has(item, 'name'));
           });

           _.each(refs.attrs('name', 'code'), function(item) {
            assert(_.has(item, 'id'));
            assert(_.has(item, 'name'));
            assert(_.has(item, 'code'));
           });

        });
      });

    });

  });


  describe('Ref', function() {

    before(function() {
      initServer(this);
    });

    after(function() {
      $.ajax.restore();
    });

    describe('before init', function() {
      it('should throw error', function() {
        var fn = function() {
          App.request('ref:entity', 'obj.fd.co');
        };
        assert.throw(fn);

      });
    });


    describe('after init', function() {
      before(function(done) {
        console.log('before in after init');
        App.vent.once('ref:entities:synced', function(refs) {
          done();
        });

        App.execute('ref:entities:init');
        this.server.respond();
      });

      it('should not throw error', function() {
        var fn = function() {
          App.request('ref:entity', 'obj.fd.co');
        };
        assert.doesNotThrow(fn);
      });

      it('should return a ref with valid key', function() {
        var id = 'obj.fd.co';
        var ref = App.request('ref:entity', id);
        assert(ref);
        assert.equal(ref.get('_id'), id );
      });

      it('should return a ref with valid search object', function() {
        var id = 'obj.fd.co';
        var ref = App.request('ref:entity', { _id: id });
        assert(ref);
        assert.equal(ref.get('_id'), id );
      });

      it('should return null with invalid key or search object', function() {
        var id = 'obj.fd.cxx';
        var ref = App.request('ref:entity', id);
        assert.isNull(ref);
      });


      describe('#attrs', function() {
        it('should return object', function() {
          var ref = App.request('ref:entity', 'obj.fd.co');

          assert.isObject(ref.attrs('name'));
          assert.isObject(ref.attrs('name', 'unknown_attrs'));
          assert.isObject(ref.attrs());
        });

        describe('returned object', function() {
          it('should always contains ref_id attr as id key', function() {
            var ref    = App.request('ref:entity', 'obj.fd.co');
            var ref_id = ref.get('ref_id');
            var res    = ref.attrs('name');

            assert(res.id && res.id == ref_id);


            res = ref.attrs();
            assert(res.id && res.id == ref_id);


            res = ref.attrs('name', 'code');
            assert(res.id && res.id == ref_id);


            res = ref.attrs('name', 'code', 'unknown_attr');
            assert(res.id && res.id == ref_id);

          });

          it('should contains all args list as key', function() {
            var ref    = App.request('ref:entity', 'obj.fd.co');
            var res    = ref.attrs('name');

            assert(res.name && res.name == ref.get('name'));

            res = ref.attrs('toto', 'titi');
            // use _.has because assert.property assume property to be defined
            //  in our case, property is present in object but value of property is undefined
            assert(_.has(res, 'toto'));
            assert(_.has(res, 'titi'));
          });

        })
      });

    });


  });
});