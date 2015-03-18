/*jslint node: true, forin: true, jslint white: true, newcap: true, curly: false*/
/**
 * Takeshi Iwana aka iwatakeshi
 * MIT 2015
 * gengojs-accept
 * This module parses the accept-language header
 * and returns the approriate locale.
 * Credits to @fundon
 * https://github.com/koa-modules/koa-locale/blob/master/index.js
 */
'use strict';
var Proto = require('uberproto');
var url = require('url');
var cookie = require('cookie');
var _ = require('lodash');

var accept = Proto.extend({
    init: function(req, opt) {
        //set options
        this._options(opt);
        if (req) this.set(req);
        return this;
    },
    set: function(req) {

        this['accept-language'] = '';
        //koa?
        if (req.request) {
            this.isKoa = true;
            this.request = req.request;
            this.headers = this.request.header;
            this.cookie = this.headers.cookie || this.headers.cookies;
        } else if (req.raw) {
            //maybe it's hapi
            this.isHapi = true;
            this.request = req;
            this.headers = this.request.headers;
            this.cookie = this.headers['set-cookie'] || {};
        } else {
            //then it's express
            this.isKoa = false;
            this.request = req;
            this.headers = this.request.headers;
            this.cookie = this.headers.cookie || this.headers.cookies;
        }
        this.detectLocale();
    },
    getAcceptLanguage: function(req) {
        if (req) this['accept-language'] = req.header['accept-language'] || req.headers['accept-language'] || '';
        else this['accept-language'] = this.headers['accept-language'];
        return this['accept-language'] || null;
    },
    getLocale: function() {
        return this.locale;
    },
    setLocale: function(locale) {
        this.locale = this._check(locale);
        return this.locale;
    },
    // From accept-language, `Accept-Language: ja`
    getFromHeader: function(req, fallback) {
        this.getAcceptLanguage(req);
        var reg = /(^|,\s*)([a-z-0-9-]+)/gi,
            match, result;
        while ((match = reg.exec(this['accept-language']))) {
            if (!result) result = match[2];
        }

        if (req) return result || null;
        else {
            this.locale = result = this._check(result);
            return fallback ? result || null : (result || null);
        }
    },
    // From query, 'lang=en'
    getFromQuery: function(key, fallback) {
        var result;
        var query;
        if (this.isKoa || this.isHapi) query = this.request.query;
        else query = this.request.query || url.parse(this.request.url, true).query;
        this.locale = result = this._check(!_.isEmpty(query) ? query[key] : null);
        return fallback ? result || null : (result || null);

    },
    //From domain
    getFromDomain: function(fallback) {
        var result, hostname = this.request.hostname || this.request.info.hostname;
        result = hostname ? hostname.toString().toLowerCase().trim().split(':')[0].split(/\./gi).reverse()[0] : null;
        this.locale = result = this._check(result);
        return fallback ? result || null : (result || null);

    },
    // From subdomain, 'en.gengojs.com'
    getFromSubdomain: function(fallback) {
        var result;
        if (this.isKoa) result = this.request.subdomains[0];
        else result = this.headers.host.split('.')[0];
        this.locale = result = this._check(result);
        return fallback ? result || null : (result || null);

    },
    // From cookie, 'lang=ja'
    getFromCookie: function(key, fallback) {
        var result;
        result = this.cookie ? cookie.parse(this.cookie)[key] || cookie.parse(this.cookie)[this.opt.keys.cookie]: null;
        this.locale = result = this._check(result);
        return fallback ? result || null : (result || null);

    },
    // From URL, 'http://gengojs.com/en'
    getFromUrl: function(fallback) {
        var result, path = this.request.path || this.request.url.path;
        this.locale = result = this._check(path ? path.substring(1).split('/').shift() : '');
        return fallback ? result || null : (result || null);

    },
    //From all, when specified in opt
    detectLocale: function() {
        _.forEach(this.opt.detect, function(value, key) {
            switch (key) {
                case 'header':
                    if (value) this.locale = this.getFromHeader();
                    break;
                case 'cookie':
                    if (value) this.locale = this.getFromCookie(this.opt.keys.cookie);
                    break;
                case 'url':
                    if (value) this.locale = this.getFromUrl();
                    break;
                case 'domain':
                    if (value) this.locale = this.getFromDomain();
                    break;
                case 'subdomain':
                    if (value) this.locale = this.getFromSubdomain();
                    break;
                case 'query':
                    if (value) this.locale = this.getFromQuery(this.opt.keys.query);
                    break;
            }
        }, this);
        return this.locale;
    },
    _options: function(opt) {
        this.opt = _.defaults(opt || {}, {
            check: true,
            default: 'en-US',
            supported: ['en-US'],
            keys: _.defaults(opt ? (opt.keys ? opt.keys : {}) : {}, {
                cookie: 'locale',
                query: 'locale'
            }),
            detect: _.defaults(opt ? (opt.detect ? opt.detect : {}) : {}, {
                header: true,
                cookie: false,
                query: false,
                url: false,
                domain: false,
                subdomain: false
            })
        });
    },
    _check: function(result) {
        if (this.opt.check) {
            var index = this.opt.supported.indexOf(result);
            var locale = this.opt.supported[index];
            locale = locale ? locale : this.opt.default;
            return locale;
        } else return result;
    }
});

module.exports = function(req, opt) {
    return accept.create(req, opt);
};
