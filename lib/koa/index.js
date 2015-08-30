import accept from '../';
import 'babel/polyfill';

export default (opt) => {
  'use strict';
  return function*(next) {
    this.request.accept = this.response.accept = accept(this, opt);
    yield next;
  };
};