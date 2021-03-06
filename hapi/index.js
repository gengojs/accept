'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (opt) {
  'use strict';

  var register = function register(plugin, options, next) {
    plugin.ext('onPreHandler', function (request, reply) {
      if (!request.accept) request.accept = (0, _2.default)(request, options);
      reply.continue();
    });
    next();
  };
  register.attributes = {
    name: require('../package').name
  };
  return {
    register: register,
    options: opt || {}
  };
};
//# sourceMappingURL=../source maps/hapi/index.js.map
