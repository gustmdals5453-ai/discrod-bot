module.exports = {
  name: "경고확인",

  async execute(m, args, { getUser, E }) {

    const 대상 = m.mentions.users.first() || m.author;
    const u = await getUser(대상.id);

    return m.reply({
      embeds: [
        E("경고 확인", 0xFEE75C).setDescription(
`## ⚠️ 경고 정보

## 👤 대상
<@${대상.id}>

~~~diff
! 누적 경고: ${u.warns}회
~~~

## 📄 사유
${u.warnList.length ? u.warnList.join("\n") : "없음"}`
        )
      ]
    });

  }
};
