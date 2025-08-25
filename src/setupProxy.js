const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://llm-rag-api-a8768292f672.herokuapp.com', // 백엔드 주소
      changeOrigin: true,
      // 필요 시
      // pathRewrite: { '^/api': '' },
    })
  );
};