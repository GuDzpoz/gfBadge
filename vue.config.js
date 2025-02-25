let commitHash = require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString()
let commitTime = require('child_process')
    .execSync('git log -1 --format=%ct')
    .toString()
process.env.VUE_APP_COMMIT_HASH = commitHash
process.env.VUE_APP_COMMIT_TIME = parseInt(commitTime)

module.exports = {
  publicPath: './',
  transpileDependencies: ['wave-ui'],
  pages: {
    index: {
      entry: 'src/main.js',
      title: '少女前线签名图生成器',
    }
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: '@import "@/scss/_variables.scss";'
      },
    },
  },
  pwa: {
    name: '少女前线签名图生成器',
    appleMobileWebAppCapable: 'yes',
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      importWorkboxFrom: 'local',
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'google-fonts-webfonts',
          },
        },
      ],
      exclude: [
        '/images/skins',
        '/images/icons',
        '/images/backgrounds',
        'images/skins',
        'images/icons',
        'images/backgrounds',
        /images(\/|\\)skins/gim,
        /images(\/|\\)icons/gim,
        /images(\/|\\)backgrounds/gim,
      ]
    },
  },
}
