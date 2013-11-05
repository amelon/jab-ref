function refUrl(url, store) {
  function ref(Entities, App, Backbone, Marionette, $, _) {

    url = url || 'ref';

    var Model = Entities.Model || Backbone.Model;
    var Collection = Entities.Collection || Backbone.Collection;

    Entities.Ref = Model.extend({
      urlRoot: url
    , idAttribute: '_id'
    });

    Entities.RefCollection = Collection.extend({
      model: Entities.Ref
    , url: url

    , parse: function(response) {
        var remote_ts = +new Date(response.timestamp);
        API.setLocalTimestamp(remote_ts);

        return response.items;
      }
    });


    var API = {
      refs: new Entities.RefCollection()
    , store: store.namespace('ref:entities')
    , initialized: false

    , init: function(remote_ts) {
        var local_ts = this.getLocalTimestamp();

        this.initialized = true;

        // if no localtimestamp, we load all refs
        if (!local_ts) {
          this.syncRefs();

        // if no remote_ts provided, we get one
        } else if (!remote_ts) {
          this.getRemoteTimestamp()
            .done(function(item) {
              remote_ts = +new Date(item.updatedAt);
              API.outdatedTimestamp(remote_ts);
            });

        // third case: local ts present and remote timestamp provided
        } else {
          this.outdatedTimestamp(remote_ts);
        }
        return this.refs;
      }

    , syncRefs: function() {
        this.loadRefs()
          .done(function() {
            App.vent.trigger('ref:entities:synced', API.refs);
            API.localStoreRefs();
          });
      }

    , outdatedTimestamp: function(remote_ts) {
        if (remote_ts > this.getLocalTimestamp()) {
          this.syncRefs();
        } else {
          // trigger synced if no synced needed
          API.localLoadRefs();
          App.vent.trigger('ref:entities:synced', this.refs);
        }
      }

    , loadRefs: function() {
        var _fetch = this.refs.fetch({ reset: true });
        var refs = this.refs

        // _fetch is a promised object
        _fetch
          .fail(function(xhr, text_status, error) {
            App.vent.trigger('ref:entities:error', {code: 'ref:entities:init:error:', msg: error, status: text_status, url: refs.url, type: 'ajax'});
            App.vent.trigger('error', {code: 'ref:entities:init:error:', msg: error, status: text_status, url: refs.url, type: 'ajax'});
          });

        return _fetch;
      }



    , getRemoteTimestamp: function() {
        var ref = new Entities.Ref({ _id: 'timestamp' });
        var _fetch = ref.fetch();

        _fetch
          .fail(function(xhr, text_status, error) {
            App.vent.trigger('ref:entities:error', {code: 'ref:entities:init:error:remote_ts', msg: error, url: ref.url(), status: text_status, type: 'ajax'});
            App.vent.trigger('error', {code: 'ref:entities:init:error:remote_ts', msg: error, url: ref.url(), status: text_status, type: 'ajax'});
          });

        return _fetch;
      }


    , localLoadRefs: function() {
        var refs = this.store('refs');
        this.refs.reset(refs);
      }

    , localStoreRefs: function() {
        this.store('refs', this.refs.toJSON());
      }

    , getLocalTimestamp: function() {
        var loc_ts = this.store('timestamp');
        return loc_ts;
      }

    , setLocalTimestamp: function(ts) {
        this.store('timestamp', ts);
      }

    , clear: function() {
        this.store(false);
        this.refs = new Entities.RefCollection();
        this.initialized = false;
      }

    , getMeta: function(meta) {
        if (!this.initialized) throw new Error('Ref not initialized');
        if (_.isEmpty(meta)) throw new Error('meta is empty');

        var search = {obj: '', fd: ''};

        if (_.isFunction(meta)) {
          meta = meta();
        }

        if (_.isString(meta)) {
          meta = meta.split('.');
          if (meta.length < 2) throw new Error('meta format is incorrect (expected format `obj.fd`, provided '+ meta+ ')');
          search.obj = meta[0];
          search.fd = meta[1];

        } else {
          search.obj = meta.obj || false;
          search.fd = meta.fd || false;
          if (!_.every(search)) {
            throw new Error('missing meta data in object '+JSON.stringify(search));
          }
        }
        return this.where(search);
      }

    , where: function(search) {
        return _.where(this.refs.models, { attributes: {meta: search} });
      }
    };

    App.reqres.setHandler('ref:entities:clear', function() {
      API.clear();
    });


    App.reqres.setHandler('ref:entities:timestamp:local', function() {
      return API.getLocalTimestamp();
    });


    App.reqres.setHandler('ref:entities:init', function(timestamp) {
      return API.init(timestamp);
    });

    App.reqres.setHandler('ref:entities:meta', function(meta) {
      return API.getMeta(meta);
    });


  }
  return ref;
}


function load(App, url, store) {
  App.module('Entities', refUrl(url, store));
}

module.exports = load;