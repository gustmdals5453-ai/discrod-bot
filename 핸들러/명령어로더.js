const fs = require("fs");
const path = require("path");

module.exports = (client)=>{
  client.commands = new Map();

  const load = (dir)=>{
    const files = fs.readdirSync(dir);

    for(const file of files){
      const full = path.join(dir,file);

      if(fs.statSync(full).isDirectory()){
        load(full);
      } else {
        const cmd = require(path.resolve(full));
        client.commands.set(cmd.name, cmd);
      }
    }
  };

  load("./명령어");
};
