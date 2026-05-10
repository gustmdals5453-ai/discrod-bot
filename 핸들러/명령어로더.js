const fs = require("fs");
const path = require("path");

module.exports = (client) => {

  client.commands = new Map();

  const load = (dir) => {

    const files = fs.readdirSync(dir);

    for (const file of files) {

      const full = path.join(dir, file);

      // 폴더면 재귀
      if (fs.statSync(full).isDirectory()) {

        load(full);
        continue;

      }

      // js 파일만 로드
      if (!file.endsWith(".js")) continue;

      try {

        const cmd = require(path.resolve(full));

        const commandName = cmd.name || cmd.이름;

        if (!commandName) {

          console.log(`${file} 명령어 이름 없음`);
          continue;

        }

        client.commands.set(commandName, cmd);

        console.log(`${commandName} 명령어 로드 완료`);

      } catch (err) {

        console.error(`❌ ${file} 로드 실패`);
        console.error(err);

      }
    }
  };

  load("./명령어");

};
