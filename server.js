// server-koa-native-v1.js
const Koa = require('koa');
const https = require('https');
const fs = require('fs');
const path = require('path');
const serve = require('koa-static');
const { URL } = require('url');

const app = new Koa();

// 自定义代理中间件 - 精确匹配 /api/v1/*
const createProxy = (pathPrefix, targetUrl) => {
  return async (ctx, next) => {
    // 精确匹配路径前缀
    if (!ctx.path.startsWith(pathPrefix)) {
      return next();
    }
    
    console.log(`[代理] ${ctx.method} ${ctx.url} -> ${targetUrl}`);
    
    return new Promise((resolve, reject) => {
      const target = new URL(targetUrl);
      
      // 构建目标路径
      // 保持原始路径不变，因为目标服务器也使用相同的路径结构
      const targetPath = ctx.path;
      
      const options = {
        hostname: target.hostname,
        port: target.port || 443,
        path: targetPath,
        method: ctx.method,
        headers: {
          ...ctx.headers,
          host: target.host,  // 修改Host头
          'x-forwarded-for': ctx.ip || ctx.request.ip,
          'x-forwarded-host': ctx.host,
          'x-forwarded-proto': 'https'
        },
        rejectUnauthorized: false
      };
      
      // 删除可能引起问题的头
      delete options.headers['content-length'];
      
      const proxyReq = https.request(options, (proxyRes) => {
        console.log(`[代理响应] ${ctx.url} -> ${proxyRes.statusCode}`);
        
        ctx.status = proxyRes.statusCode;
        
        // 复制响应头，但过滤掉一些
        const headers = { ...proxyRes.headers };
        delete headers['content-length']; // 让Koa自动计算
        ctx.set(headers);
        
        proxyRes.pipe(ctx.res);
        proxyRes.on('end', resolve);
      });
      
      proxyReq.on('error', (err) => {
        console.error('代理错误:', err);
        ctx.status = 502;
        ctx.body = JSON.stringify({ 
          error: 'Proxy Error', 
          message: err.message,
          path: ctx.path
        });
        resolve();
      });
      
      // 如果有请求体，转发
      if (ctx.request.rawBody) {
        proxyReq.write(ctx.request.rawBody);
        proxyReq.end();
      } else if (ctx.req.readable) {
        ctx.req.pipe(proxyReq);
      } else {
        proxyReq.end();
      }
    });
  };
};

// 请求体解析中间件
app.use(async (ctx, next) => {
  if (ctx.is('application/json') || ctx.is('application/x-www-form-urlencoded')) {
    try {
      ctx.request.rawBody = await new Promise((resolve, reject) => {
        let data = '';
        ctx.req.on('data', chunk => data += chunk);
        ctx.req.on('end', () => resolve(data));
        ctx.req.on('error', reject);
      });
    } catch (err) {
      console.error('解析请求体错误:', err);
    }
  }
  await next();
});

// 1. 日志中间件
app.use(async (ctx, next) => {
  const start = Date.now();
  console.log(`[${new Date().toLocaleTimeString()}] ${ctx.method} ${ctx.url}`);
  await next();
  const ms = Date.now() - start;
  console.log(`[完成] ${ctx.method} ${ctx.url} ${ctx.status} (${ms}ms)`);
});

// 2. 代理中间件 - 精确配置
// /api/v1/* 代理到 https://video.h5ds.com/api/v1/*
app.use(createProxy('/api/v1/', 'https://video.h5ds.com'));

// /api/* 代理到 https://video.h5ds.com/api/*
app.use(createProxy('/api/', 'https://video.h5ds.com'));

// /cgi-bin/* 代理到 https://video.h5ds.com/cgi-bin/*
app.use(createProxy('/cgi-bin/', 'https://video.h5ds.com'));

// 3. 静态文件服务
app.use(serve('dist', {
  maxage: 86400000, // 缓存1天
  gzip: true,
  setHeaders: (res, filePath) => {
    console.log(`[静态文件] ${path.relative(__dirname, filePath)}`);
  }
}));

// 4. SPA路由中间件
app.use(async (ctx) => {
  // 排除代理路径和静态文件
  if (ctx.path.startsWith('/api') || 
      ctx.path.startsWith('/cgi-bin') || 
      /\.\w+$/.test(ctx.path)) {
    ctx.status = 404;
    ctx.body = JSON.stringify({ 
      error: 'Not Found', 
      message: '请求的路径不存在',
      path: ctx.path
    });
    return;
  }
  
  console.log(`[SPA] 返回HTML: ${ctx.path}`);
  ctx.type = 'html';
  try {
    ctx.body = fs.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'utf8');
  } catch (err) {
    console.error('读取HTML文件错误:', err);
    ctx.status = 500;
    ctx.body = 'Internal Server Error';
  }
});

// 5. 错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('服务器错误:', err);
    ctx.status = err.status || 500;
    ctx.type = 'json';
    ctx.body = JSON.stringify({
      error: 'Internal Server Error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// 启动HTTPS服务器
try {
  const httpsOptions = {
    key: fs.readFileSync('ssh/dev.pem'),
    cert: fs.readFileSync('ssh/cert.pem'),
    secureProtocol: 'TLSv1_2_method'
  };

  const server = https.createServer(httpsOptions, app.callback());

  server.listen(5001, '127.0.0.1', () => {
    console.log(`
    ========================================
    🎯 Koa2代理服务器启动成功！
    ========================================
    服务器地址: https://127.0.0.1:5001
    
    代理配置:
    1. /api/v1/*    -> https://video.h5ds.com/api/v1/*
    2. /api/*       -> https://video.h5ds.com/api/*
    3. /cgi-bin/*   -> https://video.h5ds.com/cgi-bin/*
    
    测试URL:
    - API测试: https://127.0.0.1:5001/api/v1/account/info
    - 前端页面: https://127.0.0.1:5001/
    ========================================
    `);
  });

  // 服务器错误处理
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ 端口 5001 已被占用，请检查是否有其他程序在使用该端口`);
    } else {
      console.error('服务器错误:', err);
    }
    process.exit(1);
  });

} catch (err) {
  console.error('❌ 启动失败:', err.message);
  if (err.code === 'ENOENT') {
    console.log('请确保证书文件存在:');
    console.log('  ssh/dev.pem');
    console.log('  ssh/cert.pem');
  }
  process.exit(1);
}