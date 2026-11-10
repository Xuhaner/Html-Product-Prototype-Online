// 本地机构与课程展示快照，沿用课程中心已有机构关联；不代表真实合作或完整线上课库。
const institutions = [
  {
    "id": "ecnu",
    "name": "华东师范大学",
    "mark": "华",
    "description": "在睿秀学城提供Python 程序设计、大学写作与表达等学习内容，支持学习者探索知识与实践。",
    "courses": [
      {
        "title": "Python 程序设计",
        "teacher": "陈珺",
        "summary": "用校园数据完成 8 个渐进式项目，配套练习、测验与在线编程。",
        "cover": "a",
        "tag": "公开课程 · 公开学习",
        "learners": "8,420 人学习",
        "route": "detail"
      },
      {
        "title": "大学写作与表达",
        "teacher": "许知",
        "summary": "练习资料检索、论证结构与公开表达，完成一篇课程论文。",
        "cover": "h",
        "tag": "专属课程 · 需审核",
        "learners": "6,621 人学习",
        "route": null
      }
    ]
  },
  {
    "id": "shou",
    "name": "上海开放大学",
    "mark": "上",
    "description": "在睿秀学城提供数据科学导论等学习内容，支持学习者探索知识与实践。",
    "courses": [
      {
        "title": "数据科学导论",
        "teacher": "李然",
        "summary": "从数据采集、清洗到可视化，建立面向真实问题的数据思维。",
        "cover": "b",
        "tag": "公开课程 · 公开学习",
        "learners": "4,106 人学习",
        "route": "data-detail"
      }
    ]
  },
  {
    "id": "joint",
    "name": "睿秀学城联合课程",
    "mark": "睿",
    "description": "在睿秀学城提供数字素养与安全等学习内容，支持学习者探索知识与实践。",
    "courses": [
      {
        "title": "数字素养与安全",
        "teacher": "周恺",
        "summary": "识别网络风险、保护个人信息，在数字社会中建立判断力。",
        "cover": "c",
        "tag": "专属课程 · 需审核",
        "learners": "1,286 人学习",
        "route": "spoc-detail"
      }
    ]
  },
  {
    "id": "tongji",
    "name": "同济大学",
    "mark": "同",
    "description": "在睿秀学城提供人工智能基础与应用等学习内容，支持学习者探索知识与实践。",
    "courses": [
      {
        "title": "人工智能基础与应用",
        "teacher": "王璐",
        "summary": "通过可交互案例理解机器学习、生成模型与负责任的 AI 应用。",
        "cover": "d",
        "tag": "AI 课程 · 新上线",
        "learners": "7,320 人学习",
        "route": null
      }
    ]
  },
  {
    "id": "sufe",
    "name": "上海财经大学",
    "mark": "上",
    "description": "在睿秀学城提供SQL 数据分析等学习内容，支持学习者探索知识与实践。",
    "courses": [
      {
        "title": "SQL 数据分析",
        "teacher": "林启",
        "summary": "在在线数据库中完成查询、聚合与多表分析，形成项目作品。",
        "cover": "e",
        "tag": "智慧课程 · 实训",
        "learners": "5,988 人学习",
        "route": null
      }
    ]
  },
  {
    "id": "fudan",
    "name": "复旦大学",
    "mark": "复",
    "description": "在睿秀学城提供大学生创新创业等学习内容，支持学习者探索知识与实践。",
    "courses": [
      {
        "title": "大学生创新创业",
        "teacher": "赵闻",
        "summary": "从用户研究到路演表达，组队完成一轮精益创业实践。",
        "cover": "f",
        "tag": "通识课程 · 热门",
        "learners": "9,634 人学习",
        "route": null
      }
    ]
  },
  {
    "id": "sjtu",
    "name": "上海交通大学",
    "mark": "上",
    "description": "在睿秀学城提供算法设计基础等学习内容，支持学习者探索知识与实践。",
    "courses": [
      {
        "title": "算法设计基础",
        "teacher": "孙跃",
        "summary": "围绕排序、搜索与动态规划，在校场中即时评测代码。",
        "cover": "g",
        "tag": "智慧课程 · 有作业",
        "learners": "3,782 人学习",
        "route": null
      }
    ]
  },
  {
    "id": "ecupl",
    "name": "华东政法大学",
    "mark": "华",
    "description": "在睿秀学城提供科技伦理与法律等学习内容，支持学习者探索知识与实践。",
    "courses": [
      {
        "title": "科技伦理与法律",
        "teacher": "刘衡",
        "summary": "通过算法偏见、隐私保护等案例理解科技治理的基本框架。",
        "cover": "i",
        "tag": "AI 通识 · 新上线",
        "learners": "2,860 人学习",
        "route": null
      }
    ]
  }
];

// 复用专区中已明确署名的高校课程；院系/教研组不推断其所属高校。
for (const [id, name] of Object.entries({zju:'浙江大学',xtu:'湘潭大学',wmu:'温州医科大学',bfu:'北京林业大学',scu:'四川文理学院',hnu:'湖南师范大学'})) {
  institutions.push({id, name, mark:name[0], description:'通过高校课程分享知识与实践经验，为学习者提供开放的学习内容。', courses:[]});
}
for (const [id, course] of Object.entries(featureContent)) {
  const [teacher, school] = course.author.split(' · ');
  const institution = institutions.find(item => item.name === school);
  if (institution) institution.courses.push({title:course.title, teacher, summary:featureZones[course.zone].description, cover:'d', tag:course.free?'公开课程 · 免费':'公开课程 · 付费', learners:course.duration, route:'paid-course', hash:id});
}
