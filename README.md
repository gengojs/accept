# gengojs-accept

[![Build Status](https://travis-ci.org/iwatakeshi/gengojs-accept.svg?branch=master)](https://travis-ci.org/iwatakeshi/gengojs-accept)  [![Dependency Status](https://david-dm.org/iwatakeshi/gengojs-accept.png)](https://github.com/iwatakeshi/gengojs-accept/blob/master/package.json) [![License Status](http://img.shields.io/npm/l/gengojs-accept.svg)](https://github.com/iwatakeshi/gengojs-accept/blob/master/LICENSE) [![Downloads](http://img.shields.io/npm/dm/gengojs-accept.svg)]() [![Version](http://img.shields.io/npm/v/gengojs-accept.svg)]()

[![NPM](https://nodei.co/npm/gengojs-accept.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/gengojs-accept/)

Express and Koa locale parser that powers (or will power) [gengo.js](https://github.com/iwatakeshi/gengojs).

This module parses the accept-language header from either express or koa and returns the appropriate locale.

##Usage

```bash
npm install --save gengojs-accept
```

```js
var accept = require('gengojs-accept')
//In express
app.use(function(req, res, next){
    //doens't have to be app.use.
    //Just wherever 'req' or 'request'
    //is avaible
    var result = accept(req);
    res.send({locale:result.getLocale() || result.detectLocale()})
})

//In koa
app.use(function*(next) {
    var result = accept(this);
    var filter = {
        locale: result.getLocale() || result.detectLocale()
    };
    this.body = filter;
    yield next;
});
```

##API

| Function | Description | Option
|---                |---                                     |--- |
|getAcceptLanguage()|Returns the Accept-Language from header, otherwise <code>null</code>  |    |
|getFromHeader()|Returns the locale by parsing the header, otherwise <code>null</code>      |    |
|getFromQuery(key, fallback)|Returns the locale by parsing the query string, otherwise <code>null</code>| [String key],[Boolean fallback]|
|getFromSubdomain(fallback)|Returns the locale by parsing the subdomain in the url, otherwise <code>null</code> |[Boolean fallback]|
|getFromCookie(key, fallback)|Returns the locale by parsing the cookies, otherwise <code>null</code> |[String key],[Boolean fallback]|
|getFromUrl(fallback)|Return the locale by parsing the url, otherwise <code>null</code>|[Boolean fallback]|
|detectLocale()|Return the locale by the specified detect options|    |
|getLocale()|Returns the current locale|    |

##Options

|Name  |Description | Default
|---|---|---|
|<code>default</code> | The default locale | <code>"en-US"</code>
|<code>supported</code>| The supported locales | <code>["en-US"]</code>
|<code>keys</code>| The keys to use for query and cookie | <code>{query:'locale', cookie:'locale'}</code>
|<code>detect</code>|The method of parsing allowed to get locale.| <code>{header: true, cookie: false, query: false, url: false, subdomain: false}</code>|
