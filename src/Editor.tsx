import "./initialize.less";
import "./sdk/videoEditorSDK.style.css";
import React, { useRef, useEffect, useState } from "react";
import { VideoEditorSDK } from "./sdk/videoEditorSDK.react.es.min.js";
import { getToken } from "./auth.js";
import { data } from "./data.js";
import { server } from "./server/server.js";
import { config } from "./config.js";
import { sides } from "./Sides";
import { Button } from "@douyinfe/semi-ui";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { storage, util } from "./utils/index.js";

type Props = {};

const Editor = (props: Props) => {
  const videoRef = useRef<any>(null);
  const [token, setToken] = useState<string>("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const params = useParams();
  const idata = useRef(data);

  console.log('params', params)

  useEffect(() => {

    // 模拟一个用户
    let userId = storage.local.get("userId");
    if (!userId) {
      userId = util.randomID();
      storage.local.set("userId", userId);
    }

    // 模拟登录，获取token
    getToken(userId).then(async (res) => {
      server._setRqHeaderToken(res.token);
      setToken(res.token);
      // 获取用户信息
      const [res2, err] = await server.getUserInfo();
      res2.workspaceURL = "/workspace";
      res2.userCenterURL = "/usercenter";
      res2.logout = () => {
        console.log("logout");
      };

      if (params.id) {
        const [res3, err3] = await server.getAppData(params.id);
        const res4 = await axios.get(config.resourcesHost + res3.url);
        idata.current = res4.data;
      }

      setUserInfo(res2);
    });
  }, []);

  useEffect(() => {
    // 确保只创建一次实例
    if (userInfo) {
      videoRef.current = new VideoEditorSDK({
        registerId: "h5ds", // 必填，注册ID，需要去官网进行申请
        movieData: idata.current, // 选填二选一，工程数据，工程数据和作品ID必须传入一个，会优先读取工程数据，如果没有传入工程数据，会通过appid去api server 去获取工程数据
        sides, // 选填，侧边栏配置，默认是null，使用系统默认的侧边栏
        token: token, // 选填，用户token，用于调用api server的接口
        appid: params.id,
        userInfo: userInfo,
        EModuleEffectSourcePath: config.EModuleEffectSourcePath, // 特效资源模块加载路径
        resourceHost: config.resourcesHost, // 资源加载的host
        apiServer: server, // 选填，api server 地址，默认是https://video.h5ds.com
        target: document.getElementById("video-container")!, // 选填，容器，默认是document.body
        loginButtonConfig: {
          id: "login-target",
          className: "login-target",
          Component: () => <a>login</a>,
        },
        exportButtonConfig: {
          id: "export-button",
          className: "export-button",
          Component: (props: any) => (
            <Button
              onClick={() => {
                console.log("export", props);
                window.open(
                  `/export?params=${JSON.stringify({
                    resolution: "720P",
                    fps: 30,
                    format: "mp4",
                    appid: params.id,
                    token: token,
                  })}`,
                  "_blank",
                  "width=600,height=400,top=100,left=100,scrollbars=yes"
                );
              }}
            >
              export
            </Button>
          ),
        },
      });
      videoRef.current.init();
    }
  }, [userInfo]);

  return <div id="video-container"></div>;
};

export default Editor;
