const co = require('co');
const is = require('is_js');
const mime = require('mime-types');
const pdfFormFill = require('@panosoft/pdf-form-fill');
const parse = require('co-body');

const validateHeaders = headers => {
  const supportedMimeType = mime.lookup('json');
  if (headers['content-type'] !== supportedMimeType) {
    throw new TypeError (`Invalid request: headers: content-type must be ${supportedMimeType}.`);
  }
};
const validateBody = body => {
  const prefix = 'Invalid request: body:';
  if (!is.json(body)) throw new TypeError(`${prefix} must be an object.`);
  if (!body.input) throw new TypeError(`${prefix} input: must be defined.`);
  if (!is.object(body.input)) throw new TypeError(`${prefix} input: must be an object.`);
  if (!body.input.formFile) throw new TypeError(`${prefix} input: formFile must be defined.`);
  if (!is.string(body.input.formFile)) throw new TypeError(`${prefix} input: formFile must be a Base64 encoded string.`);
  if (!body.input.formData) throw new TypeError(`${prefix} input: formData must be defined.`);
  if (!is.object(body.input.formData)) throw new TypeError(`${prefix} input: formData must be an object.`);
};
const handle = co.wrap(function * (request, response, log) {
  validateHeaders(request.headers);
  const body = yield parse(request);
  validateBody(body);
  log('info', 'Rendering.');
  const output = yield pdfFormFill(body.input);
  log('info', 'Rendered.');
  response.writeHead(200, { 'Content-Type': mime.lookup('pdf') });
  response.end(output);
});
module.exports = handle;
