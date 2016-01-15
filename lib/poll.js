'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _connector = require('./connector');

var _connector2 = _interopRequireDefault(_connector);

var _hoistLogger = require('@hoist/logger');

var _hoistLogger2 = _interopRequireDefault(_hoistLogger);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _hoistErrors = require('@hoist/errors');

var _hoistErrors2 = _interopRequireDefault(_hoistErrors);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _moment3 = _interopRequireDefault(_moment);

var ConnectorRequiresAuthorizationError = _hoistErrors2['default'].create({ name: 'ConnectorRequiresAuthorizationError' });

var WordpressPoller = (function () {
  function WordpressPoller(context) {
    _classCallCheck(this, WordpressPoller);

    this._logger = _hoistLogger2['default'].child({ cls: this.constructor.name, subscription: context.subscription._id, application: context.application._id });
    this._context = context;
    this._connector = new _connector2['default'](context.settings);
  }

  _createClass(WordpressPoller, [{
    key: 'poll',
    value: function poll() {
      var _this = this;

      return this.assertCanPoll().then(function () {
        return _this.pollForChanges();
      }).then(function () {
        _this._context.subscription.delayTill((0, _moment3['default'])().add(1, 'minutes').toDate());
      })['catch'](function (err) {
        _this._logger.error(err);
        if (!(err instanceof ConnectorRequiresAuthorizationError)) {
          _this._logger.alert(err);
        }
        _this._context.subscription.delayTill((0, _moment3['default'])().add(1, 'minutes').toDate());
      });
    }
  }, {
    key: 'assertCanPoll',
    value: function assertCanPoll() {
      var _this2 = this;

      return Promise.resolve().then(function () {
        _this2._logger.info('checking credentials');
        if (!_this2._context.authorization) {
          _this2._logger.warn('Connector needs auth and no auth set');
          //we've already setup this subscription
          _this2._context.subscription.delayTill(new _moment2['default']().add(1, 'hour').toDate());
          throw new ConnectorRequiresAuthorizationError();
        }
        if (!_this2._context.authorization.get('SubscriptionProject')) {
          _this2._logger.warn('Connector needs a subscription site and none set');
          //we've already setup this subscription
          _this2._context.subscription.delayTill(new _moment2['default']().add(1, 'hour').toDate());
          throw new ConnectorRequiresAuthorizationError();
        }
        _this2._connector.authorize(_this2._context.authorization);
      });
    }
  }, {
    key: 'pollForChanges',
    value: function pollForChanges() {
      var _this3 = this;

      return Promise.resolve().then(function () {
        return Promise.all(_this3._context.subscription.endpoints.map(function (endpoint) {
          return _this3.generateUrlForEndpoint(endpoint);
        }));
      }).then(function (urls) {
        return _this3.batchRequest(urls.map(function (u) {
          return u.req;
        })).then(function (result) {
          return Promise.all(_this3._context.subscription.endpoints.map(function (endpoint) {
            return _this3.saveResultForEndpoint(endpoint, urls, result);
          }));
        });
      });
    }
  }, {
    key: 'generateUrlForEndpoint',
    value: function generateUrlForEndpoint(endpoint) {
      var _this4 = this;

      return Promise.resolve().then(function () {

        var req = '/sites/' + _this4._context.authorization.get('SubscriptionProject') + '/' + endpoint.toLowerCase();
        var query = '';
        var filterDate = (_this4._context.subscription.get(endpoint) || {}).lastResultDate;
        if (filterDate) {
          query += 'after=' + (0, _moment3['default'])(filterDate).toISOString();
        }
        if (endpoint === 'Comments') {
          if (query.length > 0) {
            query += "&";
          }
          query += 'status=all';
        }
        if (query) {
          req = req + '?' + query;
        }
        return { endpoint: endpoint, req: req };
      });
    }
  }, {
    key: 'batchRequest',
    value: function batchRequest(urls) {
      var _this5 = this;

      return Promise.resolve(urls.map(function (req) {
        return encodeURIComponent(req);
      }).join('&urls[]=')).then(function (urlQuery) {
        console.log(urlQuery);
        return _this5._connector.get('/batch?urls[]=' + urlQuery);
      });
    }
  }, {
    key: 'saveResultForEndpoint',
    value: function saveResultForEndpoint(endpoint, urls, result) {
      var _this6 = this;

      return Promise.resolve().then(function () {
        var url = urls.find(function (u) {
          return u.endpoint === endpoint;
        }).req;
        console.log(result, url);
        var resultsForEndpoint = result[url];
        console.log(resultsForEndpoint);
        var previousIdList = (_this6._context.subscription.get(endpoint) || {}).idList;
        previousIdList = previousIdList || [];
        var documents = resultsForEndpoint[endpoint.toLowerCase()].filter(function (document) {
          return previousIdList.every(function (id) {
            return document.ID !== id;
          });
        });
        if (documents.length < 1) {
          return;
        } else {
          return Promise.all(documents.map(function (document) {
            return _this6.raise(endpoint, document);
          })).then(function () {
            return documents.map(function (d) {
              return (0, _moment3['default'])(d.date);
            }).sort().pop().toDate();
          }).then(function (lastResultDate) {

            return {
              lastResultDate: lastResultDate,
              idList: previousIdList.concat(documents.map(function (document) {
                return document.ID;
              }))
            };
          }).then(function (data) {
            _this6._context.subscription.set(endpoint, data);
          });
        }
      });
    }
  }, {
    key: 'raise',
    value: function raise(endpoint, document) {
      var _this7 = this;

      return Promise.resolve().then(function () {
        return _this7.emit(_this7._context.connectorKey + ':new:' + endpoint.toLowerCase(), document);
      });
    }
  }]);

  return WordpressPoller;
})();

exports['default'] = function (context, raiseMethod) {
  var poller = new WordpressPoller(context);
  poller.emit = raiseMethod;
  return poller.poll();
};

;
module.exports = exports['default'];
//# sourceMappingURL=poll.js.map
