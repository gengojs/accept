/* global describe, it */
var accept = require('../../').default;
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
  }

  // return middleware
  return function (self, next) {

    // get host & protocol
    var host = self.request.headers.host,
      protocol = self.request.socket.encrypted ? 'https' : 'http';

    // remove 'www' prefix from URL? (tacky, right?)
    if (options.removeWWW === true) {
      if (/^www/.test(host)) {
        return self.response.redirect(protocol + '://' + host.replace(/^www\./, '') + self.request.url);
      }
    }

    // subdomain specific middleware
    if (host === options.base || host === 'localhost:8000' || (options.ignoreWWW && /^www\./.test(host))) {
      // not a subdomain or ignoring www subdomain
      return next();
    } else {
      // test for subdomain
      var matches = host.match(new RegExp('(.*)\.' + options.base));
      // subdomain
      if (matches && matches.length === 2) {
        self.request.url = '/' + options.prefix + '/' + matches[1] + self.request.url;
        return next();
      } else {
        return next();
      }
    }
  };
}

describe('koa', function() {
  describe('options', function() {
    describe('default', function() {
      describe('"default"', function() {
        it('should === "en-US"', function(done) {
          var result = accept();
          assert.strictEqual(result.options.default, 'en-US');
          done();
        });
      });
      describe('supported', function() {
        it('should === "["en-US"]"', function(done) {
          var result = accept();
          assert.deepEqual(result.options.supported, ['en-US']);
          done();
        });
      });
    });
    describe('configured', function() {
      describe('default', function() {
        it('should === "ja"', function(done) {
          var result = accept(null, {
            default: 'ja'
          });
          assert.strictEqual(result.options.default, 'ja');
          done();
        });
      });
      describe('supported', function() {
        it('should === "["en-US", "ja"]"', function(done) {
          var result = accept(null, {
            supported: ['en-US', 'ja']
          });
          assert.deepEqual(result.options.supported, ['en-US', 'ja']);
          done();
        });
      });
    });
  });

  describe('middleware', function() {
    var Koa = require('koa');
    var app = new Koa();
    var route = require('koa-route');

    var a = require('../../koa/').default;
    app.use(a());
    app.use(function (self, next) {
      self.body = {
        result: self.accept? 
        self.accept.getFromHeader() :
        self.request.accept.getFromHeader()
      };
      return next();
    });
    describe('request "/"', function() {
      it('should === "en-US"', function(done) {
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
  });

  describe('getLocale()', function() {
    describe('options', function() {
      describe('default', function() {
        var Koa = require('koa');
        var app = new Koa();
        app.use(function (self, next) {
          var result = accept(self).getLocale();
          self.body = {
            result: result
          };
          return next();
        });
        it('should === "en-US"', function(done) {
          request(app.listen())
            .get('/')
            .set('Accept-Language', 'en-US')
            .expect(function(res) {
              var body = res.body;
              assert.strictEqual(body.result, 'en-US');

            })
            .end(done);
        });

        it('should fallback to "en-US" (default)', function(done) {
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
      describe('configured', function() {
        var Koa = require('koa');
        var app = new Koa();

        app.use(function (self, next) {
          var options = {
            supported: ['en-US', 'ja']
          };
          var result = accept(self, options).getLocale();
          self.body = {
            result: result
          };
          return next();
        });

        it('should === "en-US"', function(done) {
          request(app.listen())
            .get('/')
            .set('Accept-Language', 'en-US')
            .expect(function(res) {
              var body = res.body;
              assert.strictEqual(body.result, 'en-US');

            })
            .end(done);
        });

        it('should === "ja"', function(done) {
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
  });
  describe('setLocale()', function() {
    describe('options', function() {
      describe('default', function() {
        var Koa = require('koa');
        var app = new Koa();
        app.use(function (self, next) {
           var result = accept(self);
          var set = result.setLocale('en');
          var detect = result.detectLocale();
          self.body = {
            result: {
                set:set,
                detect:detect
            }
          };
          return next();
        });

        it('should === "en-US"', function(done) {
          request(app.listen())
            .get('/')
            .set('Accept-Language', 'en-US')
            .expect(function(res) {
              var body = res.body;
              assert.strictEqual(body.result.set, 'en-US');
              assert.strictEqual(body.result.detect, 'en-US');

            })
            .end(done);

        });

        it('should fallback to "en-US" (default)', function(done) {
          request(app.listen())
            .get('/')
            .set('Accept-Language', 'ja')
            .expect(function(res) {
              var body = res.body;
              assert.strictEqual(body.result.set, 'en-US');
              assert.strictEqual(body.result.detect, 'en-US');

            })
            .end(done);
        });
      });
      describe('configured', function() {
        var Koa = require('koa');
        var app = new Koa();

        app.use(function (self, next) {
          var options = {
            supported: ['en-US', 'ja']
          };
          var result = accept(self, options);
          var set = result.setLocale('ja');
          var detect = result.detectLocale();
          self.body = {
            result: {
                set:set,
                detect:detect
            }
          };
          return next();
        });

        it('should === "ja"', function(done) {
          request(app.listen())
            .get('/')
            .set('Accept-Language', 'ja')
            .expect(function(res) {
              var body = res.body;
              assert.strictEqual(body.result.set, 'ja');
              assert.strictEqual(body.result.detect, 'ja');

            })
            .end(done);
        });
      });
    });
  });

  describe('getFromQuery()', function() {
    describe('options', function() {
      describe('default', function() {
        var Koa = require('koa');
        var app = new Koa();
        app.use(function (self, next) {
          var result = accept(self).getFromQuery('locale');
          self.body = {
            result: result
          };
          return next();
        });
        it('should !== "en"', function(done) {
          request(app.listen())
            .get('/?locale=en')
            .expect(function(res) {
              var body = res.body;
              assert.notStrictEqual(body.result, 'en');

            })
            .end(done);
        });

        it('should fallback to "en-US" (default)', function(done) {
          request(app.listen())
            .get('/en')
            .expect(function(res) {
              var body = res.body;
              assert.strictEqual(body.result, 'en-US');

            })
            .end(done);
        });
      });
      describe('configured', function() {
        var Koa = require('koa');
        var app = new Koa();
        app.use(function (self, next) {
          var result = accept(self, {
            default: 'ja',
            supported: ['en-US', 'en']
          }).getFromQuery('locale');
          self.body = {
            result: result
          };
          return next();
        });

        it('should === "en"', function(done) {
          request(app.listen())
            .get('/?locale=en')
            .expect(function(res) {
              var body = res.body;
              assert.strictEqual(body.result, 'en');

            })
            .end(done);
        });

        it('should fallback to "ja"', function(done) {
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
  });
  describe('getAcceptLanguage()', function() {
    var Koa = require('koa');
    var app = new Koa();
    app.use(function (self, next) {
      var result = accept(self).getAcceptLanguage();
      self.body = {
        result: result
      };
      return next();
    });

    it('should include "en-US"', function(done) {
      request(app.listen())
        .get('/')
        .set('Accept-Language', 'en-US')
        .expect(function(res) {
          var body = res.body;
          assert.include(body.result, "en-US");

        })
        .end(done);
    });

    it('should include "ja"', function(done) {
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

  describe('getFromDomain()', function() {
    describe('options', function() {
      describe('default', function() {
        var Koa = require('koa');
        var app = new Koa();
        var subdomainOptions = {
          base: 'localhost.com' //base is required, you'll get an error without it.
        };

        app.use(subdomain(subdomainOptions));
        app.use(function (self, next) {
          var result = accept(self).getFromDomain();
          self.body = {
            result: result
          };
          return next();
        });

        it('should !== "en"', function(done) {
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

        it('should !== "ja"', function(done) {
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
      describe('configured', function() {
        var Koa = require('koa');
        var app = new Koa();
        var subdomainOptions = {
          base: 'localhost.com' //base is required, you'll get an error without it.
        };

        app.use(subdomain(subdomainOptions));
        app.use(function (self, next) {
          var options = {
            supported: ['en-US', 'ja'],
            default: 'en'
          };
          var result = accept(self, options).getFromDomain();
          self.body = {
            result: result
          };
          return next;
        });

        it('should === "en"', function(done) {
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

        it('should === "ja"', function(done) {
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
  });

  describe('getFromSubdomain()', function() {
    describe('options', function() {
      describe('default', function() {
        var Koa = require('koa');
        var app = new Koa();
        var subdomainOptions = {
          base: 'localhost.com' //base is required, you'll get an error without it.
        };

        app.use(subdomain(subdomainOptions));
        app.use(function (self, next) {
          var result = accept(self).getFromSubdomain;
          self.body = {
            result: result
          };
          return next();
        });

        it('should !== "en"', function(done) {
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

        it('should !== "ja"', function(done) {
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
      describe('configured', function() {
        var Koa = require('koa');
        var app = new Koa();
        var subdomainOptions = {
          base: 'localhost.com' //base is required, you'll get an error without it.
        };

        app.use(subdomain(subdomainOptions));
        app.use(function (self, next) {
          var options = {
            supported: ['en-US', 'ja'],
            default: 'en'
          };
          var result = accept(self, options).getFromSubdomain();
          self.body = {
            result: result
          };
          return next();
        });

        it('should === "en"', function(done) {
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

        it('should === "ja"', function(done) {
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
  });

  describe('getFromUrl()', function() {
    describe('options', function() {
      describe('default', function() {
        var Koa = require('koa');
        var app = new Koa();

        app.use(function (self, next) {
          var result = accept(self).getFromUrl();
          self.body = {
            result: result
          };
          return next();
        });

        it('should === "en-US"', function(done) {
          request(app.listen())
            .get('/')
            .set('Accept-Language', 'en-US')
            .expect(function(res) {
              var body = res.body;
              assert.strictEqual(body.result, "en-US");
            }).end(done);

        });

        it('should === "en-US"', function(done) {
          request(app.listen())
            .get('/ja')
            .set('Accept-Language', 'en-US')
            .expect(function(res) {
              var body = res.body;
              assert.strictEqual(body.result, "en-US");

            }).end(done);
        });
      });
      describe('configured', function() {
        var Koa = require('koa');
        var app = new Koa();

        app.use(function (self, next) {
          var result = accept(self, {
            supported: ['en-US', 'ja']
          }).getFromUrl();
          self.body = {
            result: result
          };
          return next();
        });

        it('should === "en-US"', function(done) {
          request(app.listen())
            .get('/')
            .set('Accept-Language', 'en-US')
            .expect(function(res) {
              var body = res.body;
              assert.strictEqual(body.result, "en-US");
            }).end(done);

        });

        it('should === "ja"', function(done) {
          request(app.listen())
            .get('/ja')
            .set('Accept-Language', 'en-US')
            .expect(function(res) {
              var body = res.body;
              assert.strictEqual(body.result, "ja");

            }).end(done);
        });

        it('should === "en-US"', function(done) {
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

  });

  describe('getFromCookie()', function() {
    describe('options', function() {
      describe('default', function() {
        var Koa = require('koa');
        var app = new Koa();

        app.use(function (self, next) {
          var result = accept(self).getFromCookie('locale');
          self.body = {
            result: result
          };
          return next();
        });

        it('should !== "ja"', function(done) {
          request(app.listen())
            .get('/')
            .set('Cookie', 'locale=ja')
            .set('Accept-Language', 'en-US')
            .expect(function(res) {
              var body = res.body;
              assert.notStrictEqual(body.result, "ja");
            }).end(done);

        });

        it('should !== "ja"', function(done) {
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
      describe('configured', function() {
        var Koa = require('koa');
        var app = new Koa();

        app.use(function (self, next) {
          var result = accept(self, {
            supported: ['en-US', 'ja'],
            default: 'en'
          }).getFromCookie('locale');
          self.body = {
            result: result
          };
          return next();
        });


        it('should === "ja"', function(done) {
          request(app.listen())
            .get('/')
            .set('cookie', 'locale=ja')
            .set('Accept-Language', 'en-US')
            .expect(function(res) {
              var body = res.body;
              assert.strictEqual(body.result, "ja");
            }).end(done);

        });

        it('should === "ja"', function(done) {
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
  });
  describe('detectLocale()', function() {
    describe('options', function() {
      describe('default', function() {
        var Koa = require('koa');
        var app = new Koa();

        app.use(function (self, next) {
          var result = accept(self).detectLocale();
          self.body = {
            result: result
          };
          return next();
        });

        it('should === "en-US"', function(done) {
          request(app.listen())
            .get('/')
            .set('cookie', 'locale=ja')
            .set('Accept-Language', 'en-US')
            .expect(function(res) {
              var body = res.body;
              assert.strictEqual(body.result, 'en-US');
            }).end(done);

        });

        it('should !== "ja"', function(done) {
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
      describe('configured', function() {
        var Koa = require('koa');
        var app = new Koa();

        app.use(function (self, next) {
          var result = accept(self, {
            supported: ['en-US', 'ja'],
            default: 'en',
            detect: {
              header: false,
              url: true
            }
          }).detectLocale();
          self.body = {
            result: result
          };
          return next();
        });

        it('should === "en-US"', function(done) {
          request(app.listen())
            .get('/en-US')
            .set('cookie', 'locale=ja')
            .set('Accept-Language', 'en-US')
            .expect(function(res) {
              var body = res.body;
              assert.strictEqual(body.result, "en-US");
            }).end(done);

        });

        it('should === "en"', function(done) {
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
});