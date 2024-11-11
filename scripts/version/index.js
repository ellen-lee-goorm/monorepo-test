/**
 * 버전 업데이트시에 진행되어야 하는 작업들을 실행하는 스크립트
 * 1. CHANGELOG 파일을 vapor-docs에도 업데이트
 * 2. 바뀐 버전에 맞춰서 dev용 파운데이션들을 빌드
 * 3. 커밋
 */

const { exec } = require("child_process");
const fs = require("fs");

const runCommand = async (command) => {
  return new Promise((resolve, reject) => {
    console.log(`실행중: ${command}...`);

    exec(command, (error, stdout) => {
      if (error) {
        reject(error);
      }
      console.log(`실행 결과:\n${stdout}`);
      resolve(stdout);
    });
  });
};

const main = async () => {
  try {
    // 명령줄 인자를 파싱
    const args = process.argv.slice(2);
    const shouldPush = !args.includes("--no-push");
    const shouldGitTag = !args.includes("--no-git-tag-version");

    // await runCommand("yarn copy-changelog");
    // await runCommand("yarn build:vapor-foundation:dev:all");

    // 버전 업데이트시 자동화 작업과 러나 버전 업데이트 작업을 하나의 커밋으로 묶기 위해 패키지 버전을 가져옴.
    const lernaJson = JSON.parse(fs.readFileSync("lerna.json", "utf-8"));
    const newVersion = lernaJson.version;

    // 커밋 생성
    await runCommand(`git commit -am "chore(release): publish v${newVersion}"`);

    // 태그 생성
    if (shouldGitTag) await runCommand(`git tag v${newVersion}`);

    // 변경 사항과 태그를 원격 저장소로 푸시
    if (shouldPush) {
      await runCommand("git push");
      if (shouldGitTag) await runCommand(`git push origin v${newVersion}`);
    }
  } catch (e) {
    console.error(`에러 발생!\n${e}`);
  }
};

main();
