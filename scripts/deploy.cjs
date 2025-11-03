// scripts/deploy.cjs
require("ts-node/register/transpile-only");
require("dotenv").config();
const path = require("path");

(async () => {
  console.log("🚀 Running deploy.ts through ts-node (CommonJS mode)...");

  // Carga el archivo deploy.ts directamente
  const deployScript = path.resolve(__dirname, "deploy.ts");
  require(deployScript);
})();
