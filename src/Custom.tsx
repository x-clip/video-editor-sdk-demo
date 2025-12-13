import { Button } from '@douyinfe/semi-ui';
import React from 'react';

type Props = {
  editor: any;
};

const Custom = (props: Props) => {
  const { editor } = props;
  return (
    <div>
      <Button
        onClick={async () => {
          // 创建一个图片元素
          console.log('editor', editor);
          const resource = {
            id: 'WXTbV1Vu5i',
            name: 'lemons-986304.jpg',
            type: 'image',
            url: '/video/materials/images/lemons-986304.jpg',
            originId: '656104432542244864',
            thumb: '/video/materials/images/lemons-986304_thumb.jpg',
            styleSize: {
              width: 1280,
              height: 960,
            },
            noAudioTracks: true,
            fileType: 'image',
            from: 'system',
            mustFetch: true,
            duration: null,
            attrs: {
              width: 1280,
              height: 960,
            },
          };
          const elementData = await editor.movie.addElementByResource(resource as any, {
            time: editor.currentTime,
            trackIndex: 1,
            elementType: 'image',
            duration: 10,
          });
          // 选中元素
          editor.setContorlAndSelectedElemenent([elementData.id]);
        }}
      >
        添加图片
      </Button>
    </div>
  );
};

export default Custom;
