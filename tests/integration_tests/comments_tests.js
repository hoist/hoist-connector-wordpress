import WordpressConnector from '../../lib/connector';
import config from 'config';
import {expect} from 'chai';
describe('comments api', function () {
  this.timeout(5000);

  describe('get comments', () => {
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
      return connector.get('/sites/105230485/comments?after=2016-01-13T23:05:38.000Z&status=all').then((result) => {
        _result = result;
      });

    });
    it('returns correct response', () => {
      console.log(_result)
      return expect(_result.comments.length).to.be.greaterThan(0);
    });
  });

});
