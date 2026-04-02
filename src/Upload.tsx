import styles from "./upload.module.less";
import { Button, Toast, Upload } from "@douyinfe/semi-ui";
import { util } from "./utils";
import { config } from "./config";
// import qrcodeConfig from '@plugins/qrcode';
import { server } from "./server/server";
import { Upload as UploadIcon } from "@icon-park/react";
// import $ from 'jquery';
import { useReducer, useRef, useState } from "react";
import { uploadInfo } from "./utils/uploadInfo.es.js";
import { Link } from "react-router-dom";

interface IProps {}

function Uploads(props: IProps) {
  const token = util.getUrlQuery("token") as string;
  const appid = util.getUrlQuery("appid") as string;
  const uploadRef = useRef<any>();
  const cacheInfoData = useRef<Record<string, any>>({});
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [items, setItems] = useState([]);
  server._setRqHeaderToken(token);
  console.log("token", token);

  return (
    <>
      <div className={styles.export}>
        <Link to="/editor">editor</Link>
        <div>
          <Upload
            style={{ width: "100%" }}
            accept=".gif, .png, .jpeg, .jpg, .svg, .aac, .wav, .mp3, .mp4, .mov"
            action={location.origin + "/api/v1/common/upload/form"}
            uploadTrigger="auto"
            headers={{
              Authorization: token,
            }}
            ref={uploadRef}
            maxSize={1000 * 1024}
            multiple={true}
            limit={10}
            draggable={true}
            showUploadList={true}
            className={styles.btn1}
            onAcceptInvalid={(v) => {
              console.log(">>>>", v);
            }}
            beforeUpload={async (v: any) => {
              if (!token) {
                Toast.warning("token失效");
                return {
                  shouldUpload: false,
                  status: "error",
                };
              }
              const ftype = v.file.fileInstance.type.split("/")[0];
              let thumb = ftype === "image" ? v.file.url : "";
              if (ftype === "image") {
                const base64 = (await util.blobURL2Data(
                  v.file.url as any
                )) as string;
                const thumbBase64 = (await util.resizeBase64Image(
                  base64,
                  200
                )) as string;
                const [res] = await server.uploadBase64({
                  content: thumbBase64,
                  name: v.file.name,
                  file_type: "image",
                });
                thumb = res.storage_path;
              }

              cacheInfoData.current[v.file.name] = {
                fileInfoSuccess: false,
                id: v.file.uid,
                progress: 0,
                status: "ready",
                thumb,
                type: v.file.fileInstance.type,
                size: v.file.fileInstance.size,
                name: v.file.name,
              };
              // 获取blob url
              uploadInfo
                .getUploadBeforeData({
                  url: v.file.url,
                  type: util.getFileTypeByURL("", v.file.name.split(".")[1]),
                  uploadBase64: server.uploadBase64,
                  file: v.file.fileInstance,
                  reURL: (url: string) => {
                    return config.resourcesHost + url;
                  },
                  workerPath: config.workerPath,
                })
                .then((info: any) => {
                  return Object.assign(cacheInfoData.current[v.file.name], {
                    fileInfoSuccess: true, // 表示文件预处理数据获取成功
                    ...info,
                  });
                })
                .catch((err: any) => {
                  console.error("截帧异常丢给后端处理", err);
                  // 异常丢给后端处理
                  Object.assign(cacheInfoData.current[v.file.name], {
                    fileInfoSuccess: true, // 表示文件预处理数据获取成功
                  });
                });
              Object.assign(cacheInfoData.current[v.file.name], {
                status: "uploadStart",
                progress: 0,
              });
              forceUpdate();
              return {
                shouldUpload: true,
                status: "success",
              };
            }}
            onProgress={(p, file) => {
              cacheInfoData.current[file.name].status = "uploading";
              cacheInfoData.current[file.name].progress = p;
              forceUpdate();
            }}
            onSuccess={async (res, file, all) => {
              if (res.code !== 0) {
                Toast.error(res.message);
                cacheInfoData.current[file.name].status = "uploaded";
                forceUpdate();
                return;
              }
              cacheInfoData.current[file.name].status = "decoding";
              forceUpdate();

              // 可能在转码中，需要等待
              // 等待
              while (!cacheInfoData.current[file.name].fileInfoSuccess) {
                console.log("等待截取帧");
                await util.sleep(1000);
              }
              console.log("截帧完成!");

              const { name, thumb, progress, id, status, ...other } =
                cacheInfoData.current[file.name];
              const attrs: Record<string, any> = {};
              for (let key in other) {
                if (key.split("")[0] !== "_") {
                  attrs[key] = other[key];
                }
              }
              const url = res.data.storage_path;
              // 保存到素材库
              const [item, err] = await server.createUserMaterial({
                app_id: appid,
                name: name,
                urls: { url, thumb },
                attrs,
              });
              cacheInfoData.current[file.name].status = "uploaded";
              forceUpdate();
              //@ts-ignore
              items.unshift(item);
              setItems([...items]);
            }}
            onError={(...v) => console.log("error", v)}
          >
            <Button
              iconPosition="left"
              theme="solid"
              size="large"
              type="primary"
              block
              icon={<UploadIcon theme="outline" size="20" fill="#FFF" />}
            >
              上传文件
            </Button>
          </Upload>
        </div>
      </div>
    </>
  );
}

export default Uploads;
