import WordpressConnector from '../../lib/connector';
import config from 'config';
import {expect} from 'chai';
describe('posts api', function () {
  this.timeout(5000);
  describe('create new post', () => {
    let authorization;
    let _result;
    let connector;
    let title = "Post created by Unit Test: " + new Date();
    before(() => {
      authorization = {
        store: {},
        get: function (key) {
          return this.store[key];
        },
        delete: function (key) {
          delete this.store[key];
          return Promise.resolve(null);
        },
        set: function (key, value) {
          this.store[key] = value;
          return Promise.resolve(null);
        },
        redirect: function () {
          console.log('redirect', arguments);
          return Promise.resolve(null);
        },
        done: function () {
          console.log('done', arguments);
          return Promise.resolve(null);
        }
      };
      connector = new WordpressConnector({clientId: config.get('clientId'), clientSecret: config.get('clientSecret')});
      authorization.set('AccessToken', config.get('accessToken'));
      connector.authorize(authorization)
      return connector.post('/sites/105230485/posts/new', {
        "title": title,
        "excerpt": "This is a test issue from the Hoist connector unit tests",
        "content": "This post was created as a test for hoist.io",
        "author": "hoistsupport"
      }).then((result) => {
        console.log(result);
        _result = result;
      });

    });
    it('returns correct response', () => {
      return expect(_result.title).to.eql(title);
    });
  });
  describe('get posts', () => {
    let authorization;
    let _result;
    let connector;
    before(() => {
      authorization = {
        store: {},
        get: function (key) {
          return this.store[key];
        },
        delete: function (key) {
          delete this.store[key];
          return Promise.resolve(null);
        },
        set: function (key, value) {
          this.store[key] = value;
          return Promise.resolve(null);
        },
        redirect: function () {
          console.log('redirect', arguments);
          return Promise.resolve(null);
        },
        done: function () {
          console.log('done', arguments);
          return Promise.resolve(null);
        }
      };
      connector = new WordpressConnector({clientId: config.get('clientId'), clientSecret: config.get('clientSecret')});
      authorization.set('AccessToken', config.get('accessToken'));
      connector.authorize(authorization)
      return connector.get('/sites/105230485/posts').then((result) => {
        _result = result;
      });

    });
    it('returns correct response', () => {
      return expect(_result.posts.length).to.be.greaterThan(0);
    });
  });
  describe('edit post', () => {
    let authorization;
    let _result;
    let connector;
    let title = "Post edited by Unit Test: " + new Date();
    before(() => {
      authorization = {
        store: {},
        get: function (key) {
          return this.store[key];
        },
        delete: function (key) {
          delete this.store[key];
          return Promise.resolve(null);
        },
        set: function (key, value) {
          this.store[key] = value;
          return Promise.resolve(null);
        },
        redirect: function () {
          console.log('redirect', arguments);
          return Promise.resolve(null);
        },
        done: function () {
          console.log('done', arguments);
          return Promise.resolve(null);
        }
      };
      connector = new WordpressConnector({clientId: config.get('clientId'), clientSecret: config.get('clientSecret')});
      authorization.set('AccessToken', config.get('accessToken'));
      connector.authorize(authorization)

      return connector.get('/sites/105230485/posts').then((r) => {
        let uri = `/sites/105230485/posts/${r.posts[0].ID}`
        return connector.post(uri, {"title": title}).then((result) => {
          _result = result;
        }).catch((err) => {
          console.log(err);
        });
      });

    });
    it('returns correct response', () => {
      return expect(_result.title).to.eql(title);
    });
  });
  describe('delete post', () => {
    let authorization;
    let _result;
    let connector;
    before(() => {
      authorization = {
        store: {},
        get: function (key) {
          return this.store[key];
        },
        delete: function (key) {
          delete this.store[key];
          return Promise.resolve(null);
        },
        set: function (key, value) {
          this.store[key] = value;
          return Promise.resolve(null);
        },
        redirect: function () {
          console.log('redirect', arguments);
          return Promise.resolve(null);
        },
        done: function () {
          console.log('done', arguments);
          return Promise.resolve(null);
        }
      };
      connector = new WordpressConnector({clientId: config.get('clientId'), clientSecret: config.get('clientSecret')});
      authorization.set('AccessToken', config.get('accessToken'));
      connector.authorize(authorization)

      return connector.get('/sites/105230485/posts?status=publish').then((r) => {
        let uri = `/sites/105230485/posts/${r.posts[0].ID}/delete`
        return connector.post(uri, {}).then((result) => {
          _result = result;
        }).catch((err) => {
          console.log(err);
        });
      });

    });
    it('returns correct response', () => {
      return expect(_result.status).to.eql('trash');
    });
  });
});
