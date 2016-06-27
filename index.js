var pkg = require('./package.json');

module.exports = {
  commands: [
    require('./commands/index')(pkg),
    require('./commands/war')(pkg.topic),
    require('./commands/jar')(pkg.topic),
  ]
};
