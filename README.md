
# Pdf Form Fill Server

> A server that renders filled pdf forms.

[![npm version](https://img.shields.io/npm/v/@panosoft/pdf-form-fill-server.svg)](https://www.npmjs.com/package/@panosoft/pdf-form-fill-server)
[![Travis](https://img.shields.io/travis/panosoft/pdf-form-fill-server.svg)](https://travis-ci.org/panosoft/pdf-form-fill-server)

# Installation

```sh
npm install -g @panosoft/pdf-form-fill-server
```

# Usage

```sh
Usage: pdf-form-fill-server --key <path> --cert <path> [options]

Render filled pdf forms.

Options:

  -h, --help                    output usage information
  -V, --version                 output the version number
  -k, --key   <path>            Path to the private key of the server in PEM format.
  -c, --cert  <path>            Path to the certificate key of the server in PEM format.
  -p, --port  <port>            The port to accept connections on. Default: 8443.
  -i, --interface  <interface>  The interface to accept connections on. Default: 0.0.0.0.
```

# HTTPS API

## Request

- Path: `/`
- Method: `POST`
- Headers:
	- `Content-Type` - `'application/json'`
- Body
	- `input` - {Object}
		- `formFile` - {Base64} The pdf form containing fields to be filled.
		- `formData` - {Object} The data used to fill the supplied form in the following format: `{ <field-name>: <value> }`.

## Responses

__Success__
- Status Code: `200`
- Headers:
	- `Request-Id` - {String} The unique request identifier.
	- `Content-Type` - `'application/pdf'`
- Body: {Buffer} The pdf binary.

__Error__
- Status Code: `500`
- Headers:
	- `Request-Id` - {String} The unique request identifier.
	- `Content-Type` - `'application/json'`
- Body:
	- `error` - {String} The error message.
