'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _2 = require('../');

var _3 = _interopRequireDefault(_2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (opt) {
  'use strict';

  return function (req, res, next) {
    req.accept = res.accept = (0, _3.default)(req, opt);
    if (_lodash2.default.isFunction(next)) next();
  };
};
//# sourceMappingURL=../source maps/express/index.js.map
