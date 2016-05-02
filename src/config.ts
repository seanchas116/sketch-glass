
const config = (() => {
  const env = process.env.NODE_ENV;
  console.log(`env: ${env}`);
  if (env === "production") {
    return {
      google: {
        clientID: "505664874088-43685mt6pknd2fl8jicmikv94p4g5tgi.apps.googleusercontent.com"
      }
    };
  } else {
    return {
      google: {
        clientID: "505664874088-01422r75947r0t9ib3mtqgaue3k00nfk.apps.googleusercontent.com"
      }
    };
  }
})();

export default config;
