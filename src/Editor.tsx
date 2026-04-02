import "./initialize.less";
import "./sdk/videoEditorSDK.style.css";
import { useRef, useEffect, useState } from "react";
import { VideoEditorSDK } from "./sdk/videoEditorSDK.react.es.min.js";
import { data } from "./data.js";
import { server } from "./server/server.js";
import { config } from "./config.js";
import { useParams } from "react-router-dom";

type Props = {};

const Editor = (props: Props) => {
  const videoRef = useRef<any>(null);
  const [token, setToken] = useState<string>(
    localStorage.getItem("token") || "",
  );
  const [userInfo, setUserInfo] = useState<any>(
    JSON.parse(localStorage.getItem("userInfo") || null),
  );
  const params = useParams();
  const idata = useRef(data);

  console.log("params", params, userInfo, token);

  if (userInfo) {
    userInfo.logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      location.reload();
    };
  }

  useEffect(() => {
    // 确保只创建一次实例
    videoRef.current = new VideoEditorSDK({
      registerId: "h5ds", // 必填，注册ID，需要去官网进行申请
      movieData: idata.current, // 选填二选一，工程数据，工程数据和作品ID必须传入一个，会优先读取工程数据，如果没有传入工程数据，会通过appid去api server 去获取工程数据
      // sides, // 选填，侧边栏配置，默认是null，使用系统默认的侧边栏
      token: token, // 选填，用户token，用于调用api server的接口
      appid: params.id,
      userInfo: userInfo,
      workerPath: config.workerPath, // 选填，worker 路径，默认是当前目录
      EModuleEffectSourcePath: config.EModuleEffectSourcePath, // 特效资源模块加载路径
      resourcesHost: config.resourcesHost, // 资源加载的host
      apiServer: server, // 选填，api server 地址，默认是https://video.h5ds.com
      callback: (data: any) => {
        console.log("callBack", data);
      },
      onLoginSuccess: (data: any) => {
        localStorage.setItem("userInfo", JSON.stringify(data));
        localStorage.setItem("token", data.token);
        location.reload();
      },
      saveAppCallback: (data: any) => {
        console.log("saveAppCallback", data);
      },
      target: document.getElementById("video-container")!, // 选填，容器，默认是document.body
    });
    videoRef.current.init();
    console.log("videoRef.current", videoRef.current);
  }, []);

  return <div id="video-container"></div>;
};

export default Editor;
