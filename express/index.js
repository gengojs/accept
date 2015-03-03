var accept = require('../index');
var _ = require('lodash');
module.exports = function(opt) {
    return function(req, res, next) {
        req.accept = res.accept = accept(req, opt);
        if (_.isFunction(next)) next();
    }
}
