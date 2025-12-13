import BasicService from './BasicService';
import type * as st from '../sdk/sdk.d';

class Server extends BasicService {
  /**
   * @desc 创建视频
   */
  createApp = (data: st.CreateAppParams) => {
    return this.post('/api/v1/user/apps/create', data);
  };

  getUserInfo = () => {
    return this.get('/api/v1/account/info');
  };

  /**
   * 获取用户作品详情
   * @param {string} id
   * @returns
   */
  getAppData = (id: string) => this.get('/api/v1/user/apps/info', { params: { id } });
  /**
   * 删除作品
   * @param {*} id
   * @returns
   */
  deleteApp = (id: string) => this.post('/api/v1/user/apps/delete', { params: { id } });
  /**
   * 更新草稿
   * @param {*} id
   * @param {*} params
   * @returns
   */
  updateApp = (params: st.UpdateAppParams) => this.post('/api/v1/user/apps/update', params);

  /**
   * 上传base64图片
   * @param params
   * @returns
   */
  uploadBase64 = (params: st.UploadBase64Params) => {
    return this.post(`/api/v1/common/upload/base64`, {
      ...params,
      is_original_name: 0,
      prefix_path: '/uploads',
      disk: 'oss',
      client: 'public',
    });
  };

  /**
   * 服务端执行视频&资源的倒放业务
   * @param id：资源ID
   * @param from：用户资源或者是系统资源
   * @returns
   */
  videoReplay = (id: string, from: 'user' | 'system' | 'other' | 'admin') => {
    return this.post(`/api/v1/common/materialJobs/reverse`, {
      source: from === 'user' ? 'user_material' : 'material',
      source_id: id,
    });
  };

  /**
   * 查询倒放的状态
   * @param ids
   * @returns
   */
  seekVideoReplayStatus = (ids: string[]) => {
    return this.post(`/api/v1/user/materials/status`, {
      ids,
    });
  };

  /**
   * 获取分类列表
   */
  getMaterialTypes = (type: string) => {
    const typeMap = {
      text: 311,
      image: 312,
      audio: 313,
      video: 314,
      sticker: 315,
      effect: 316,
      filter: 317,
      transition: 318,
    };
    return this.get(`/api/v1/common/type-items/page`, {
      params: { type_id: typeMap[type] || '', page_size: 999 },
    }).then(res => {
      const [re, err] = res;
      return [re.data, err];
    });
  };

  /**
   * 获取模版的分类
   * @returns
   */
  getTemplateTypes = () => {
    return this.get(`/api/v1/template/categories/tree`, { params: { page_size: 99 } });
  };

  /**
   * 获取素材
   */
  getMaterials = (params: st.MaterialParams) => {
    if (params.type === 'video') {
      params.convert_status = 2;
    }
    return this.get('/api/v1/materials/page', { params });
  };

  /**
   * 搜索模版
   * @param params
   * @returns
   */
  getTemplates = (params: st.TemplateParams) => {
    return this.get('/api/v1/templates/page', {
      params: {
        ...params,
      },
    }).then(arg => {
      const [res, err] = arg;
      res.data.forEach(d => {
        d.type = 'template';
      });
      return [res, err];
    });
  };

  // 搜藏元素
  collect = (params: { source_id: string; type: string }) => {
    return this.post(`/api/v1/user/collects/create`, { ...params });
  };

  // 取消收藏
  collectCancle = (source_id: Array<string>) => {
    return this.post(`/api/v1/user/collects/cancel`, { source_id });
  };

  // 获取收藏列表
  getCollects = (params: st.CollectParams) => {
    return this.get(`/api/v1/user/collects/page`, { params });
  };

  // 表单上传
  formUpdate = (formdata: FormData) => {
    return this.post(`/api/v1/common/upload/form`, formdata);
  };

  // 获取用户素材
  getUserMaterial = (params: st.MaterialParams) => {
    return this.get(`/api/v1/user/materials/page`, { params });
  };

  /**
   * 获取分类列表
   * @param {string} workbench.schema
   * @param {object} params
   * @returns
   */
  getUserMaterialType = (params: { type: string }) => this.get('/api/v1/user/categories/page', { params });

  // 删除用户素材
  deleteUserMaterial = (ids: string[]) => {
    console.log('批量删除', ids);
    return this.post(`/api/v1/user/materials/delete`, { id: ids });
  };

  /**
   * 新增用户素材
   * @param params
   * @returns
   * {
    category_id?: string; // 直接创建到该分类下面
    app_id?: string;
    name: string;
    urls: Record<string, any>;
    attrs: Record<string, any>;
    size?: number;
  }
   */
  createUserMaterial = (params: st.CreateUserMaterialParams) => {
    return this.post(`/api/v1/user/materials/create`, { ...params });
  };

  // 云合成
  createTask = (data: {
    source: 'user_app';
    source_id: string;
    params: {
      fps: number;
      resolution: string;
      jsonUrl: string;
      // storageUrl: '/videos/1/output.mp4';
      // callback: 'http://localhost:8000/api/callback';
    };
  }) => {
    return this.post(`/api/v1/user/app/tasks/create`, data);
  };

  /**
   * 更新用户的素材
   * @param params
   * @returns
   *id: string;
    category_id?: string; // 直接创建到该分类下面
    app_id?: string;
    name?: string;
    urls?: Record<string, any>;
    attrs?: Record<string, any>;
    size?: number;
   */
  updateUserMaterial = (params: st.UpdateUserMaterialParams) => {
    return this.post(`/api/v1/user/materials/update`, { ...params });
  };

  // tts
  createTTS = (params: st.CreateTTSParams) => {
    return this.post('/api/v1/common/tts/huoshan', params);
  };

  // ai字幕
  createCaption = (url: string) => {
    return this.post('/api/v1/common/filetrans/huoshan', {
      audio: {
        format: 'mp3',
        codec: 'pcm',
      },
      url: url,
    });
  };

  // 字幕任务
  seekCaptionTask = (taskId: string) => {
    return this.get(`/api/v1/common//filetrans/huoshan_info?TaskId=${taskId}`);
  };
}

export const server = new Server();

/**
 * 获取素材的列表Items数据
 * @param type
 * @param params
 * @param items
 * @returns
 */
export async function getItems(
  type: string,
  params: {
    page: number;
    page_size: number;
    keyword: string;
    category_id?: string;
  },
  items: any[],
  apiServer: (n: any) => Promise<[any, string | null]>,
) {
  let res: { data: any[]; total: number }, err: any;
  [res, err] = await apiServer({
    type,
    ...params,
  });
  // if (apiServer) {
  //   [res, err] = await apiServer({
  //     type,
  //     ...params,
  //   });
  // } else {
  //   if (type === 'template') {
  //     [res, err] = await server.getTemplateItems({
  //       ...params,
  //     });
  //   } else {
  //     [res, err] = await server.getMaterialItems({
  //       type,
  //       ...params,
  //     });
  //   }
  // }

  if (!err) {
    const list = [
      ...(items || []),
      ...res.data.map((d: any) => {
        // 收藏列表数据结构特殊
        if (d.material) {
          d = d.material;
        }
        const size = { width: d.width || d.attrs?.width || 1920, height: d.height || d.attrs?.height || 1080 };
        switch (d.type) {
          case 'audio':
            size.width = 100;
            size.height = 20;
            break;
          case 'effect':
          case 'text':
          case 'filter':
            size.width = 100;
            size.height = 100;
            break;
          case 'transition':
            size.width = 100;
            size.height = 70;
            break;
        }
        return { ...d, ...size };
      }),
    ];
    return {
      list,
      hasMore: res.total > list.length,
    };
  } else {
    return {
      list: [],
      hasMore: false,
    };
  }
}
