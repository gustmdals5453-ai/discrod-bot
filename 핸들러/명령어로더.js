const fs = require("fs");
const path = require("path");

module.exports = (client)=>{
  client.commands = new Map();

  const 불러오기 = (dir)=>{
    const files = fs.readdirSync(dir);

    for(const file of files){
      const fullPath = path.join(dir, file);

      if(fs.statSync(fullPath).isDirectory()){
        불러오기(fullPath);
      } else {
        const cmd = require(path.resolve(fullPath)); // 🔥 핵심
        client.commands.set(cmd.name, cmd);
      }
    }
  };

  불러오기("./명령어"); // 🔥 중요
};
