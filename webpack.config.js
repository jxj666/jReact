/*
 * @Author: 靳肖健
 * @Date: 2020-11-22 21:48:11
 * @LastEditors: 靳肖健
 * @LastEditTime: 2020-11-23 23:25:18
 * @Description: //jxjweb.top
 */
module.exports = {
  entry: {
    main: "./main.js",
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            // 高版本的 es 语法翻译成低版本的 es 语法
            presets: ["@babel/preset-env"],
            // 在 js 中可以使用 jsx 语法,jsx语法翻译为对象
            plugins: [
              [
                "@babel/transform-react-jsx",
                {
                  // 如果不加的话默认是 React.crateElement 
                  pragma: "JReact.createElement", 
                },
              ],
            ],
          },
        },
      },
    ],
  },
  // 打包后的会把每一个文件放在 eval 中执行，通过 sourceURL 的方式在浏览器中打开它的时候变成一个单独的文件
  optimization: {
    minimize: false,
  },
};
