import fs from "fs";

const statistics = "statistics.json";
class OtherFunction {
  constructor() {
    if (!OtherFunction.instance) {
      this.initialize();
    }
  }
  initialize() {}

  CreateFile(jsonData) {
    try {
      let data = jsonData;
      //   data.push(scores);
      fs.writeFileSync("statistics.json", JSON.stringify(data));
      console.log(jsonData);
    } catch (err) {
      console.log(err);
    }
  }
}

const instance = new OtherFunction();
Object.freeze(instance);

export default instance;
