
const config = (() => {
  const env = process.env.NODE_ENV;
  console.log(`env: ${env}`);
  if (env === "production") {
    return {
      firebase: {
        root: "https://sketch-glass.firebaseio.com/"
      },
      api: {
        root: "TODO"
      }
    };
  } else {
    return {
      firebase: {
        root: "https://sketch-glass-dev.firebaseio.com/"
      },
      api: {
        root: "http://localhost:3000"
      }
    };
  }
})();

export default config;
