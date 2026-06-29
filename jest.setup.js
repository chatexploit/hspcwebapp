import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Request = class Request {
  constructor(input, init) {
    this.url = input;
    this.method = init?.method || 'GET';
    this.headers = init?.headers || new Headers();
  }
};
global.Response = class Response {
  static json(data, init) {
    return {
      status: init?.status || 200,
      json: async () => data
    };
  }
};
global.Headers = class Headers {
  constructor(init) {
    this.map = new Map(Object.entries(init || {}));
  }
  get(name) {
    return this.map.get(name.toLowerCase());
  }
};
