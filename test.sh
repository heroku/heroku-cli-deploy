set -e

export HEROKU_API_TOKEN="$(heroku auth:token)"
npm test
