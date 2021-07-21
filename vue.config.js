let commitHash = require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString()
process.env.VUE_APP_COMMIT_HASH = commitHash

module.exports = {
   publicPath: './'
}
