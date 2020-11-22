/*
 * @Author: 靳肖健
 * @Date: 2020-11-22 22:01:32
 * @LastEditors: 靳肖健
 * @LastEditTime: 2020-11-22 22:02:24
 * @Description: //jxjweb.top
 */

var liveServer = require("live-server");

var params = {
  port: 8181, // Set the server port. Defaults to 8080.
  host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
  root: "./", // Set root directory that's being served. Defaults to cwd.
};
liveServer.start(params);