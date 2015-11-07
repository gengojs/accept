'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _2 = require('../');

var _3 = _interopRequireDefault(_2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _koaConvert = require('koa-convert');

var _koaConvert2 = _interopRequireDefault(_koaConvert);

require('babel-polyfill');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (opt) {
  'use strict';

  var methods = ['getAcceptLanguage', 'getLocale', 'getFromHeader', 'getFromQuery', 'getFromDomain', 'getFromSubdomain', 'getFromCookie', 'getFromUrl', 'detectLocale', 'isSupported'];
  return _koaConvert2.default.compose(regeneratorRuntime.mark(function _callee(next) {
    var _this = this;

    var a;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          a = (0, _3.default)(this, opt);

          _lodash2.default.forEach(methods, function (method) {
            _this.accept[method] = a[method].bind(a);
          });
          this.request.accept = this.response.accept = (0, _3.default)(this, opt);
          _context.next = 5;
          return next;

        case 5:
        case 'end':
          return _context.stop();
      }
    }, _callee, this);
  }), function (self, next) {
    var a = (0, _3.default)(self, opt);
    _lodash2.default.forEach(methods, function (method) {
      self.accept[method] = a[method].bind(a);
    });
    self.request.accept = self.response.accept = (0, _3.default)(self, opt);
    return next();
  });
};
//# sourceMappingURL=../source maps/koa/index.js.map
