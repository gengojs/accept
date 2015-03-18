var accept = require('../index');
module.exports = function(opt) {
    var register = function(plugin, options, next) {
        plugin.ext('onPreHandler', function(request, reply) {
            if(!request.accept) request.accept = accept(request, options);
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
}
