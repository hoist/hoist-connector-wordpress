'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _hoistOauthConnector = require('@hoist/oauth-connector');

var _lodash = require('lodash');

var overrides = {
  baseSite: 'https://public-api.wordpress.com',
  accessTokenPath: '/oauth2/token',
  authorizationPath: '/oauth2/authorize'
};
var apiBaseUri = 'https://public-api.wordpress.com/rest/v1.1';
/**
   * A Hoist Connector for connecting to GitLab
   * @extends {OAuth2ConnectorBase}
   */

var WordpressConnector = (function (_OAuth2ConnectorBase) {
  _inherits(WordpressConnector, _OAuth2ConnectorBase);

  /**
   * create a new connector
   * @param {object} configuration - the configuration properties to use
   * @param {string} configuration.clientId - the OAuth2 client id
   * @param {string} configuration.clientSecret - the OAuth2 client secret
   */

  function WordpressConnector(configuration) {
    _classCallCheck(this, WordpressConnector);

    _get(Object.getPrototypeOf(WordpressConnector.prototype), 'constructor', this).call(this, (0, _lodash.merge)({}, configuration, overrides));
    this._clientId = configuration.clientId;
    this._configuration = configuration;
  }

  /**
   * @external {OAuth2ConnectorBase} https://doc.esdoc.org/github.com/hoist/oauth-connector/class/src/oauth2_connector.js~OAuth2ConnectorBase.html
   */

  /**
   * @private
   * @param AuthorizationStore authorization the users authorisation store
   * @returns Promise<object> an object containing key value pairs to send with the client to the authorization url
   */

  _createClass(WordpressConnector, [{
    key: '_authorizeParams',
    value: function _authorizeParams(authorization) {
      return _get(Object.getPrototypeOf(WordpressConnector.prototype), '_authorizeParams', this).call(this, authorization).then(function (params) {
        params.response_type = "code";
        params.scope = 'global';
        return params;
      });
    }

    //use authorization params as it has redirect uri
  }, {
    key: '_accessParams',
    value: function _accessParams(authorization) {
      return _get(Object.getPrototypeOf(WordpressConnector.prototype), '_authorizeParams', this).call(this, authorization).then(function (params) {
        return params || {};
      }).then(function (params) {
        params.grant_type = "authorization_code";
        return params;
      });
    }
  }, {
    key: 'get',
    value: function get(path) {
      var uri = '' + apiBaseUri + path;
      return this._performRequest('GET', uri).then(function (result) {
        return JSON.parse(result[0]);
      });
    }
  }, {
    key: 'post',
    value: function post(path, body) {
      var uri = '' + apiBaseUri + path;
      return this._performRequest('POST', uri, body).then(function (result) {
        return JSON.parse(result[0]);
      });
    }
  }, {
    key: 'put',
    value: function put(path, body) {
      var uri = '' + apiBaseUri + path;
      return this._performRequest('PUT', uri, body).then(function (result) {
        return JSON.parse(result[0]);
      });
    }
  }, {
    key: 'patch',
    value: function patch(path, body) {
      var uri = '' + apiBaseUri + path;
      return this._performRequest('PATCH', uri, body).then(function (result) {
        return JSON.parse(result[0]);
      });
    }
  }, {
    key: 'delete',
    value: function _delete(path) {
      var uri = '' + apiBaseUri + path;
      return this._performRequest('DELETE', uri).then(function (result) {
        return JSON.parse(result[0]);
      });
    }
  }], [{
    key: 'defaultSettings',
    value: function defaultSettings() {
      return Promise.resolve({});
    }
  }]);

  return WordpressConnector;
})(_hoistOauthConnector.OAuth2ConnectorBase);

exports['default'] = WordpressConnector;
module.exports = exports['default'];
//# sourceMappingURL=connector.js.map
