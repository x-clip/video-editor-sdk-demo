import axios from 'axios';
import md5 from 'md5';
import { config as iconfig } from './config';
/**
 * 通过userId换取token，该步骤在服务端执行，因为演示，所以在客户端进行了请求
 */
export function getToken(userId: string) {
  // appid 和 secret 可以在后台系统中进行管理
  const config = {
    appid: '8ac8857695db5497912fc5d5a012b467',
    secret: '948c50d144d946ee882d18b01586c618',
  };
  // 第三方用户接入
  const timestamp = +new Date(); // 时间戳
  const sign = md5(timestamp + config.secret).toString();
  // 调用登录接口，获取token
  //@ts-ignore
  return axios({
    url: iconfig.host + '/api/v1/third/login',
    method: 'POST',
    headers: {
      appid: config.appid,
      timestamp,
      sign,
    },
    data: {
      userId, // 假设第三方平台用户id是 user01
    },
  }).then(res => {
    // 设置server token
    return res.data.data;
  });
}
