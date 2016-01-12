import WordpressConnector from '../../lib/connector';
import sinon from 'sinon';
import config from 'config';
import {expect} from 'chai';
import Nightmare from 'nightmare';
import url from 'url';
import os from 'os';

let osType = os.type();
describe('authorization steps', function () {
  let connector;
  let clientId = config.get('clientId');
  let clientSecret = config.get('clientSecret');
  let nightmare;

  before(function () {
    if (osType !== 'Linux') {
      nightmare = Nightmare({show: true});
    }
    connector = new WordpressConnector({clientId, clientSecret});

  });
  after(function () {
    if (osType !== 'Linux') {
      return nightmare.end();
    }
  })
  describe('on first bounce', () => {
    let bounce;
    before(function () {

      bounce = {
        get: function () {
          return undefined;
        },
        delete: function () {
          return Promise.resolve(null);
        },
        set: function () {
          console.log('set', arguments);
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
      sinon.spy(bounce, 'get');
      sinon.spy(bounce, 'set');
      sinon.spy(bounce, 'redirect');
      return connector.receiveBounce(bounce);
    });
    it('should save current step', () => {
      return expect(bounce.set).to.have.been.calledWith('currentStep', 'authorization');
    });
    it('should receive a redirect', () => {
      return expect(bounce.redirect).to.have.been.calledWith(`https://public-api.wordpress.com/oauth2/authorize?redirect_uri=https%3A%2F%2Fbouncer.hoist.test%2Fbounce&response_type=code&scope=global&client_id=${clientId}`);
    });
  });
  describe('on return from Wordpress', function () {
    let bounce;
    this.timeout(50000);
    let uri;

    before(function () {
      if (osType === 'Linux') {
        this.skip();
      }
      bounce = {
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
      sinon.spy(bounce, 'get');
      sinon.spy(bounce, 'set');
      sinon.spy(bounce, 'redirect');
      return Promise.resolve(connector.receiveBounce(bounce)).then(function () {
        let authorizeUri = bounce.redirect.getCall(0).args[0];
        return Promise.resolve(nightmare.goto(authorizeUri));
      }).then(() => {
        return Promise.resolve(nightmare.type('#username', config.get('username')).type('#password', config.get('password')).click('.signin.button-primary'));
      }).then(() => {
        return Promise.resolve(nightmare.wait(500).exists('#message'));
      }).then((finished) => {
        if (finished) {
          Promise.resolve(nightmare.url())
        } else {
          return Promise.resolve(nightmare.click('.button-primary.approve').wait('#message').url());
        }
      }).then((u) => {
        console.log(u);
        uri = url.parse(u, true);
        bounce.query = uri.query;
      }).then(() => {
        return connector.receiveBounce(bounce);
      });

    });
    it('should save state', () => {
      console.log(bounce.store);
      return expect(bounce.store['AccessToken']).to.exist;
    });
  })
});
