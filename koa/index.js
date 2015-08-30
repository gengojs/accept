'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ = require('../');

var _2 = _interopRequireDefault(_);

require('babel/polyfill');

exports['default'] = function (opt) {
  'use strict';
  return regeneratorRuntime.mark(function callee$1$0(next) {
    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          this.request.accept = this.response.accept = (0, _2['default'])(this, opt);
          context$2$0.next = 3;
          return next;

        case 3:
        case 'end':
          return context$2$0.stop();
      }
    }, callee$1$0, this);
  });
};

module.exports = exports['default'];
//# sourceMappingURL=../source maps/koa/index.js.map