import accept from '../';
import _ from 'lodash';
import convert from 'koa-convert';
import 'babel-polyfill';
export default (opt) => {
  'use strict';
  var methods = [
    'getAcceptLanguage',
    'getLocale',
    'getFromHeader',
    'getFromQuery',
    'getFromDomain',
    'getFromSubdomain',
    'getFromCookie',
    'getFromUrl',
    'detectLocale',
    'isSupported'
  ];
  return convert.compose(function*(next) {
    var a = accept(this, opt);
    _.forEach(methods, (method) => {
      this.accept[method] = a[method].bind(a);
    });
    this.request.accept = this.response.accept = accept(this, opt);
    yield next;
  }, function(self, next) {
    var a = accept(self, opt);
    _.forEach(methods, (method) => {
      self.accept[method] = a[method].bind(a);
    });
    self.request.accept = self.response.accept = accept(self, opt);
    return next();
  });
};