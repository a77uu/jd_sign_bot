// version v0.0.2
// create by ruicky
// detail url: https://github.com/ruicky/jd_sign_bot

const exec = require('child_process').execSync;
const fs = require('fs');
const rp = require('request-promise');
const download = require('download');

// 公共变量
const KEY = process.env.JD_COOKIE;
const corpid = process.env.CORPID;
const corpsecret = process.env.CORPSECRET;
const DualKey = process.env.JD_COOKIE_2;


async function downFile () {
    // const url = 'https://cdn.jsdelivr.net/gh/NobyDa/Script@master/JD-DailyBonus/JD_DailyBonus.js'
    const url = 'https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js';
    await download(url, './');
}

async function changeFile () {
   let content = await fs.readFileSync('./JD_DailyBonus.js', 'utf8')
   content = content.replace(/var Key = ''/, `var Key = '${KEY}'`);
   if (DualKey) {
    content = content.replace(/var DualKey = ''/, `var DualKey = '${DualKey}'`);
   }
   await fs.writeFileSync( './JD_DailyBonus.js', content, 'utf8')
}

async function sendNotify (text,desp,token) {
    const option = {
        uri: 'https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=' + token,
        form: {
            "touser": "@all",
            "msgtype": "text",
            "agentid": 1000002,
            "text" : {
                "content" : desp
            },
            "safe": 1
        },
        json: true,
        method: 'POST'
    }
    await rp.post(option).then(res=> {console.log(res)})
}

async function start(token) {
  if (!KEY) {
    console.log('请填写 key 后在继续')
    return
  }
  // 下载最新代码
  await downFile();
  console.log('下载代码完毕')
  // 替换变量
  await changeFile();
  console.log('替换变量完毕')
  // 执行
  await exec("node JD_DailyBonus.js >> result.txt");
  console.log('执行完毕')

  if (corpsecret) {
    const path = "./result.txt";
    let content = "";
    if (fs.existsSync(path)) {
      content = fs.readFileSync(path, "utf8");
    }
    let t = content.match(/【签到概览】:((.|\n)*)【签到奖励】/)
    let res = t ? t[1].replace(/\n/,'') : '失败'
    let t2 = content.match(/【签到奖励】:((.|\n)*)【其他奖励】/)
    let res2 = t2 ? t2[1].replace(/\n/,'') : '总计0'

    
    await sendNotify("" + ` ${res2} ` + ` ${res} ` + new Date().toLocaleDateString(), content, token);
  }
}

async function fetchToken () {
    const options = {
        uri : `https://qyapi.weixin.qq.com/cgi-bin/gettoken`,
        qs: {
            corpid,corpsecret
        },
        method: 'GET'
    }
    await rp.get(options).then(res => {
        var token = JSON.parse(res).access_token
        start(token);
    })
    
}

fetchToken();
