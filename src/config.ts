
const config = (() => {
  const env = process.env.NODE_ENV;
  console.log(`env: ${env}`);
  if (env === "production") {
    return {
      firebase: {
        root: "https://sketch-glass.firebaseio.com/"
      },
      api: {
        root: "TODO",
        applicationID: "TODO"
      }
    };
  } else {
    return {
      firebase: {
        root: "https://sketch-glass-dev.firebaseio.com/"
      },
      api: {
        root: "http://localhost:3000",
        applicationID: "12cfae3078f88150c158ee2d1d0373bf5548ed9f45e0fff7ae72eb31c94711d0"
      }
    };
  }
})();

export default config;
