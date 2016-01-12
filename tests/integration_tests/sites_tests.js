import WordpressConnector from '../../lib/connector';
import config from 'config';
import {
  expect
}
from 'chai';
describe('get sites', function () {
  this.timeout(5000);
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
    connector = new WordpressConnector({
      clientId: config.get('clientId'),
      clientSecret: config.get('clientSecret')
    });
    authorization.set('AccessToken', config.get('accessToken'));
    connector.authorize(authorization)
    return connector.get('/me/sites')
      .then((result) => {
        console.log(result);
        _result = result;
      });

  });
  it('returns users projects', () => {
    return expect(_result.sites.map((site) => site.name)).to.contain('hoistio');
  });
});
