/*
 * @Author: 靳肖健
 * @Date: 2020-11-22 21:48:11
 * @LastEditors: 靳肖健
 * @LastEditTime: 2020-11-22 22:00:02
 * @Description: //jxjweb.top
 */
module.exports = {
  entry: {
    main: './main.js',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ["@babel/transform-react-jsx", {
                "pragma": "JReact.createElement" // default pragma is React.createElement
              }]
            ]
          }
        }
      }
    ]
  },
  optimization: {
    minimize: false
  }
}
