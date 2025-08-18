module.exports = {
  style: {
    postcss: {
      mode: "file",
      loaderOptions: {
        postcssOptions: {
          plugins: {
            "@tailwindcss/postcss": {},   // ✅ v4 플러그인
            autoprefixer: {},
          },
        },
      },
    },
  },
};