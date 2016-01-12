import WordpressConnector from './connector';
import logger from '@hoist/logger';
import Moment from 'moment'
import errors from '@hoist/errors';
import config from 'config';

var ConnectorRequiresAuthorizationError = errors.create({
  name: 'ConnectorRequiresAuthorizationError'
});

class WordpressPoller {
  constructor(context) {
    this._logger = logger.child({
      cls: this.constructor.name,
      subscription: context.subscription._id,
      application: context.application._id
    });
    this._context = context;
    this._connector = new WordpressConnector(context.settings);
  }
  poll() {
    return this.assertCanPoll()
      .then((hooksSetup) => {
        if (!hooksSetup) {
          return this.setupHook();
        }
      }).catch((err) => {
        this._logger.error(err);
        if (!(err instanceof ConnectorRequiresAuthorizationError)) {
          this._logger.alert(err);
        }
      });
  }
  assertCanPoll() {
    var hooksSetup = this._context.subscription.get('setup');
    return Promise.resolve()
      .then(() => {
        if (hooksSetup) {
          //we've already setup this subscription
          this._context.subscription.delayTill(new Moment().add(100, 'days').toDate());
        }
      })
      .then(() => {
        this._logger.info('checking credentials');
        if (!(this._context.authorization)) {
          this._logger.warn('Connector needs auth and no auth set');
          //we've already setup this subscription
          this._context.subscription.delayTill(new Moment().add(1, 'hour').toDate());
          throw new ConnectorRequiresAuthorizationError();
        }
        if (!this._context.authorization.get('SubscriptionProject')) {
          this._logger.warn('Connector needs a subscription project and none set');
          //we've already setup this subscription
          this._context.subscription.delayTill(new Moment().add(1, 'hour').toDate());
          throw new ConnectorRequiresAuthorizationError();
        }
      }).then(() => {
        return hooksSetup;
      });
  }
  setupHook() {
    return Promise.resolve()
      .then(() => {
        this._logger.info('setting connector authorization');
        return this._connector.authorize(this._context.authorization);
      }).then(() => {
        this._logger.info('creating webhook endpoint');
        let hookUri = `https://${config.get('Hoist.domains.endpoint')}/connector/${this._context.authorization._token.key}`;
        this._connector.post(`/projects/${this._context.authorization.get('SubscriptionProject')}/hooks`, {
          "url":hookUri,
          "push_events": true,
          "issues_events": true,
          "merge_requests_events": true,
          "tag_push_events": true,
          "note_events": true,
          "build_events": true
        });
      }).then(() => {
        this._logger.info('webhooks created');
        return this._context.subscription.set('setup', true);
      });
  }
}

export default function (context) {
  let poller = new WordpressPoller(context);
  return poller.poll();
};
