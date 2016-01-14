import WordpressConnector from '../../lib/connector';
import config from 'config';
import {expect} from 'chai';
import moment from 'moment';
describe('batch api', function () {
  this.timeout(5000);
  describe('get posts and comments', () => {
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
      return connector.get('/batch?urls[]=/sites/105230485/posts&urls[]=/sites/105230485/comments?status=all').then((result) => {
        _result = result;
      });

    });
    it('returns correct response', () => {
      return expect(_result['/sites/105230485/posts'].found).to.be.greaterThan(0);
    });
    it('can extract latest comment', () => {
      console.log(_result);
      let dates = _result['/sites/105230485/comments?status=all'].comments.map((c) => moment(c.date)).sort().pop();
      console.log(dates);
    });
  });
});
