# gengojs-accept

[![Build Status](https://travis-ci.org/iwatakeshi/gengojs-accept.svg?branch=master)](https://travis-ci.org/iwatakeshi/gengojs-accept)
[![Dependency Status](https://david-dm.org/iwatakeshi/gengojs-accept.png)](https://github.com/iwatakeshi/gengojs-accept/blob/master/package.json) 
[![License Status](http://img.shields.io/npm/l/gengojs-accept.svg)](https://github.com/iwatakeshi/gengojs-accept/blob/master/LICENSE) 
[![Downloads](http://img.shields.io/npm/dm/gengojs-accept.svg)]() [![Version](http://img.shields.io/npm/v/gengojs-accept.svg)]()

[![NPM](https://nodei.co/npm/gengojs-accept.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/gengojs-accept/)

Express, Koa, Hapi locale parser that powers (or will power) [gengo.js](https://github.com/iwatakeshi/gengojs).

This module parses the accept-language header from either Express, Koa, or Hapi and returns the appropriate locale.

##Usage

```bash
npm install --save gengojs-accept
```

**As standalone:**

```js
var accept = require('gengojs-accept')
//In express
app.use(function(req, res, next){
    //doens't have to be app.use.
    //Just wherever 'req' or 'request'
    //is avaible
    var result = accept(req);
    res.send({locale:result.getLocale(), detected:result.detectLocale()})
})

//In koa
app.use(function*(next) {
    var result = accept(this);
    var body = {
        locale: result.getLocale(), 
        detected:result.detectLocale()
    };
    this.body = body;
    yield next;
});

//In hapi
server.route({
    method:'GET',
    path:'/',
    handler:function(request, reply){
        var result = accept(request);
        reply({locale:result.getLocale(), detected:result.detectLocale()})
    }
})

```

**As middleware:**

```js
//koa example
var koa = require('koa');
var app = koa();
//note the path to koa middleware!
var accept = require('gengojs-accept/koa');

app.use(accept());

app.use(function*() {
    var req = this.request;
    this.body = req.accept.getFromHeader();
});

app.listen(3000);

```

```js
//express example
var express = require('express');
var app = express();
//note the path to express middleware!
var accept = require('gengojs-accept/express');

app.use(accept());

app.get('/', function(req, res) {
    res.send(req.accept.getFromHeader());
});

app.listen(3000);
```

```js
//hapi example
var server = new Hapi.Server();
//note the path to express middleware!
var accept = require('gengojs-accept/hapi');

server.connection({
    host: 'localhost',
    port: 3000
});

server.register(accept(), function(err) {
    if (err) console.log('an error occurred');
});

server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
        return reply(request.accept.getLocale());
    }
});
server.start(function() {

});
```

**Note:**

gengojs-accept will attach to both request and response object for both Express, Koa. For Hapi, it is only attached to request.

##API

| Function | Description | Option
|---                |---                                     |--- |
|getAcceptLanguage(req)|Returns the Accept-Language from header, otherwise <code>null</code>  | [Object request]   |
|getFromHeader(req, fallback)|Returns the locale by parsing the header, otherwise <code>null</code>      | [Object request], [Boolean fallback]   |
|getFromQuery(key, fallback)|Returns the locale by parsing the query string, otherwise <code>null</code>| [String key],[Boolean fallback]|
|getFromDomain(fallback) |Returns the locale by parsing the domain in the url, otherwise <code>null</code>|[Boolean fallback]|
|getFromSubdomain(fallback)|Returns the locale by parsing the subdomain in the url, otherwise <code>null</code> |[Boolean fallback]|
|getFromCookie(key, fallback)|Returns the locale by parsing the cookies, otherwise <code>null</code> |[String key],[Boolean fallback]|
|getFromUrl(fallback)|Return the locale by parsing the url, otherwise <code>null</code>|[Boolean fallback]|
|detectLocale()|Return the locale by the specified detect options|    |
|getLocale()|Returns the current locale|    |
|setLocale(locale)|Overrides the locale| [String locale]

**Note:**

The `req` Object for `getFromAcceptLanguage` and `getFromHeader` are optional. Therefore, you can pass `null` like the following to just get the value when fallback is needed:

```js
//example
getFromHeader(null, true);
//normally you would call like this since req 
//has already been set internally:
getFromHeader();
```

Also, if fallback is specified, gengojs-accept will fallback to your default locale. This fallback approach comes from ruby's [2.2 Optional: Custom I18n Configuration Setup](http://guides.rubyonrails.org/i18n.html#optional-custom-i18n-configuration-setup). If checking against the supported locales is not needed for your app, just set the `check` option to `false`.

##Options

|Name  |Description | Default
|---|---|---|
|<code>check</code>| Compare against the supported locales | <code>true</code>
|<code>default</code> | The default locale | <code>"en-US"</code>
|<code>supported</code>| The supported locales | <code>["en-US"]</code>
|<code>keys</code>| The keys to use for query and cookie | <code>{query:'locale', cookie:'locale'}</code>
|<code>detect</code>|The method of parsing allowed to get locale.| <code>{header: true, cookie: false, query: false, url: false, domain:false, subdomain: false}</code>|


```js
accept(req, opt);
//example
accept(req, {
    default:'ja',
    detect:{
        header:false,
        cookie:true
    }
})
```

##Changelog

For changelog, visit the [GitHub](https://github.com/iwatakeshi/gengojs-accept/blob/master/CHANGELOG.md) page.