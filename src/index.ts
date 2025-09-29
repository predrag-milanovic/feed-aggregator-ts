import { readConfig, setUser } from "./config";
function main() {
  setUser("Predrag");
  const cfg = readConfig();
  console.log(cfg);
}

main();
