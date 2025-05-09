## 简介

基于朋友和我的健身计划需求，开发了一个碳循环计划生成小程序，主要根据碳循环饮食减肥法，输入身体数据（身高、体重、年龄等）和健身需求（热量缺口、营养素分配、低碳高碳日模式、开始日期），输出饮食计划。

小程序全称：胖胖碳循环计划生成器

## 界面和功能

#### 首页
<img src="https://github.com/user-attachments/assets/1b605f75-49dd-4e47-8e67-ed0f5adfef24" alt="首页" width="300" />

#### 输入数据和需求
<img src="https://github.com/user-attachments/assets/8e3a4870-f632-425b-b088-31b979bade1f" alt="输入数据和需求1" width="300" />
<img src="https://github.com/user-attachments/assets/a1bbe8c0-9c49-4530-9e45-b3f80a1502c7" alt="输入数据和需求2" width="300" />
<img src="https://github.com/user-attachments/assets/742a5615-2325-4971-8e23-86f639ac76eb" alt="输入数据和需求3" width="300" />

<img src="https://github.com/user-attachments/assets/c4fc05d4-99de-4854-afc5-f1d4ef567fc5" alt="输入数据和需求4" width="300" />


#### 生成计划
<img src="https://github.com/user-attachments/assets/6413b077-0192-4b57-b6cb-fa5841144b3b" alt="结果1" width="300" />

<img src="https://github.com/user-attachments/assets/17a51f71-d5f1-4719-a775-bb88043015f9" alt="结果2" width="300" />

<img src="https://github.com/user-attachments/assets/e10cfe01-de42-4ee3-b3d4-6dd040d86681" alt="结果3" width="300" />

## 怎么启动

把项目克隆到本地，使用微信开发者工具打开项目，创建`project.config.json`，内容如下：

```json
{
  "miniprogramRoot": "app/",
  "cloudfunctionRoot": "cloudfunctions/",
  "setting": {
    "urlCheck": true,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": true,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "enableEngineNative": false,
    "useIsolateContext": true,
    "useCompilerModule": true,
    "userConfirmedUseCompilerModuleSwitch": false,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true
  },
  "projectname": "quickstart-wx-cloud",
  "libVersion": "3.7.10",
  "cloudfunctionTemplateRoot": "cloudfunctionTemplate/",
  "condition": {
    "search": {
      "list": []
    },
    "conversation": {
      "list": []
    },
    "plugin": {
      "list": []
    },
    "game": {
      "list": []
    },
    "miniprogram": {
      "list": [
        {
          "id": -1,
          "name": "db guide",
          "pathName": "pages/databaseGuide/databaseGuide"
        }
      ]
    }
  },
  "compileType": "miniprogram",
  "srcMiniprogramRoot": "miniprogram/",
  "packOptions": {
    "ignore": [],
    "include": []
  },
  "editorSetting": {
    "tabIndent": "insertSpaces",
    "tabSize": 2
  },
  "appid": "wxfafeeddasd75653dcc" // 使用你自己的appId
}
```

点击上方“编译”按钮。