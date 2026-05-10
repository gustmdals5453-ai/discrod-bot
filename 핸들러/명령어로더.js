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

        // 이름 체크
        const commandName = cmd.name || cmd.이름;

        if(!commandName) {
          console.log(`${file} 명령어 이름 없음`);
          continue;
        }

        client.commands.set(commandName, cmd);

        console.log(`${commandName} 명령어 로드 완료`);

      }

    }

  };

  load("./명령어");

};
