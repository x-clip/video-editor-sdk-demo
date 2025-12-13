import { Button, Progress, Toast } from '@douyinfe/semi-ui';
import React, { useEffect, useRef, useState } from 'react';
import { util } from './utils';
import { config } from './config';
import styles from './export.module.less';
import axios from 'axios';
import { server } from './server/server';
import { exportMovie } from './sdk/videoEditorSDK.react.es.min.js';

type Props = {};

const Export = (props: Props) => {
  const [data, setData] = useState(null);
  const me = useRef<any>();
  let initValues = util.getUrlQuery('params') as {
    name: string;
    appid: string;
    resolution: '720P' | '1080P';
    fps: number;
    token: string;
    format: 'mp4' | 'mp3' | 'gif';
    gifFps?: number;
    gifSpeed?: number;
    gifWidth?: number;
    gifTimes?: [number, number];
  };
  if (initValues) {
    try {
      initValues = JSON.parse(initValues as any);
    } catch (err) {
      console.error(err);
    }
  }
  const [step, setStep] = useState(0);
  const [mp4URL, setMp4URL] = useState('');
  const [progress, setProgress] = useState<{
    eachSourceName: string;
    eachSourceLoad: number;
    sourceLoad: number;
    encoderAudio: number;
    encoderVideo: number;
  }>({
    eachSourceLoad: 0,
    eachSourceName: '',
    sourceLoad: 0,
    encoderAudio: 0,
    encoderVideo: 0,
  });

  useEffect(() => {
    console.log('initValues', initValues);
    server._setRqHeaderToken(initValues.token);
    server.getAppData(initValues.appid).then(async (r: any) => {
      const [res, err] = r;
      if (!err) {
        const jdata = (await axios.get(`${config.resourcesHost}/${res.url}?t=` + +new Date())) as any;
        // const data = util.reJSON(jdata);
        console.log('jddddd', jdata);
        setData(jdata.data);
      } else {
        Toast.error(err);
      }
    });

    return () => {
      if (me.current) {
        me.current.destroy();
        me.current = null;
      }
    };
  }, []);

  if (!initValues) {
    return <div>参数错误</div>;
  }

  return (
    <>
      <div className={styles.export}>
        <div className={styles.exportInner}>
          {step === 1 && (
            <>
              <div>
                <Progress percent={~~(progress.sourceLoad * 100)} showInfo type="line" width={300} />
                <span className={styles.name}>
                  加载进度
                  {~~(progress.sourceLoad * 100)}%
                </span>
              </div>
              <div>
                <Progress percent={~~(progress.encoderVideo * 100)} showInfo type="line" width={300} />
                <span className={styles.name}>
                  编码进度
                  {~~(progress.encoderVideo * 100)}%
                </span>
              </div>
              <div>
                {progress.sourceLoad !== 1 ? (
                  <span className={styles.sourceLoad}>
                    资源加载：
                    {progress.eachSourceName}({~~(progress.eachSourceLoad * 100)}%)
                  </span>
                ) : (
                  <span className={styles.sourceLoad}>
                    {mp4URL ? (
                      <>
                        <p>
                          合成成功
                          <br />
                          <br />
                          <a className={styles.down} download={initValues.name + '.mp4'} href={mp4URL}>
                            下载
                          </a>
                        </p>
                      </>
                    ) : (
                      '合成中，请勿关闭此窗口...'
                    )}
                  </span>
                )}
              </div>
            </>
          )}
          {step === 0 && data && (
            <div style={{ textAlign: 'center' }}>
              <Button
                size="large"
                type="primary"
                theme="solid"
                style={{ fontSize: 16, padding: 25 }}
                onClick={() => {
                  exportMovie({
                    format: 'mp4',
                    fps: 30,
                    resolution: '720P',
                    data,
                    onBefore: async (obj: any) => {
                      setStep(1);
                      setMp4URL('');
                      setProgress({
                        eachSourceLoad: 0,
                        eachSourceName: '',
                        sourceLoad: 0,
                        encoderAudio: 0,
                        encoderVideo: 0,
                      });
                      console.log('onBefore', obj);
                    },
                    onFinish: async (obj: any) => {
                      setMp4URL(obj.url);
                      console.log('onFinish', obj);
                    },
                    onProgress: async (obj: any) => {
                      console.log('onProgress', obj);
                      setProgress(obj);
                    },
                  });
                  //   onSubmit(initValues, data);
                }}
              >
                选择文件夹
              </Button>
              <p className={styles.tip}>导出完成后，会在指定文件夹生成 mp4 文件</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Export;
