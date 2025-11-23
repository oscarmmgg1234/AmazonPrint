
exports.query_manager = require("knex")({
  client: "mysql2",
  connection: {
    host: "192.168.1.218",
    user: "oscar",
    port: 3306,
    password: "Omariscool1234!",
    database: "zuma_main",
    // ssl: sslOptions,
  },
  debug: false,
});
