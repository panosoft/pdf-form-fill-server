const handle = require('./handle');

const routes = {
  '/': { POST: handle }
};
module.exports = routes;
