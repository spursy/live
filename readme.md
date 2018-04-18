送走了共享经济，迎来了直播浪潮。作为一个开发者，总想去探索自己的未知领域。在直播的浪潮下，我今天将手把手教你搭建一个SRS直播流服务，和搭建一个node.js服务向直播的流服务请求视频数据，解析后在html页面上播放。 

**本文将围绕以下几方面展开：**
- 购买云服务，以及在云主机上安装必要的开发环境
- 搭建SRS视频流服务
- 搭建node.js服务，实现解析SRS视频流数据
- 解决node.js服务中跨域请求的问题


## 购买云服务
云市场上的服务有很多选择，诸如国内某某云、国外某某云。这里为了避嫌，这里就不做推荐。**注意**本篇文章讲述的示例都是在ubuntu系统环境中，因此推荐云主机安装ubuntu系统。

 **下面是不同的终端连接云服务的工具：**

-   使用 Windows 系统的电脑
    1、下载安装 Windows SSH 和 Telnet 客户端工具 Putty。[下载Putty](http://www.putty.org/)
    2、用户名：root，Host：193.112.195.120
    3、按照 Putty 使用帮助进行登录。[Putty 密码方式使用帮助](https://www.qcloud.com/doc/product/213/2029)

-   使用 Linux/Mac OS X 系统的电脑（使用密码登录）
    1、打开 SSH 客户端（Mac可使用系统自带的终端）
    2、输入ssh -q -l root -p 22 193.112.195.120
    3、输入 CVM 实例密码进行登录。

-   使用 Linux/Mac OS X 系统的电脑（使用密钥登录）
    1、打开 SSH 客户端（Mac可使用系统自带的终端）。
    2、查找您云服务器关联的 SSH 密钥文件本地存放地址。
    3、您的密钥必须不公开可见，SSH 才能工作。请使用此命令：chmod 400 [密钥文件路径]。
    4、输入命令：ssh [-i 密钥文件路径] root@193.112.195.120。

## 配置ubuntu系统开发环境

#### 安装wget
wget命令用来从指定的URL下载文件，命令可参照[wget命令大全](http://man.linuxde.net/wget)。

安装wget工具命令：
```
sudo apt-get update  
sudo apt-get install wget  
```
![install-wget.png](https://upload-images.jianshu.io/upload_images/704770-02848047f5979533.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

检查wget是否安装成功：
![check-wget.png](https://upload-images.jianshu.io/upload_images/704770-0c2df18f79ee1333.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 安装Node.js环境
在Ubuntu系统下安装Node.js环境的方式有很多，可参照[在Ubuntu下安装Node.JS的不同方式](https://linux.cn/article-5766-1.html#3_1030)。本文将采用源码的方式：

- 升级系统，并安装一些Node.js必须包
```
sudo apt-get update
sudo apt-get install python gcc make g++
```
![install-gcc.png](https://upload-images.jianshu.io/upload_images/704770-554d6be06af2f704.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 获取Node.JS的源代码(版本是v8.11.1)
```
sudo wget http://nodejs.org/dist/v8.11.1/node-v8.11.1.tar.gz
sudo tar zxvf node-v8.11.1.tar.gz
```
![install-node.png](https://upload-images.jianshu.io/upload_images/704770-46036af3a9480811.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 开始安装
```
cd node-v8.11.1
sudo ./configure
sudo make install
```

检查Node.js的安装版本:
`
node -v
`
![check-node.png](https://upload-images.jianshu.io/upload_images/704770-5c19c135f3d41452.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

*安装nginx前需要安装[pcre](https://blog.csdn.net/u011304970/article/details/60960406)*
#### 安装pcre
- 下载pcre源码

```
sudo wget https://ftp.pcre.org/pub/pcre/pcre2-10.31.tar.gz
sudo tar zxvf pcre2-10.31.tar.gz
```
![download-pcre.png](https://upload-images.jianshu.io/upload_images/704770-601ba08eba666956.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 安装pcre

**配置**
```
cd pcre2-10.31
sudo ./configure
```

![configure-pcre.png](https://upload-images.jianshu.io/upload_images/704770-01acb18297831e40.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**编译**
```
sudo make
```
![make-pcre.png](https://upload-images.jianshu.io/upload_images/704770-e3e93dbd556c2a89.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**安装**
```
sudo make install
```
![install-pcre.png](https://upload-images.jianshu.io/upload_images/704770-0afc8b6f475596ac.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

*安装nginx前需要安装zlib*
#### 安装zlib
```
sudo apt-get install zlib1g-dev
```
![install-zlib.png](https://upload-images.jianshu.io/upload_images/704770-cab39b666809fec6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


## 安装nginx
安装nginx的方法有很多，可以参照[Ubuntu中Nginx的安装与配置](http://www.cnblogs.com/languoliang/archive/2013/04/01/nginx.html)。

*这里我将采用源码安装方式，安装nginx。*

**下载nginx源码并解压**
`
sudo wget http://nginx.org/download/nginx-1.12.2.tar.gz
sudo tar zxvf nginx-1.12.2.tar.gz
`
![download-nginx.png](https://upload-images.jianshu.io/upload_images/704770-39deb8ffe7c90e6b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**配置**
```
sudo ./comfigure
```
![configure-nginx.png](https://upload-images.jianshu.io/upload_images/704770-0178aac8ac028575.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**编译**
`
sudo make
`
![make-nginx.png](https://upload-images.jianshu.io/upload_images/704770-503f792a8018a7ca.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**安装**

`
sudo make install
`
![install-nginx.png](https://upload-images.jianshu.io/upload_images/704770-d31be26874fa8205.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**注意：**有时还需要安装一些nginx包
![nginx-package.png](https://upload-images.jianshu.io/upload_images/704770-dbb994c15a158957.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


执行如下命令安装nginx包
```
sudo apt-get install nginx-core
sudo apt-get install nginx-extras
sudo apt-get install nginx-full
sudo apt-get install nginx-light
```

**配置nginx**
nginx.conf文件通常在文件夹/etc/nginx/nginx.conf中,通过vi命令编辑。[vi常见命令](http://www.cnblogs.com/sunormoon/archive/2012/02/10/2345326.html)

这里介绍下几个最常见的vi命令：
- *打开文件*
`
sudo vi xxxx
`
- *键入文件编辑模式*
打开文件后，按i键（文件底部出现insert）

- *切换文件模式*
在上一步的基础上按esc键（文件底部的insert消失）

- *退出文件*
在上一步的基础上按“：”＋“ q ” ＋“！”组合键后不保存并退出
在上一步的基础上按“：”＋“ w ” ＋“q”组合键后保存并退出

**启动nginx服务**
nginx启动端口默认是80

启动前可以先确定下端口的占用情况：
`
sudo lsof -i:80
`
如果端口被占用，可以使用kill命令杀死进程。


nginx的启动文件一般在/usr/local/nginx/sbin文件夹中，常见nginx服务命令有：
```
sudo nginx  //启动服务
sudo nginx -s stop //关闭服务
sudo nginx -s reload  //重启服务
sudo nginx -t -c /usr/local/nginx/conf/nginx.conf //检查nginx配置是否正确
```

## 在ubuntu中启动SRS的flv服务
[SRS](https://github.com/ossrs/srs)定位是运营级的互联网直播服务器集群，追求更好的概念完整性和最简单实现的代码。SRS提供很多种视频流服务，详细可见[SRS的github文档](https://github.com/ossrs/srs)。

**常见直播协议：**
- RTMP: 底层基于TCP，在浏览器端依赖Flash。
- HTTP-FLV: 基于HTTP流式IO传输FLV，依赖浏览器支持播放FLV。
- WebSocket-FLV: 基于WebSocket传输FLV，依赖浏览器支持播放FLV。WebSocket建立在HTTP之上，建立WebSocket连接前还要先建立HTTP连接。
- HLS: Http Live Streaming，苹果提出基于HTTP的流媒体传输协议。HTML5可以直接打开播放。
- RTP: 基于UDP，延迟1秒，浏览器不支持。

我这里选择的是http-flv协议，因为我解析SRS视频流的框架选择的是[Bibili的flv框架](https://github.com/Bilibili/flv.js)，详见下一节。http-flv流服务部署流程参见[SRS-HTTP-FLV部署实例](https://github.com/ossrs/srs/wiki/v2_CN_SampleHttpFlv)：
- 获取srs
`
git clone https://github.com/ossrs/srs &&
cd srs/trunk
`
- 配置srs
`
sudo ./configure && make
`
- 编译srs
`
sudo make
`
- 启动服务
`
sudo ./objs/srs -c conf/http.flv.live.conf
`

![install-srs-flv.png](https://upload-images.jianshu.io/upload_images/704770-cbefcfb6ea338abf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## OBS直播软件

[OBS软件](http://www.obsapp.net/)免费，开源软件，用于实时流媒体直播和录制。
至于OBS的使用详细参见[斗鱼OBS使用教程](http://v.youku.com/v_show/id_XMTU0MzY2MTYxMg==.html)。

**需要在OBS配置流的路径：rtmp://你的ip地址/live，以及流的名称。**
![configure-obs.png](https://upload-images.jianshu.io/upload_images/704770-765dcd820b40d786.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**验证flv流是否推送成功**
在浏览器中输入：*http://118.89.247.129:8080/live/live.flv*，如果出现下载的视频，则说明OBS成功的向SRS服务推送流服务。
![verification-flv.png](https://upload-images.jianshu.io/upload_images/704770-5e9b1a45aa4658af.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


## 解析直播流的框架－flv.js

flv.js是来自Bilibli的开源项目。它解析FLV文件喂给原生HTML5 Video标签播放音视频数据，使浏览器在不借助Flash的情况下播放FLV成为可能。详细参见[使用flv.js做直播](https://github.com/gwuhaolin/blog/issues/3)。

我在github上开源了自己使用flv.js库实现直播的代码。代码是使用node.js的express框架搭建的服务，如果想要将代码在ubuntu服务器上运行，需要开发者具备一点node.js的知识。

```
git clone https://github.com/spursy/live.git   // 克隆node.js代码

cd live   // 进入项目

npm install   //  安装项目必须的包

npm run dev // 启动项目
```

**注意在启动项目前需要修改live/view/index.html中的视频源路径**

```
if (flvjs.isSupported()) {
            var flvPlayer = flvjs.createPlayer({
                type: 'flv',
                "isLive": true,//<====加个这个 
                url: "http://bianchenggou.wang:8080/live/live.flv',//<==自行修改
                //url:"demo.flv"
            });
            flvPlayer.attachMediaElement(videoElement);
            flvPlayer.load(); //加载
            flv_start();
        }
```

## 实现flv视频流直播

#### 修改异常

当程序启动node.js服务后访问http://193.112.195.120:9000/，并不能接收到视屏流，通过chrome浏览器的F12快捷键查看异常：

![exception.png](https://upload-images.jianshu.io/upload_images/704770-f94d21773229256b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


控制台的异常显示是不能允许跨域请求，解决不允许跨域请求的方式有很多，参见[一篇文章可以解决跨域](https://www.imooc.com/article/19869?block_id=tuijian_wz)。

我这里使用的是在服务器的nginx配置里设置允许跨域访问，详见[nginx跨域配置](http://www.cnblogs.com/boystar/p/5832192.html)。

在安装nginx时，nginx.conf文件放在文件夹**/usr/local/nginx/conf**中。nginx的配置文件的使用可以参见[Nginx教程](http://www.cnblogs.com/crazylqy/p/6891929.html)。

修改如下：
```
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
        worker_connections 768;
        # multi_accept on;
}

http {

        ##
        # Basic Settings
        ##

        sendfile on;
        tcp_nopush on;
        tcp_nodelay on;
        keepalive_timeout 65;
        types_hash_max_size 2048;
        # server_tokens off;

        # server_names_hash_bucket_size 64;
        # server_name_in_redirect off;

        include /etc/nginx/mime.types;
        default_type application/octet-stream;

        ##
        # Logging Settings
        ##
        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;

        ##
        # Gzip Settings
        ##
        gzip on;
        gzip_disable "msie6";

        ##
        # Access-Control
        ##
       add_header Access-Control-Allow-Origin *;
       add_header Access-Control-Allow-Headers X-Requested-With;
       add_header Access-Control-Allow-Methods GET,POST,OPTIONS;

        include /etc/nginx/conf.d/*.conf;
        include /etc/nginx/sites-enabled/*;

        server {
                listen      80;
                server_name  bianchenggou.wang;

                location  /srs/ {
                        proxy_pass   http://127.0.0.1:8080/;
                }
                location / {
                        proxy_pass  http://127.0.0.1:9000/;
                }
        }
}
```

由于nginx对所有的请求都做了代理服务，因此**live/view/index.html中的视频源路径**应修改为：

```
if (flvjs.isSupported()) {
            var flvPlayer = flvjs.createPlayer({
                type: 'flv',
                "isLive": true,//<====加个这个 
                url: "http://bianchenggou.wang/srs/live/live.flv',//<==自行修改
                //url:"demo.flv"
            });
            flvPlayer.attachMediaElement(videoElement);
            flvPlayer.load(); //加载
            flv_start();
        }
```

当再次访问node服务时，就不会再出现异常。

![node-server.png](https://upload-images.jianshu.io/upload_images/704770-3cf2809ff03aa917.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 真正实现视频直播

OBS直播软件的配置不变，按照教程推送直播流后，启动node.js服务，进去直播页面：

![living.png](https://upload-images.jianshu.io/upload_images/704770-64566e28a99d5e50.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
