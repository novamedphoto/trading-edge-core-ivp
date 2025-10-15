import * as mock from "./mock.js";
export function brokerFactory(kind: string) {
  switch ((kind || "mock").toLowerCase()) {
    case "mock": return mock;
    default: return mock;
  }
}
