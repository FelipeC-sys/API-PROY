export const environment = {
  production: false,
  // En desarrollo usamos la ruta relativa '/api' para que el proxy
  // (proxy.conf.json) reenvíe las peticiones al backend real y evitar CORS.
  apiUrl: '/api'
};