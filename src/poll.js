import WordpressConnector from './connector';
import logger from '@hoist/logger';
import Moment from 'moment'
import errors from '@hoist/errors';
import config from 'config';
import url from 'url';
import moment from 'moment';

var ConnectorRequiresAuthorizationError = errors.create({name: 'ConnectorRequiresAuthorizationError'});

class WordpressPoller {
  constructor (context) {
    this._logger = logger.child({cls: this.constructor.name, subscription: context.subscription._id, application: context.application._id});
    this._context = context;
    this._connector = new WordpressConnector(context.settings);
  }
  poll () {
    return this.assertCanPoll().then(() => {
      return this.pollForChanges();
    }).then(() => {
      this._context.subscription.delayTill(moment().add(1, 'minutes').toDate());
    }).catch((err) => {
      this._logger.error(err);
      if (!(err instanceof ConnectorRequiresAuthorizationError)) {
        this._logger.alert(err);
      }
      this._context.subscription.delayTill(moment().add(1, 'minutes').toDate());
    });
  }
  assertCanPoll () {
    return Promise.resolve().then(() => {
      this._logger.info('checking credentials');
      if (!(this._context.authorization)) {
        this._logger.warn('Connector needs auth and no auth set');
        //we've already setup this subscription
        this._context.subscription.delayTill(new Moment().add(1, 'hour').toDate());
        throw new ConnectorRequiresAuthorizationError();
      }
      if (!this._context.authorization.get('SubscriptionProject')) {
        this._logger.warn('Connector needs a subscription site and none set');
        //we've already setup this subscription
        this._context.subscription.delayTill(new Moment().add(1, 'hour').toDate());
        throw new ConnectorRequiresAuthorizationError();
      }
      this._connector.authorize(this._context.authorization);
    });
  }
  pollForChanges () {
    return Promise.resolve().then(() => {
      return Promise.all(this._context.subscription.endpoints.map((endpoint) => {
        return this.generateUrlForEndpoint(endpoint);
      }));
    }).then((urls) => {
      return this.batchRequest(urls.map(u => u.req)).then((result) => {
        return Promise.all(this._context.subscription.endpoints.map((endpoint) => {
          return this.saveResultForEndpoint(endpoint, urls, result);
        }));
      })
    });
  }
  generateUrlForEndpoint (endpoint) {
    return Promise.resolve().then(() => {

      let req = `/sites/${this._context.authorization.get('SubscriptionProject')}/${endpoint.toLowerCase()}`;
      let query = '';
      let filterDate = (this._context.subscription.get(endpoint) || {}).lastResultDate;
      if (filterDate) {
        query += `after=${moment(filterDate).toISOString()}`;
      }
      if (endpoint === 'Comments') {
        if (query.length > 0) {
          query += "&";
        }
        query += 'status=all';
      }
      if (query) {
        req = `${req}?${query}`;
      }
      return {endpoint, req};
    });
  }
  batchRequest (urls) {
    return Promise.resolve(urls.map(req => encodeURIComponent(req)).join('&urls[]=')).then((urlQuery) => {
      console.log(urlQuery);
      return this._connector.get(`/batch?urls[]=${urlQuery}`);
    });
  }
  saveResultForEndpoint (endpoint, urls, result) {
    return Promise.resolve().then(() => {
      let url = urls.find((u) => u.endpoint === endpoint).req;
      console.log(result, url);
      let resultsForEndpoint = result[url];
      if (resultsForEndpoint.found < 1) {
        return;
      } else {
        let documents = resultsForEndpoint[endpoint.toLowerCase()];
        return Promise.all(documents.map((document) => this.raise(endpoint, document))).then(() => {
          return documents.map((d) => moment(d.date)).sort().pop().toDate();
        }).then((lastResultDate) => {
          this._context.subscription.set(endpoint, {lastResultDate});
        });
      }
    });
  }
  raise (endpoint, document) {
    return Promise.resolve().then(() => {
      return this.emit(`${this._context.connectorKey}:new:${endpoint.toLowerCase()}`, document);
    });
  }
}

export default function (context, raiseMethod) {
  let poller = new WordpressPoller(context);
  poller.emit = raiseMethod;
  return poller.poll();
};
