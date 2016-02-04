const co = require('co');
const expect = require('chai').expect;
const HttpsServer = require('@panosoft/https-server');
const mime = require('mime-types');
const pdfText = require('pdf-text');
const path = require('path');

const bin = path.resolve(__dirname, '../bin/index.js');
const startServer = HttpsServer.test.startServer;
const request = HttpsServer.test.request;
const pdfToText = buffer => new Promise((resolve, reject) =>
  pdfText(buffer, (error, chunks) => error ? reject(error) : resolve(chunks))
);

const expectError = (response, message) => {
  const body = JSON.parse(response.body.toString('utf8'));
  expect(response.statusCode).to.equal(500);
  expect(body).to.be.an('object')
    .and.to.have.property('error')
    .that.equals(message);
};

describe('pdf-form-fill-server', () => {
  var server;
  before(co.wrap(function * () {
    server = yield startServer(bin);
  }));
  after(() => server.kill());
  describe('pdfFormFill', () => {
    const path = '/';
    const method = 'POST';
    const headers = { 'content-type': mime.lookup('json') };
    const input = require('./fixtures/input.json');
    const formFile = input.formFile;
    const formData = input.formData;
    it('reject request with invalid content-type header', co.wrap(function * () {
      const headers = { 'content-type': mime.lookup('txt') };
      const response = yield request(path, method, headers);
      expectError(response, 'Invalid request: headers: content-type must be application/json.');
    }));
    it('reject request without input field', co.wrap(function * () {
      const data = JSON.stringify({});
      const response = yield request(path, method, headers, data);
      expectError(response, 'Invalid request: body: input: must be defined.');
    }));
    it('reject request with invalid input field', co.wrap(function * () {
      const data = JSON.stringify({ input: 'invalid' });
      const response = yield request(path, method, headers, data);
      expectError(response, 'Invalid request: body: input: must be an object.');
    }));
    it('reject request without formFile field', co.wrap(function * () {
      const data = JSON.stringify({ input: {} });
      const response = yield request(path, method, headers, data);
      expectError(response, 'Invalid request: body: input: formFile must be defined.');
    }));
    it('reject request with invalid formFile field', co.wrap(function * () {
      const data = JSON.stringify({ input: { formFile: {} } });
      const response = yield request(path, method, headers, data);
      expectError(response, 'Invalid request: body: input: formFile must be a Base64 encoded string.');
    }));
    it('reject request without formData field', co.wrap(function * () {
      const data = JSON.stringify({ input: { formFile } });
      const response = yield request(path, method, headers, data);
      expectError(response, 'Invalid request: body: input: formData must be defined.');
    }));
    it('reject request with invalid formData field', co.wrap(function * () {
      const data = JSON.stringify({ input: { formFile, formData: 'invalid' } });
      const response = yield request(path, method, headers, data);
      expectError(response, 'Invalid request: body: input: formData must be an object.');
    }));
    it('render form', co.wrap(function * () {
      this.timeout(30000);
      const data = JSON.stringify({ input: { formFile, formData } });
      const response = yield request(path, method, headers, data);
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.have.property('content-type')
        .that.equals(mime.lookup('pdf'));
      expect(response.body).to.have.length.greaterThan(0);
      const pdf = yield pdfToText(response.body);
      expect(pdf).to.contain(formData.fullName);
    }));
  });
});
