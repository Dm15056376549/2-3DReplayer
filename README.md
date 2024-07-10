# JaSMIn

**Ja**vascript **S**occer **M**onitor **In**terface，一个基于WebGL的RoboCup Soccer Simulation回放文件和[SServer](https://github.com/rcsoccersim/rcssserver)日志播放器。

## 概述

JaSMIn是一个基于WebGL的播放器，用于在浏览器中显示RoboCup Soccer Simulation联赛（2D和3D）的足球比赛。当前版本的JaSMIn可以回放以下日志文件格式：

- __.replay__ 文件，通过[GIBBS转换器](https://github.com/OliverObst/GIBBS)转换的SServer日志文件
- __.replay__ 文件，通过我个人的、尚未发布的转换器转换的SServer或SimSpark日志文件
- __.rcg__ 文本文件（__ULGv4/5__），由SServer模拟器当前记录

由于浏览器缺乏TCP Socket支持，JaSMIn无法直接连接到模拟服务器，直到它们提供WebSocket接口。在某些时候，您可能能够使用JaSMIn观看您的模拟足球比赛直播...但不是今天。

## 构建与设置

要在您的本地机器上构建JaSMIn，只需执行以下步骤：

1. 克隆仓库
2. 通过node.js安装构建依赖项：  
   `npm install`
3. 构建JaSMIn（可能需要一些时间...）：  
   `npm run build`

构建过程成功完成后，您会在dist目录中找到两个主要的登录页面：

- _player.html_
- _embedded.html_（转发到_embedded-player.html_）

_player.html_运行JaSMIn的独立版本，而_embedded.html_运行具有缩减功能集的嵌入版本。

为了本地测试目的，您可以从仓库根目录运行一个web服务器：

```bash
npm run http
或者 - 如果您需要php支持 - 只需运行：

npm run php
然后在浏览器中导航到：localhost:8080/dist/player.html。

部署
为了在您自己的服务器上部署JaSMIn，您需要遵循以下两个步骤：

将dist目录中的所有文件和目录复制到您的目标位置。
在_player.html_、_embedded-player.html_和_archive.php_中调整脚本路径和功能。
依赖项
threejs：JaSMIn使用threejs进行WebGL渲染。
pako：JaSMIn使用pako解压gzip压缩的日志文件。
致谢
3D模型和纹理部分取自RoboViz和SimSpark。
