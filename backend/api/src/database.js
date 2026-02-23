const Pool = require('pg').Pool;

function getHost() {
    let host = process.env.POSTGRES_HOST;
    console.log(`read process.env.POSTGRES_HOST: "${host}"`);
    if (typeof host === 'undefined' || host === null) {
        host = "localhost";
    }
    console.log(`Pool using host: ${host}`);
    return host;
}

// when running in docker, the host name is the docker network host 
// host: "database", -- set by compose.yaml
// but when native
// host: "localhost",
const pool = new Pool({
    user: "postgres",
    password: "password",
    database: "postgres",
    host: getHost(),
    port: 5432
});

module.exports = pool;