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
            this.koa = req;
            this.request = req.request;
            this.header = this.request.header;
            this.cookie = this.header.cookie || this.header.cookies;
        } else {
            this.isKoa = false;
            this.koa = null;
            this.request = req;
            this.header = this.request.headers;
            this.cookie = this.header.cookie || this.header.cookies;
        }
        this.detectLocale();
    },
    getAcceptLanguage: function(req) {
        if (req) this['accept-language'] = req.header['accept-language'] || req.headers['accept-language'] || '';
        else this['accept-language'] = this.request.header['accept-language'] || this.request.headers['accept-language'] || '';
        return this['accept-language'];
    },
    getLocale: function() {
        return this.locale;
    },
    // From accept-language, `Accept-Language: ja`
    getFromHeader: function(req) {
        this.getAcceptLanguage();
        var reg = /(^|,\s*)([a-z-0-9-]+)/gi,
            match, locale;
        while ((match = reg.exec(this['accept-language']))) {
            if (!locale) locale = match[2];
        }
        var index = this.opt.supported.indexOf(locale);
        this.locale = index > -1 ? this.opt.supported[index] : this.opt.default;
        return this.locale;
    },
    // From query, 'lang=en'
    getFromQuery: function(key, fallback) {
        var result;
        var query;
        if (this.isKoa) query = this.request.query;
        else query = url.parse(this.request.url, true).query;
        result = this._check(!_.isEmpty(query) ? query[key] : null);
        return fallback ? result || this.getFromHeader() || this.opt.default : result;

    },
    // From subdomain, 'en.gengojs.com'
    getFromSubdomain: function(fallback) {
        var result;
        if (this.isKoa) result = this.request.subdomains[0];
        else result = this.request.headers.host.split('.')[0];
        result = this._check(result);
        return fallback ? result || this.getFromHeader() || this.opt.default : result;

    },
    // From cookie, 'lang=ja'
    getFromCookie: function(key, fallback) {
        var result;
        result = this.cookie ? cookie.parse(this.cookie)[key] : null;
        result = this._check(result);
        return fallback ? result || this.getFromHeader() || this.opt.default : result;

    },
    // From URL, 'http://gengojs.com/en'
    getFromUrl: function(fallback) {
        var result;
        result = this._check(this.request.path.substring(1).split('/').shift());
        return fallback ? result || this.getFromHeader() || this.opt.default : result;

    },
    //From all, when specified in opt
    detectLocale: function() {
        var header = this.getFromHeader(),
            query = this.getFromQuery(this.opt.keys.query),
            cookie = this.getFromCookie(this.opt.keys.cookie),
            url = this.getFromUrl(),
            subdomain = this.getFromSubdomain();
        _.forEach(this.opt.detect, function(value, key) {
            switch (key) {
                case 'header':
                    if (value) this.locale = header;
                    break;
                case 'cookie':
                    if (value) this.locale = cookie;
                    break;
                case 'url':
                    if (value) this.locale = url;
                    break;
                case 'subdomain':
                    if (value) this.locale = subdomain;
                    break;
                case 'query':
                    if (value) this.locale = query;
                    break;
            }
        }, this);
        return this.locale = this.locale ? this.locale : this.opt.default;
    },
    _options: function(opt) {
        this.opt = _.defaults(opt || {}, {
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
                subdomain: false
            })
        });
    },
    _check: function(result) {
        var index = this.opt.supported.indexOf(result);
        var locale = this.opt.supported[index];
        locale = locale ? locale : this.opt.default;
        return locale;
    }
});

module.exports = function(req, opt) {
    return accept.create(req, opt);
};
