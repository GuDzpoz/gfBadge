let commitHash = require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString()
process.env.VUE_APP_COMMIT_HASH = commitHash

module.exports = {
  publicPath: './',
  pages: {
    index: {
      entry: 'src/main.js',
      title: '少女前线签名图生成器',
    }
  }
}
