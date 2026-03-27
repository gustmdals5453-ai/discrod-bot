const fs = require("fs");
const path = require("path");

module.exports = (client)=>{
  client.commands = new Map();

  const 불러오기 = (dir)=>{
    const files = fs.readdirSync(dir);

    for(const file of files){
      const full = path.join(dir,file);

      if(fs.statSync(full).isDirectory()) {
        불러오기(full);
      } else {
        const cmd = require(full);
        client.commands.set(cmd.name, cmd);
      }
    }
  };

  불러오기("./명령어");
};