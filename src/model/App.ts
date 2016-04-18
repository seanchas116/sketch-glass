import Variable from "../lib/rx/Variable";
import User from "./User";
import Canvas from "./Canvas";

export default
class App {
  user = new Variable<User>(null);
  canvas = new Variable<Canvas>(null);
}

export const app = new App();
