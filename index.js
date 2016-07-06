exports.topics = [
  { name: 'deploy', description: 'Deploy WAR and JAR files' },
  { name: 'war', description: 'Manage WAR files' },
  { name: 'jar', description: 'Manage JAR files' }
]

exports.commands = [
  //require('./commands/deploy'),
  require('./commands/deploy/index')('deploy'),
  require('./commands/deploy/war')('deploy'),
  require('./commands/deploy/jar')('deploy'),
]
