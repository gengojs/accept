var accept = require('../index');
module.exports = function(opt) {
    return function*(next) {
        this.request.accept = this.response.accept = accept(this, opt);
        yield next;
    }
}
