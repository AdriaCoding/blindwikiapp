const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Configurar CORS
app.use(cors());

// Configurar el proxy
app.use('/', createProxyMiddleware({
  target: 'https://api.blind.wiki',
  changeOrigin: true,
  pathRewrite: {
    '^/': '/', // reescribir la ruta
  },
  onProxyRes: function (proxyRes, req, res) {
    // Agregar headers CORS
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  },
}));

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 