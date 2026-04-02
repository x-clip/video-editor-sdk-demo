import { MovieData, PluginConfig } from '@video/core/src/react-pixi/types/data';

export interface AiVideoParams {
  task_type: string;
  params: {
    model: string;
    content: {
      type: 'text';
      text: string;
    }[];
    options: {
      ratio: string;
      duration: number;
      fps: number;
      resolution: string;
      seed: number; // 默认是-1
    };
  };
}

export interface AiImageParams {
  task_type: string;
  params: {
    image_url: string;
    driving_video_info: {
      store_type: number; // 默认是0
      video_url: string;
    };
  };
}

export interface VideoEditorSDKParams {
  target: HTMLDivElement;
  appid?: string;
  token?: string;
  // 水印配置
  watermark?: IWatermark;
  userInfo?: UserInfo;
  movieData?: MovieData; // 选填二选一，工程数据，工程数据和作品ID必须传入一个，会优先读取工程数据，如果没有传入工程数据，会通过appid去api server 去获取工程数据
  workerPath?: string; // worker资源地址： decode.worker.js  gif.worker.js
  apiServer?: APIServer;
  plugins?: PluginConfig[];
  resourcesHost?: string;
  sides?: SideItem[] | null; // 侧边栏
  saveAppCallback?: (res: any) => void; // 保存的回调
  exConfig?: {
    mobileUpload?: boolean; // 是否移动端上传
    // 最大媒体轨道数量
    maxMediaTrackNum: number;
    // 支持多语言
    supportLanguage: boolean;
    // 显示项目按钮
    showProjectButton: boolean;
    logoLink?: string;
    // 自定义logo链接
    logoOnClick?: () => void; // 如果填写了，logoLink失效
    // 自定义logo
    logo: (themeType: 'light' | 'dark') => string;
  };
  loginButtonConfig?: {
    id: string; // 容器的ID
    className: string; // 容器的类名
    Component?: React.FC; // 登录组件
  };
  exportButtonConfig?: {
    id: string; // 容器的ID
    className: string; // 容器的类名
    Component?: React.FC; // 导出组件
  };
}

export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  logout: () => void; // 退出登录
}

export interface SideItem {
  type: string;
  name: string;
  enName: string;
  icon: React.ReactNode;
  simple?: boolean; // 是否简单模式展示
  panel?: React.ReactNode;
}

export interface PageParams {
  page: number;
  page_size: number;
}

// 素材参数
export interface MaterialParams extends PageParams {
  type: string;
  category_id?: string | number;
  convert_status?: number;
  keyword?: string;
}

export interface TemplateParams extends PageParams {
  category_id?: string | number;
  keyword?: string;
}

export interface CreateAppParams {
  source_id: string; //来源Id
  category_id: string | number; //分类Id
  name: string; //名称
  description: string; //描述
  duration: number; //时长（毫秒）// editor.movie.getTotalTime()
  width: number; //宽度
  height: number; //高度
  thumb: string; //封面图url
  data: MovieData; // JSON数据
}

export interface UpdateAppParams extends Partial<CreateAppParams> {
  id: string;
}

export interface UserMaterialParams extends PageParams {
  app_id?: string;
  keyword: string;
  category_id: string;
}

export interface CreateUserMaterialParams {
  app_id: string;
  name: string;
  category_id?: string;
  urls: { url: string; thumb?: string };
  attrs: Record<string, any>;
  size?: number;
}

export interface CreateTTSParams {
  text: string; // 内容
  config: {
    voice_type: string; // 音色
    speed_ratio: number; // 语速 //语速，[0.8~2]，默认为 1，通常保留一位小数即可
  };
  options: Record<string, any>;
}

export interface UpdateUserMaterialParams extends Partial<CreateUserMaterialParams> {
  id: string;
}

export interface UserMaterialTypeParams extends PageParams {
  type: string; // material
}

// 获取收藏列表的参数
export interface CollectParams extends PageParams {
  type: string;
  category_id?: string | number;
  keyword?: string;
}

export interface UploadBase64Params {
  content: string;
  name: string;
  file_type?: string;
}

export interface AppDetailRes {}

export interface TemplateItemRes {}

export interface MaterialItemRes {
  id: string;
  name: string;
  size: number;
  updatedAt: string;
  createdAt: string;
  type: string;
  attrs: {
    duration?: number;
    wave?: string;
    frames?: string;
    videoWidth?: number;
    videoHeight?: number;
    naturalWidth?: number;
    naturalHeight?: number;
    width?: number;
    height?: number;
  };
  urls: {
    url: string;
    thumb: string;
    filename: string;
  };
}

export type Err = string | null;

export interface APIServer {
  // 获取appData数据
  getAppData: (appid: string) => Promise<[{ url: string }, Err]>;
  // 创建新的作品
  createApp: (params: CreateAppParams) => Promise<[{ id: string }, Err]>;
  // 云合成
  createTask: (data: {
    source: 'user_app';
    source_id: string;
    params: {
      fps: number;
      resolution: string;
      jsonUrl: string;
    };
  }) => Promise<[{ url: string }, Err]>;

  // 获取AI视频生成任务列表
  getAiTaskList: (params: PageParams) => Promise<[any, Err]>;
  // 删除AI视频生成任务
  deleteAiTask: (ids: string[]) => Promise<[string, Err]>;
  // 创建AI视频生成任务
  createAiTask: (params: st.AiVideoParams | st.AiImageParams) => Promise<[any, Err]>;
  // 轮训AI视频生成任务状态
  seekAiTaskStatus: (ids: string[]) => Promise<[any, Err]>;

  // 轮训上传状态
  seekVideoReplayStatus: (ids: string[]) => Promise<[any, Err]>;

  // 更新作品
  updateApp: (params: UpdateAppParams) => Promise<[string, Err]>;
  // 删除作品
  deleteApp?: (id: string) => Promise<[string, Err]>;
  // 获取模版的分类信息
  getTemplateTypes: () => Promise<[{ name: string; id: string }[], Err]>;
  // 获取模版列表
  getTemplates: (params: TemplateParams) => Promise<[{ name: string; id: string }[], Err]>;
  // 获取用户信息
  getUserInfo: (token: string) => Promise<[{ name: string; id: string }[], Err]>;
  // 获取素材的分类
  getMaterialTypes: (type: string) => Promise<[{ name: string; id: string }[], Err]>;
  // 获取素材
  getMaterials: (params: MaterialParams) => Promise<
    [
      {
        data: { id: string; name: string; urls: { url: string; thumb: string } }[];
        current_page: number;
        total: number;
      },
      Err,
    ]
  >;
  // 收藏元素
  collect: (params: { source_id: string; type: string }) => Promise<[string, Err]>;
  // 取消收藏
  cancelCollect: (sourceIds: string[], type: string) => Promise<[string, Err]>;
  // 收藏列表
  getCollects: (params: CollectParams) => Promise<[{ id: string; name: string }[], Err]>;
  // 上传base64图片
  uploadBase64: (params: UploadBase64Params) => Promise<[{ storage_path: string }, Err]>;
  // 表单上传
  formUpdate: (params: FormData) => Promise<[{ storage_path: string }, Err]>;
  // 获取用户素材
  getUserMaterial: (params: MaterialParams) => Promise<[{ data: MaterialItemRes[]; total: number }, Err]>;
  // 获取用户的素材分类
  getUserMaterialType: (
    params: UserMaterialTypeParams,
  ) => Promise<[{ data: { id: string; name: string }[]; total: number }, Err]>;
  // 删除用户素材
  deleteUserMaterial: (ids: string[]) => Promise<[string, Err]>;
  // 新增用户素材
  createUserMaterial: (params: CreateUserMaterialParams) => Promise<[MaterialItemRes, Err]>;
  //tts
  createTTS: (params: CreateTTSParams) => Promise<[{ storage_path: string }, Err]>;
  //ai字幕，传入音频的url，返回taskId，轮训taskId查询转换结果
  createCaption: (url: string) => Promise<[{ TaskId: string }, Err]>;
  // 轮训
  seekCaptionTask: (taskId: string) => Promise<[any, Err]>;
  // 修改用户素材
  updateUserMaterial: (params: UpdateUserMaterialParams) => Promise<[MaterialItemRes, Err]>;
}
