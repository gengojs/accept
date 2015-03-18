var accept = require('../../index');
var request = require('supertest');
var assert = require('chai').assert;

function subdomain(options) {

    // options?
    options = options || {};

    if (!options.base) {
        throw new Error('options.base required!');
    } else {
        options.removeWWW = options.removeWWW || false;
        options.debug = options.debug || false;
        options.ignoreWWW = options.ignoreWWW || false;
        options.prefix = options.prefix || 'subdomain';
    };

    // return middleware
    return function * (next) {

        // get host & protocol
        var host = this.request.headers.host,
            protocol = this.request.socket.encrypted ? 'https' : 'http';

        // remove 'www' prefix from URL? (tacky, right?)
        if (options.removeWWW === true) {
            if (/^www/.test(host)) {
                return this.response.redirect(protocol + '://' + host.replace(/^www\./, '') + this.request.url);
            };
        };

        // subdomain specific middleware
        if (host === options.base || host === 'localhost:8000' || (options.ignoreWWW && /^www\./.test(host))) {
            // not a subdomain or ignoring www subdomain
            yield next;
        } else {
            // test for subdomain
            var matches = host.match(new RegExp('(.*)\.' + options.base));
            // subdomain
            if (matches && matches.length === 2) {
                this.request.url = '/' + options.prefix + '/' + matches[1] + this.request.url;
                yield next;
            } else {
                yield next;
            }
        };
    };

};

describe('Begin module "accept" tests with koa', function() {
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
        var koa = require('koa');
        var app = koa();
        var route = require('koa-route');

        var a = require('../../koa/')
        app.use(a());
        app.use(function * () {
            this.body = {
                result: this.request.accept.getFromHeader()
            };
        })

        it('Accept should === "en-US"', function(done) {
            request(app.listen())
                .get('/')
                .set('Accept-Language', 'en-US')
                .expect(function(res) {
                    var body = res.body;
                    assert.strictEqual(body.result, 'en-US');

                })
                .end(done);
        });

    });

    describe('Test getLocale()', function() {
        describe('with default options', function() {
            var koa = require('koa');
            var app = koa();
            app.use(function * () {
                var result = accept(this).getLocale();
                this.body = {
                    result: result
                };

            });
            it('Accept should === "en-US"', function(done) {
                request(app.listen())
                    .get('/')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en-US');

                    })
                    .end(done);

            });

            it('Accept should fallback to "en-US" (default)', function(done) {
                request(app.listen())
                    .get('/')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en-US');

                    })
                    .end(done);
            });

        });
        describe('with configured options', function() {
            var koa = require('koa');
            var app = koa();

            app.use(function * (next) {
                var opt = {
                    supported: ['en-US', 'ja']
                };
                var result = accept(this, opt).getLocale();
                this.body = {
                    result: result
                };
                yield next;
            });

            it('Accept should === "en-US"', function(done) {
                request(app.listen())
                    .get('/')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en-US');

                    })
                    .end(done);
            });

            it('Accept should === "ja"', function(done) {
                request(app.listen())
                    .get('/')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'ja');

                    })
                    .end(done);
            });
        });
    });
    describe('Test setLocale()', function() {
        describe('with default options', function() {
            var koa = require('koa');
            var app = koa();
            app.use(function * () {
                var result = accept(this).setLocale('ja');
                this.body = {
                    result: result
                };

            });

            it('Accept should === "en-US"', function(done) {
                request(app.listen())
                    .get('/')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en-US');

                    })
                    .end(done);

            });

            it('Accept should fallback to "en-US" (default)', function(done) {
                request(app.listen())
                    .get('/')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en-US');

                    })
                    .end(done);
            });

        });
        describe('with configured options', function() {
            var koa = require('koa');
            var app = koa();

            app.use(function * (next) {
                var opt = {
                    supported: ['en-US', 'ja']
                };
                var result = accept(this, opt).setLocale('ja');
                this.body = {
                    result: result
                };
                yield next;
            });

            it('Accept should === "ja"', function(done) {
                request(app.listen())
                    .get('/')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'ja');

                    })
                    .end(done);
            });
        });
    });

    describe('Test getFromQuery()', function() {
        describe('with default options', function() {
            var koa = require('koa');
            var app = koa();
            app.use(function * (next) {
                var result = accept(this).getFromQuery('locale');
                this.body = {
                    result: result
                };
                yield next;
            });
            it('Accept should !== "en"', function(done) {
                request(app.listen())
                    .get('/?locale=en')
                    .expect(function(res) {
                        var body = res.body;
                        assert.notStrictEqual(body.result, 'en');

                    })
                    .end(done);
            });

            it('Accept should fallback to "en-US" (default)', function(done) {
                request(app.listen())
                    .get('/en')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en-US');

                    })
                    .end(done);
            });
        });

        describe('with configured options', function() {
            var koa = require('koa');
            var app = koa();
            app.use(function * (next) {
                var result = accept(this, {
                    default: 'ja',
                    supported: ['en-US', 'en']
                }).getFromQuery('locale');
                this.body = {
                    result: result
                };
                yield next;
            });

            it('Accept should === "en"', function(done) {
                request(app.listen())
                    .get('/?locale=en')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en');

                    })
                    .end(done);
            });

            it('Accept should fallback to "ja"', function(done) {
                request(app.listen())
                    .get('/')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'ja');
                    })
                    .end(done);
            });
        });
    });


    describe('Test getAcceptLanguage()', function() {
        var koa = require('koa');
        var app = koa();
        app.use(function * (next) {
            var result = accept(this).getAcceptLanguage();
            this.body = {
                result: result
            };
            yield next;
        });

        it('Accept should include "en-US"', function(done) {
            request(app.listen())
                .get('/')
                .set('Accept-Language', 'en-US')
                .expect(function(res) {
                    var body = res.body;
                    assert.include(body.result, "en-US");

                })
                .end(done);
        });

        it('Accept should include "ja"', function(done) {
            request(app.listen())
                .get('/')
                .set('Accept-Language', 'ja')
                .expect(function(res) {
                    var body = res.body;
                    assert.include(body.result, "ja");

                })
                .end(done);
        });
    });

    describe('Test getFromDomain()', function() {
        describe('with default options', function() {
            var koa = require('koa');
            var app = koa();
            var subdomainOptions = {
                base: 'localhost.com' //base is required, you'll get an error without it.
            };

            app.use(subdomain(subdomainOptions));
            app.use(function * (next) {
                var result = accept(this).getFromDomain();
                this.body = {
                    result: result
                };
                yield next;
            });

            it('Accept should !== "en"', function(done) {
                request(app.listen())
                    .get('/api/:localhost')
                    .set('Host', 'api.localhost.com')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.notStrictEqual(body.result, 'en');

                    })
                    .end(done);
            });

            it('Accept should !== "ja"', function(done) {
                request(app.listen())
                    .get('/api/:localhost')
                    .set('host', 'api.localhost.en')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.notStrictEqual(body.result, 'ja');
                    })
                    .end(done);
            });
        });
        describe('with configured options', function() {
            var koa = require('koa');
            var app = koa();
            var subdomainOptions = {
                base: 'localhost.com' //base is required, you'll get an error without it.
            };

            app.use(subdomain(subdomainOptions));
            app.use(function * (next) {
                var opt = {
                    supported: ['en-US', 'ja'],
                    default: 'en'
                };
                var result = accept(this, opt).getFromDomain();
                this.body = {
                    result: result
                };
                yield next;
            });

            it('Accept should === "en"', function(done) {
                request(app.listen())
                    .get('/api/:localhost')
                    .set('Host', 'api.localhost.en')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en');

                    })
                    .end(done);
            });

            it('Accept should === "ja"', function(done) {
                request(app.listen())
                    .get('/api/:localhost')
                    .set('host', 'api.localhost.ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'ja');

                    })
                    .end(done);
            });
        });
    });

    describe('Test getFromSubdomain()', function() {
        describe('with default options', function() {
            var koa = require('koa');
            var app = koa();
            var subdomainOptions = {
                base: 'localhost.com' //base is required, you'll get an error without it.
            };

            app.use(subdomain(subdomainOptions));
            app.use(function * (next) {
                var result = accept(this).getFromSubdomain;
                this.body = {
                    result: result
                };
                yield next;
            });

            it('Accept should !== "en"', function(done) {
                request(app.listen())
                    .get('/en/:localhost')
                    .set('Host', 'en.localhost.com')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.notStrictEqual(body.result, 'en');

                    })
                    .end(done);
            });

            it('Accept should !== "ja"', function(done) {
                request(app.listen())
                    .get('/ja/:localhost')
                    .set('host', 'ja.localhost.com')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.notStrictEqual(body.result, 'ja');

                    })
                    .end(done);
            });
        });
        describe('with configured options', function() {
            var koa = require('koa');
            var app = koa();
            var subdomainOptions = {
                base: 'localhost.com' //base is required, you'll get an error without it.
            };

            app.use(subdomain(subdomainOptions));
            app.use(function * (next) {
                var opt = {
                    supported: ['en-US', 'ja'],
                    default: 'en'
                };
                var result = accept(this, opt).getFromSubdomain();
                this.body = {
                    result: result
                };
                yield next;
            });

            it('Accept should === "en"', function(done) {
                request(app.listen())
                    .get('/en/:localhost')
                    .set('Host', 'en.localhost.com')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en');

                    })
                    .end(done);
            });

            it('Accept should === "ja"', function(done) {
                request(app.listen())
                    .get('/ja/:localhost')
                    .set('host', 'ja.localhost.com')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'ja');

                    })
                    .end(done);
            });
        });
    });

    describe('Test getFromUrl()', function() {
        describe('with default options', function() {
            var koa = require('koa');
            var app = koa();

            app.use(function * (next) {
                var result = accept(this).getFromUrl();
                this.body = {
                    result: result
                };
                yield next;
            });

            it('Accept should === "en-US"', function(done) {
                request(app.listen())
                    .get('/')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "en-US");
                    }).end(done);

            });

            it('Accept should === "en-US"', function(done) {
                request(app.listen())
                    .get('/ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "en-US");

                    }).end(done);
            });
        });

        describe('with configured options', function() {
            var koa = require('koa');
            var app = koa();

            app.use(function * (next) {
                var result = accept(this, {
                    supported: ['en-US', 'ja']
                }).getFromUrl();
                this.body = {
                    result: result
                };
                yield next;
            });

            it('Accept should === "en-US"', function(done) {
                request(app.listen())
                    .get('/')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "en-US");
                    }).end(done);

            });

            it('Accept should === "ja"', function(done) {
                request(app.listen())
                    .get('/ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "ja");

                    }).end(done);
            });

            it('Accept should === "en-US"', function(done) {
                request(app.listen())
                    .get('/fr')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "en-US");

                    }).end(done);
            });
        });
    });

    describe('Test getFromCookie()', function() {
        describe('with default options', function() {
            var koa = require('koa');
            var app = koa();

            app.use(function * (next) {
                var result = accept(this).getFromCookie('locale');
                this.body = {
                    result: result
                };
                yield next;
            });

            it('Accept should !== "ja"', function(done) {
                request(app.listen())
                    .get('/')
                    .set('Cookie', 'locale=ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.notStrictEqual(body.result, "ja");
                    }).end(done);

            });

            it('Accept should !== "ja"', function(done) {
                request(app.listen())
                    .get('/')
                    .set('Cookie', 'locale=ja')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var body = res.body;
                        assert.notStrictEqual(body.result, "ja");

                    }).end(done);
            });

        });

        describe('with configured options', function() {
            var koa = require('koa');
            var app = koa();

            app.use(function * (next) {
                var result = accept(this, {
                    supported: ['en-US', 'ja'],
                    default: 'en'
                }).getFromCookie('locale');
                this.body = {
                    result: result
                };
                yield next;
            });


            it('Accept should === "ja"', function(done) {
                request(app.listen())
                    .get('/')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "ja");
                    }).end(done);

            });

            it('Accept should === "ja"', function(done) {
                request(app.listen())
                    .get('/')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "ja");
                    }).end(done);
            });
        });
    });
    describe('Test detectLocale()', function() {
        describe('with default options', function() {
            var koa = require('koa');
            var app = koa();

            app.use(function * (next) {
                var result = accept(this).detectLocale();
                this.body = {
                    result: result
                };
                yield next;
            });

            it('Accept should === "en-US"', function(done) {
                request(app.listen())
                    .get('/')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en-US');
                    }).end(done);

            });

            it('Accept should !== "ja"', function(done) {
                request(app.listen())
                    .get('/')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var body = res.body;
                        assert.notStrictEqual(body.result, "ja");

                    }).end(done);
            });
        });

        describe('with configured options', function() {
            var koa = require('koa');
            var app = koa();

            app.use(function * (next) {
                var result = accept(this, {
                    supported: ['en-US', 'ja'],
                    default: 'en',
                    detect: {
                        header: false,
                        url: true
                    }
                }).detectLocale();
                this.body = {
                    result: result
                };
                yield next;
            });

            it('Accept should === "en-US"', function(done) {
                request(app.listen())
                    .get('/en-US')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "en-US");
                    }).end(done);

            });

            it('Accept should === "en"', function(done) {
                request(app.listen())
                    .get('/en')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "en");
                    }).end(done);
            });
        });
    });
});