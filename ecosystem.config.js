// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "test-pcert",
      script: "./src/index.js",
      watch: false,
      restart_delay: 5000,   // espera 5 segundos antes de reiniciar
      env: {
        NODE_ENV: "production",
        PORT: 6723
      }
    }
  ]
};