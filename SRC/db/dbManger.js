
exports.query_manager = require("knex")({
  client: "mysql2",
  connection: {
    host: "76.50.237.33",
    user: "oscar",
    port: 3306,
    password: "Omariscool1234!",
    database: "zuma_main",
    // ssl: sslOptions,
  },
  debug: false,
});
