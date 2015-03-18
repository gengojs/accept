var Hapi = require('hapi');
var accept = require('../../index');
var shot = require('shot');
var assert = require('chai').assert;

describe('Begin module "accept" tests with hapi', function() {
    describe('Test options', function() {
        it('The default "default" should === "en-US"', function(done) {
            var result = accept();
            assert.strictEqual(result.opt.default, 'en-US');
            done();
        });

        it('The configured "default" should === "ja"', function(done) {
            var result = accept(null, {
                default: 'ja'
            });
            assert.strictEqual(result.opt.default, 'ja');
            done();
        });

        it('The default "supported" should === "["en-US"]"', function(done) {
            var result = accept();
            assert.deepEqual(result.opt.supported, ['en-US']);
            done();
        });

        it('The configured "default" should === "["en-US", "ja"]"', function(done) {
            var result = accept(null, {
                supported: ['en-US', 'ja']
            });
            assert.deepEqual(result.opt.supported, ['en-US', 'ja']);
            done();
        });
    });
    describe('Test accept as middleware', function() {

        var server = new Hapi.Server();
        server.connection({
            host: 'localhost',
            port: 3000
        });

        var handler = function(request, reply) {
            return reply(request.accept.getLocale());
        };
        server.register(require('../../hapi/')(), function(err) {
            if (err) console.log('an error occurred');
        });
        server.route({
            method: 'GET',
            path: '/',
            handler: handler
        });
        server.start(function() {

        });
        it('Accept should === "en-US"', function(done) {
            server.inject({
                method: 'GET',
                url: '/'
            }, function(res) {
                assert.isObject(res.request.accept);
                assert.strictEqual(res.result, 'en-US');
                assert.strictEqual(res.request.accept.getLocale(), 'en-US');

                done();
            });
        });

        server.stop(function() {

        });
    });

    describe('Test getLocale()', function() {
        describe('with default options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request).getLocale());
            };
            server.route({
                method: 'GET',
                path: '/',
                handler: handler
            });
            server.start(function() {

            });
            it('Accept should === "en-US"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'mycookie=test'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'en-US');
                    done();
                });
            });
            server.stop(function() {});
        });
        describe('with configured options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request, {
                    supported: ['ja', 'en-US']
                }).getLocale());
            };
            server.route({
                method: 'GET',
                path: '/',
                handler: handler
            });
            server.start(function() {});
            it('Accept should === "ja"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'mycookie=test'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'ja');
                    done();
                });
            });
            server.stop(function() {});
        });
    });

    describe('Test setLocale()', function() {
        describe('with default options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request).setLocale('en'));
            };
            server.route({
                method: 'GET',
                path: '/',
                handler: handler
            });
            server.start(function() {});
            it('Accept should === "en-US"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'mycookie=test'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'en-US');
                    done();
                });
            });
            server.stop(function() {});
        });
        describe('with configured options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request, {
                    supported: ['ja', 'en-US', 'en']
                }).setLocale('en'));
            };
            server.route({
                method: 'GET',
                path: '/',
                handler: handler
            });
            server.start(function() {});
            it('Accept should === "en"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'mycookie=test'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'en');
                    done();
                });
            });
            server.stop(function() {});
        });
    });

    describe('Test getFromQuery()', function() {
        describe('with default options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request).getFromQuery('locale'));
            };
            server.route({
                method: 'GET',
                path: '/',
                handler: handler
            });
            server.start(function() {});
            it('Accept should !== "en"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/?locale=en',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'mycookie=test'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'en-US');
                    done();
                });
            });
            server.stop(function() {});
        });

        describe('with configured options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request, {
                    supported: ['en']
                }).getFromQuery('locale'));
            };
            server.route({
                method: 'GET',
                path: '/',
                handler: handler
            });
            server.start(function() {});
            it('Accept should === "en"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/?locale=en',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'mycookie=test'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'en');
                    done();
                });
            });
            server.stop(function() {});
        });
    });
    describe('Test getAcceptLanguage()', function() {
        describe('with default options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request).getAcceptLanguage());
            };
            server.route({
                method: 'GET',
                path: '/',
                handler: handler
            });
            server.start(function() {});
            it('Accept should === "ja"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'mycookie=test'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'ja');
                    done();
                });
            });
            server.stop(function() {});
        });
    });

    describe('Test getFromDomain()', function() {
        describe('with default options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request).getFromDomain());
            };
            server.route({
                method: 'GET',
                path: '/',
                handler: handler
            });
            server.start(function() {});
            it('Accept should !== "en"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'mycookie=test',
                        'Host': 'example.en'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'en-US');
                    assert.notStrictEqual(res.result, 'en');
                    assert.strictEqual(res.statusCode, 200);
                    done();
                });
            });
            server.stop(function() {});
        });

        describe('with configured options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request, {
                    supported: ['en']
                }).getFromDomain());
            };
            server.route({
                method: 'GET',
                path: '/',
                handler: handler
            });
            server.start(function() {});
            it('Accept should === "en"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'mycookie=test',
                        'Host': 'localhost.en'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'en');
                    done();
                });
            });
            server.stop(function() {});
        });
    });
    describe('Test getFromSubdomain()', function() {
        describe('with default options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request).getFromSubdomain());
            };
            server.route({
                method: 'GET',
                path: '/',
                handler: handler
            });
            server.start(function() {});
            it('Accept should !== "en"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'mycookie=test',
                        'Host': 'en.example.ja'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'en-US');
                    assert.notStrictEqual(res.result, 'en');
                    assert.strictEqual(res.statusCode, 200);
                    done();
                });
            });
            server.stop(function() {});
        });

        describe('with configured options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request, {
                    supported: ['en']
                }).getFromSubdomain());
            };
            server.route({
                method: 'GET',
                path: '/',
                handler: handler
            });
            server.start(function() {});
            it('Accept should === "en"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'mycookie=test',
                        'Host': 'en.localhost.ja'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'en');
                    assert.strictEqual(res.statusCode, 200);
                    done();
                });
            });
            server.stop(function() {});
        });
    });

    describe('Test getFromUrl()', function() {
        describe('with default options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request).getFromUrl());
            };
            server.route({
                method: 'GET',
                path: '/en',
                handler: handler
            });
            server.start(function() {});
            it('Accept should !== "en"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/en',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'locale=ja'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'en-US');
                    done();
                });
            });
            server.stop(function() {});
        });
        describe('with configured options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request, {
                    supported: ['ja', 'en-US', 'en']
                }).getFromUrl());
            };
            server.route({
                method: 'GET',
                path: '/en',
                handler: handler
            });
            server.start(function() {});
            it('Accept should === "en"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/en',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'locale=ja'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'en');
                    done();
                });
            });
            server.stop(function() {});
        });
    });
    describe('Test getFromCookie()', function() {
        describe('with default options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request).getFromCookie());
            };
            server.route({
                method: 'GET',
                path: '/',
                handler: handler
            });
            server.start(function() {});
            it('Accept should !== "en"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/?locale=en',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'locale=en'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'en-US');
                    done();
                });
            });
            server.stop(function() {});
        });
        describe('with configured options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request, {
                    supported: ['ja', 'en-US', 'en']
                }).getFromCookie());
            };
            server.route({
                method: 'GET',
                path: '/',
                handler: handler
            });
            server.start(function() {});
            it('Accept should === "en"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'locale=en'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'en');
                    done();
                });
            });
            server.stop(function() {});
        });
    });

    describe('Test detectLocale()', function() {
        describe('with default options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request).detectLocale());
            };
            server.route({
                method: 'GET',
                path: '/',
                handler: handler
            });
            server.start(function() {});
            it('Accept should !== "en"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/?locale=en',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'locale=ja'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'en-US');
                    done();
                });
            });
            server.stop(function() {});
        });
        describe('with configured options', function() {
            var server = new Hapi.Server();
            server.connection({
                host: 'localhost',
                port: 3000
            });

            var handler = function(request, reply) {
                return reply(accept(request, {
                    supported: ['ja', 'en-US', 'en'],
                    default: 'en',
                    detect: {
                        header: false,
                        url: true
                    }
                }).detectLocale());
            };
            server.route({
                method: 'GET',
                path: '/en',
                handler: handler
            });
            server.start(function() {});
            it('Accept should === "en"', function(done) {
                server.inject({
                    method: 'GET',
                    url: '/en',
                    headers: {
                        'Accept-Language': 'ja',
                        'Set-Cookie': 'locale=en'
                    }
                }, function(res) {
                    assert.strictEqual(res.result, 'en');
                    done();
                });
            });
            server.stop(function() {});
        });
    });



});