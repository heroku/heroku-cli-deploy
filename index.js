exports.topics = [
  { name: 'deploy', description: 'Deploy WAR and JAR files' },
  { name: 'war', description: 'Manage WAR files' },
  { name: 'jar', description: 'Manage JAR files' }
]

exports.commands = [
  require('./commands/deploy/war')('deploy', 'war'),
  require('./commands/deploy/jar')('deploy', 'jar'),
  require('./commands/deploy/war')('war', 'deploy'),
  require('./commands/deploy/jar')('jar', 'deploy'),
]
