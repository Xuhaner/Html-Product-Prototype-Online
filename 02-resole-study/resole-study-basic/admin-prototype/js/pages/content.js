const managementConfig={
  "title": "内容与课程",
  "description": "统一维护课程内容。课程中心、编程课程与专区课程共用课程库；题单和专区只引用课程或题目编号。",
  "sections": [
    {
      "id": "courses",
      "title": "课程库",
      "description": "45 门示例：课程中心 16 门（含 3 门编程课程），专区 29 门。统一配置课程资料、付费设置和展示入口。六门前台仅预览的课程保留草稿工作区。",
      "fields": [
        {
          "key": "name",
          "label": "课程名称",
          "default": "新课程",
          "required": true,
          "type": "text"
        },
        {
          "key": "id",
          "label": "课程编号",
          "default": "new-course",
          "required": true,
          "type": "text",
          "hint": "同一门课共用一个编号；编程入口、专区引用该编号。"
        },
        {
          "key": "type",
          "label": "课程类型",
          "default": "公开课程",
          "required": false,
          "options": [
            "公开课程",
            "专属课程"
          ]
        },
        {
          "key": "paidMode",
          "label": "付费模式",
          "default": "免费",
          "required": true,
          "options": ["免费", "付费"]
        },
        {
          "key": "platformCourse",
          "label": "是否为平台课程",
          "default": "否",
          "required": false,
          "options": ["否", "是"],
          "hint": "仅超级管理员可设置。"
        },
        {
          "key": "entry",
          "label": "展示来源",
          "default": "课程中心",
          "required": false,
          "options": [
            "课程中心",
            "课程中心 / 编程课程",
            "特色专区"
          ]
        },
        {
          "key": "tags",
          "label": "课程标签",
          "default": "智慧课程",
          "required": false,
          "type": "text",
          "hint": "如热门课程 / 智慧课程 / AI 课程 / 通识课程；付费情况由付费模式独立设置。"
        },
        {
          "key": "level",
          "label": "编程阶段",
          "default": "不适用",
          "required": false,
          "options": [
            "不适用",
            "入门",
            "基础",
            "进阶"
          ]
        },
        {
          "key": "teacher",
          "label": "负责教师",
          "default": "陈珺",
          "required": true,
          "type": "text"
        },
        {
          "key": "school",
          "label": "所属机构",
          "default": "华东师范大学",
          "required": false,
          "type": "text"
        },
        {
          "key": "subject",
          "label": "学科标签",
          "default": "计算机 / 工程",
          "required": false,
          "type": "text"
        },
        {
          "key": "order",
          "label": "列表顺序",
          "default": 1,
          "required": false,
          "type": "number"
        },
        {
          "key": "status",
          "label": "状态",
          "default": "已上架",
          "required": false,
          "options": [
            "草稿",
            "已上架",
            "已下架"
          ]
        },
        {
          "key": "summary",
          "label": "课程简介",
          "default": "从基础知识到真实项目",
          "required": false,
          "type": "textarea"
        },
        {
          "key": "access",
          "label": "加入方式",
          "default": "公开学习",
          "required": false,
          "options": [
            "公开学习",
            "申请审核",
            "购买解锁"
          ]
        },
        {
          "key": "cover",
          "label": "封面资源",
          "default": "course-cover.svg",
          "required": false,
          "type": "text"
        }
      ],
      "rows": window.AdminCourseCatalog.map(row=>({...row})),
      "columns": [
        "name",
        "id",
        "entry",
        "access",
        "status"
      ],
      "link": "course-editor.html",
      "related": [
        {
          "label": "配置课程目录与功能",
          "href": "course-editor.html"
        },
        {
          "label": "配置课程付费设置",
          "href": "content.html#courses"
        },
        {
          "label": "配置编程课程入口",
          "href": "practice.html#courses"
        },
        {
          "label": "编排专区入口",
          "href": "features.html#content"
        }
      ]
    },
    {
      "id": "resources",
      "title": "资源库",
      "description": "教学视频库提供本页管理与上传/生成演示，课程内编排在备课中配置。"
    }
  ]
};
managementConfig.validate=(record,section,editing)=>{
 if(section.id==='courses'&&section.rows.some((r,i)=>i!==editing&&r.id===record.id.trim()))return {key:'id',message:'课程编号已存在，请使用唯一编号。'};
};
if(!AdminUI.isSuper){
 managementConfig.description='管理教学团队分配给本人的三门课程与课件资源。';
 const courses=managementConfig.sections.find(s=>s.id==='courses');
 courses.title='我的课程';courses.rows=courses.rows.filter(r=>AdminTeaching.courses.includes(r.name));courses.columns=['name','id','teacher','status'];
 courses.fields=courses.fields.filter(f=>!['entry','tags','level','order','access'].includes(f.key));
 courses.fields.find(f=>f.key==='name').options=AdminTeaching.courses;
 courses.fields.find(f=>f.key==='teacher').label='主讲教师';
 courses.description='管理本人负责的课程，并可在本页新增课程资料草稿。';
 document.querySelector('h1').textContent='我的课程与资源';
}

const section=managementConfig.sections.find(s=>s.id==='courses');section.rows=section.rows.filter(r=>['Python 程序设计','数字素养与安全'].includes(r.name));section.rows.forEach(r=>{r.paidMode='免费';r.price=0;r.trialLessons=[];});section.related=[];
AdminCourses.mount(section,managementConfig.validate);
