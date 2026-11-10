const managementConfig={
  "title": "课程工作区",
  "description": "在同一个课程工作区维护课程内容。免费课程对应八项前台标签；付费课增加亮点内容与付费须知；编程课增加按课时关联的配套题配置。",
  "sections": [
    {
      "id": "overview",
      "title": "总览与大纲",
      "description": "每门课程维护一份富文本大纲，直接编辑课程目标、教学内容与学习安排。",
      "fields": [
        {
          "key": "name",
          "label": "名称",
          "default": "Python 程序设计",
          "required": true,
          "type": "text"
        },
        {
          "key": "owner",
          "label": "课程负责人",
          "default": "陈珺",
          "required": false,
          "type": "text"
        },
        {
          "key": "goals",
          "label": "学习目标",
          "default": "掌握 Python 基础语法\n运用数据结构解决真实问题",
          "required": false,
          "type": "textarea"
        },
        {
          "key": "outline",
          "label": "课程大纲",
          "default": "六章：入门、变量与表达式、列表与字典、函数、文件、项目",
          "required": false,
          "type": "textarea"
        },
        {
          "key": "prerequisite",
          "label": "先修要求",
          "default": "无需编程基础",
          "required": false,
          "type": "textarea"
        },
        {
          "key": "schedule",
          "label": "教学安排",
          "default": "自主视频学习 + 课内实践",
          "required": false,
          "type": "textarea"
        },
        {
          "key": "status",
          "label": "状态",
          "default": "已发布",
          "required": false,
          "options": [
            "草稿",
            "已发布",
            "已下架"
          ]
        }
      ],
      "rows": [
        {
          "name": "Python 程序设计",
          "owner": "陈珺",
          "goals": "掌握 Python 基础语法\n运用数据结构解决真实问题",
          "outline": "六章：入门、变量与表达式、列表与字典、函数、文件、项目",
          "prerequisite": "无需编程基础",
          "schedule": "自主视频学习 + 课内实践",
          "status": "已发布"
        }
      ]
    },
    {
      "id": "catalog",
      "title": "章节与课时",
      "description": "维护章节课时、资源、完成条件、打卡和课内竞技。购买设置与试看内容统一在课程列表的编辑弹窗维护。",
      "fields": [
        {
          "key": "name",
          "label": "课时名称",
          "default": "变量与类型实战",
          "required": true,
          "type": "text"
        },
        {
          "key": "chapter",
          "label": "所属章节",
          "default": "第二章",
          "required": false,
          "type": "text"
        },
        {
          "key": "order",
          "label": "课时顺序",
          "default": 4,
          "required": false,
          "type": "number"
        },
        {
          "key": "type",
          "label": "内容形式",
          "default": "视频",
          "required": false,
          "options": [
            "视频",
            "PPT",
            "PDF",
            "文件作业"
          ]
        },
        {
          "key": "resource",
          "label": "资源关联",
          "default": "variables-demo.mp4",
          "required": false,
          "type": "text"
        },
        {
          "key": "completion",
          "label": "完成条件",
          "default": "手动标记",
          "required": false,
          "options": [
            "手动标记",
            "播放完成",
            "提交作业"
          ]
        },
        {
          "key": "checkin",
          "label": "学习打卡",
          "default": "开启",
          "required": false,
          "options": [
            "开启",
            "关闭"
          ]
        },
        {
          "key": "arena",
          "label": "课内数字竞技",
          "default": "变量与类型题库",
          "required": false,
          "options": [
            "不启用",
            "变量与类型题库",
            "表达式与输入输出题库"
          ]
        },
        {
          "key": "minutes",
          "label": "课时分钟数",
          "default": 10,
          "required": true,
          "type": "number"
        },
        {
          "key": "body",
          "label": "学习要点",
          "default": "",
          "required": false,
          "type": "textarea"
        },
        {
          "key": "example",
          "label": "课时代码示例",
          "default": "",
          "required": false,
          "type": "textarea"
        }
      ],
      "rows": [
        {
          "name": "变量与类型实战",
          "chapter": "第二章",
          "order": 4,
          "type": "视频",
          "resource": "variables-demo.mp4",
          "completion": "手动标记",
          "checkin": "开启",
          "arena": "变量与类型题库",
          "minutes": 10,
          "body": "",
          "example": ""
        },
        {
          "name": "表达式与输入输出挑战",
          "chapter": "第二章",
          "order": 5,
          "type": "视频",
          "resource": "variables-demo.mp4",
          "completion": "手动标记",
          "checkin": "开启",
          "arena": "表达式与输入输出题库",
          "minutes": 10,
          "body": "",
          "example": ""
        },
        {
          "name": "第三章课件",
          "chapter": "第三章",
          "order": 1,
          "type": "PPT",
          "resource": "variables-demo.mp4",
          "completion": "手动标记",
          "checkin": "开启",
          "arena": "不启用",
          "minutes": 10,
          "body": "",
          "example": ""
        }
      ],
      "columns": [
        "name",
        "chapter",
        "type",
        "arena"
      ],
      "related": [
        {
          "label": "配置价格与试看",
          "href": "content.html#courses"
        },
        {
          "label": "配置课内竞技",
          "href": "course-editor.html#arena"
        }
      ]
    },
    {
      "id": "tasks",
      "title": "作业与考核关联",
      "description": "选择本课程可见的作业、练习、小测与考试，题卷规则在测评中心管理。",
      "fields": [
        {
          "key": "name",
          "label": "名称",
          "default": "Python 章节练习",
          "required": true,
          "type": "text"
        },
        {
          "key": "type",
          "label": "任务类型",
          "default": "练习",
          "required": false,
          "options": [
            "文件作业",
            "练习",
            "小测",
            "期中考试",
            "期末考试"
          ]
        },
        {
          "key": "reference",
          "label": "题卷编号",
          "default": "PY-PRACTICE-01",
          "required": false,
          "type": "text"
        },
        {
          "key": "chapter",
          "label": "所在章节",
          "default": "第二章",
          "required": false,
          "type": "text"
        },
        {
          "key": "deadlineMode",
          "label": "截止规则",
          "default": "长期开放",
          "required": false,
          "options": [
            "长期开放",
            "指定截止时间"
          ]
        },
        {
          "key": "end",
          "label": "截止时间",
          "default": "",
          "required": false,
          "type": "datetime-local"
        },
        {
          "key": "visibility",
          "label": "开放条件",
          "default": "课程可学",
          "required": false,
          "options": [
            "课程可学",
            "专属课程审核通过",
            "已购买"
          ]
        },
        {
          "key": "status",
          "label": "状态",
          "default": "已发布",
          "required": false,
          "options": [
            "草稿",
            "已发布",
            "已下架"
          ]
        }
      ],
      "rows": [
        {
          "name": "Python 章节练习",
          "type": "练习",
          "reference": "PY-PRACTICE-01",
          "chapter": "第二章",
          "deadlineMode": "长期开放",
          "end": "",
          "visibility": "课程可学",
          "status": "已发布"
        },
        {
          "name": "第三章线下文件作业",
          "type": "文件作业",
          "reference": "PY-FILE-03",
          "chapter": "第三章",
          "deadlineMode": "长期开放",
          "end": "",
          "visibility": "课程可学",
          "status": "已发布"
        },
        {
          "name": "Python 期中考试",
          "type": "期中考试",
          "reference": "PY-MIDTERM",
          "chapter": "第二章",
          "deadlineMode": "长期开放",
          "end": "",
          "visibility": "课程可学",
          "status": "已发布"
        }
      ],
      "related": [
        {
          "label": "管理题卷与评分规则",
          "href": "assessments.html#exams"
        },
        {
          "label": "安排考试与批阅",
          "href": "assessments.html#exams"
        }
      ]
    },
    {
      "id": "coding-tasks",
      "title": "课时配套编程题",
      "description": "只关联题目编号与所属课时，顺序即展示顺序。任务页和课时页使用同一份关联；配套题访问权限随课时继承，锁定课时的题目也锁定。",
      "fields": [
        {
          "key": "name",
          "label": "关联名称",
          "default": "配套练习",
          "required": true,
          "type": "text"
        },
        {
          "key": "lesson",
          "label": "所属课时",
          "default": "",
          "required": true,
          "options": []
        },
        {
          "key": "problems",
          "label": "编程题编号（按顺序）",
          "default": "P001",
          "required": true,
          "type": "textarea",
          "hint": "每行一个 P001—P010；仅 P001 可模拟评测，其他题目预览。"
        },
        {
          "key": "order",
          "label": "展示顺序",
          "default": 1,
          "required": true,
          "type": "number"
        },
        {
          "key": "access",
          "label": "访问规则",
          "default": "继承所属课时权限",
          "required": false,
          "options": [
            "继承所属课时权限"
          ]
        },
        {
          "key": "status",
          "label": "状态",
          "default": "已发布",
          "required": false,
          "options": [
            "草稿",
            "已发布",
            "已下架"
          ]
        }
      ],
      "rows": [],
      "columns": [
        "name",
        "lesson",
        "problems",
        "access",
        "status"
      ],
      "related": [
        {
          "label": "维护编程题库",
          "href": "practice.html#coding"
        },
        {
          "label": "配置课程试看",
          "href": "content.html#courses"
        }
      ]
    },
    {
      "id": "knowledge",
      "title": "知识点与图谱",
      "description": "在可视化图谱中组织知识层级，选择节点配置前置、后置与关联知识。",
      "fields": [
        {
          "key": "name",
          "label": "知识点",
          "default": "变量与类型",
          "required": true,
          "type": "text"
        },
        {
          "key": "parent",
          "label": "父节点",
          "default": "Python 程序设计",
          "required": false,
          "type": "text"
        },
        {
          "key": "relation",
          "label": "连线类型",
          "default": "包含",
          "required": false,
          "options": [
            "包含",
            "关联"
          ]
        },
        {
          "key": "target",
          "label": "关联节点",
          "default": "表达式",
          "required": false,
          "type": "text"
        },
        {
          "key": "lessons",
          "label": "关联课时",
          "default": "2.4 变量与类型实战",
          "required": false,
          "type": "textarea"
        },
        {
          "key": "description",
          "label": "知识点说明",
          "default": "变量保存值，类型决定可用操作。",
          "required": false,
          "type": "textarea"
        }
      ],
      "rows": [
        {
          "name": "变量与类型",
          "parent": "Python 程序设计",
          "relation": "包含",
          "target": "表达式",
          "lessons": "2.4 变量与类型实战",
          "description": "变量保存值，类型决定可用操作。"
        },
        {
          "name": "循环",
          "parent": "流程控制",
          "relation": "包含",
          "target": "条件判断",
          "lessons": "2.4 变量与类型实战",
          "description": "变量保存值，类型决定可用操作。"
        }
      ]
    },
    {
      "id": "notices",
      "title": "课程公告",
      "description": "维护课程公告正文与顺序；发布后立即展示，可下架或删除。",
      "fields": [
        {
          "key": "name",
          "label": "公告标题",
          "default": "Python 考试安排",
          "required": true,
          "type": "text"
        },
        {
          "key": "body",
          "label": "公告正文",
          "default": "期中考试已开放，请阅读考前规则。",
          "required": false,
          "type": "textarea"
        },
        {
          "key": "order",
          "label": "排序",
          "default": 1,
          "required": false,
          "type": "number"
        },
        {
          "key": "status",
          "label": "状态",
          "default": "已发布",
          "required": false,
          "options": [
            "草稿",
            "已发布",
            "已下架"
          ]
        }
      ],
      "rows": [
        {
          "name": "Python 考试安排",
          "body": "期中考试已开放，请阅读考前规则。",
          "order": 1,
          "status": "已发布"
        }
      ]
    },
    {
      "id": "discussion",
      "title": "讨论互动",
      "description": "管理课程与课时讨论，支持教师回复、隐藏或恢复显示，以及删除讨论。",
      "fields": [
        {
          "key": "name",
          "label": "讨论主题",
          "default": "range 的结束值为什么不包含？",
          "required": true,
          "type": "text"
        },
        {
          "key": "author",
          "label": "发布学员",
          "default": "周同学",
          "required": false,
          "type": "text"
        },
        {
          "key": "scope",
          "label": "关联课时",
          "default": "课程讨论 / 2.4",
          "required": false,
          "type": "text"
        },
        {
          "key": "body",
          "label": "评论正文",
          "default": "这与切片规则有什么关系？",
          "required": false,
          "type": "textarea"
        },
        {
          "key": "reply",
          "label": "教师回复",
          "default": "左闭右开有助于统一长度计算。",
          "required": false,
          "type": "textarea"
        },
        {
          "key": "likes",
          "label": "点赞数（演示）",
          "default": 8,
          "required": false,
          "type": "number"
        },
        {
          "key": "status",
          "label": "状态",
          "default": "正常",
          "required": false,
          "options": [
            "正常",
            "已隐藏",
            "已恢复"
          ]
        },
        {
          "key": "reason",
          "label": "处理原因",
          "default": "",
          "required": false,
          "type": "textarea"
        }
      ],
      "rows": [
        {
          "name": "range 的结束值为什么不包含？",
          "author": "周同学",
          "scope": "课程讨论 / 2.4",
          "body": "这与切片规则有什么关系？",
          "reply": "左闭右开有助于统一长度计算。",
          "likes": 8,
          "status": "正常",
          "reason": ""
        }
      ]
    },
    {
      "id": "team",
      "title": "教研团队",
      "description": "配置姓名、角色与展示顺序，头像使用姓名首字。",
      "fields": [
        {
          "key": "name",
          "label": "姓名",
          "default": "陈珺",
          "required": true,
          "type": "text"
        },
        {
          "key": "role",
          "label": "教研角色",
          "default": "课程负责人",
          "required": false,
          "type": "text"
        },
        {
          "key": "school",
          "label": "机构",
          "default": "华东师范大学",
          "required": false,
          "type": "text"
        },
        {
          "key": "bio",
          "label": "简介",
          "default": "负责课程设计与基础教学",
          "required": false,
          "type": "textarea"
        },
        {
          "key": "order",
          "label": "展示顺序",
          "default": 1,
          "required": false,
          "type": "number"
        }
      ],
      "rows": [
        {
          "name": "陈珺",
          "role": "课程负责人",
          "school": "华东师范大学",
          "bio": "负责课程设计与基础教学",
          "order": 1
        },
        {
          "name": "李然",
          "role": "数据实践",
          "school": "华东师范大学",
          "bio": "负责课程设计与基础教学",
          "order": 2
        },
        {
          "name": "林悦",
          "role": "课程助教",
          "school": "华东师范大学",
          "bio": "负责课程设计与基础教学",
          "order": 3
        },
        {
          "name": "王璐",
          "role": "教学支持",
          "school": "华东师范大学",
          "bio": "负责课程设计与基础教学",
          "order": 4
        }
      ]
    },
    {
      "id": "results",
      "title": "学习成果",
      "description": "按学生查看课时、作业、考试与实验进度，支持组合筛选、详情及 CSV 导出。",
      "fields": [
        {
          "key": "name",
          "label": "学员",
          "default": "林同学",
          "required": true,
          "type": "text"
        },
        {
          "key": "progress",
          "label": "完成进度",
          "default": "8 / 24 课时",
          "required": false,
          "type": "text"
        },
        {
          "key": "checkin",
          "label": "学习打卡",
          "default": "2026-09-21 09:10:32",
          "required": false,
          "type": "text"
        },
        {
          "key": "assignments",
          "label": "作业记录",
          "default": "2 项已完成 / 1 项待完成",
          "required": false,
          "type": "text"
        },
        {
          "key": "quiz",
          "label": "测验成绩",
          "default": "80 / 100",
          "required": false,
          "type": "text"
        },
        {
          "key": "exam",
          "label": "考试状态",
          "default": "待批阅",
          "required": false,
          "type": "text"
        },
        {
          "key": "outcome",
          "label": "成果记录",
          "default": "词频统计项目草稿",
          "required": false,
          "type": "textarea"
        }
      ],
      "rows": [
        {
          "name": "林同学",
          "progress": "8 / 24 课时",
          "checkin": "2026-09-21 09:10:32",
          "assignments": "2 项已完成 / 1 项待完成",
          "quiz": "80 / 100",
          "exam": "待批阅",
          "outcome": "词频统计项目草稿"
        }
      ],
      "readonly": true
    },
    {
      "id": "highlights",
      "title": "亮点内容",
      "description": "仅付费课程展示，对应前台第二个标签。亮点根据本课知识点、首尾案例和课时节奏组织；不代表服务承诺。",
      "fields": [
        {
          "key": "name",
          "label": "亮点标题",
          "default": "核心方法，循序掌握",
          "required": true,
          "type": "text"
        },
        {
          "key": "body",
          "label": "亮点说明",
          "default": "",
          "required": true,
          "type": "textarea"
        },
        {
          "key": "order",
          "label": "展示顺序",
          "default": 1,
          "required": true,
          "type": "number"
        }
      ],
      "rows": [],
      "related": [
        {
          "label": "维护课程知识点",
          "href": "course-editor.html#knowledge"
        }
      ]
    },
    {
      "id": "payment-notes",
      "title": "付费须知",
      "description": "仅付费课程展示，对应前台第十个标签。价格与试看引用课程设置；正式退款资格、时限、金额及到账规则仍待确认。",
      "fields": [
        {
          "key": "name",
          "label": "说明标题",
          "default": "课程购买须知",
          "required": true,
          "type": "text"
        },
        {
          "key": "scope",
          "label": "单课范围说明",
          "default": "本次购买仅包含本课程，其他课程独立购买。",
          "required": true,
          "type": "textarea"
        },
        {
          "key": "validity",
          "label": "有效期说明",
          "default": "购买后长期有效，可在我的学习或我的购买找到。",
          "required": true,
          "type": "textarea"
        },
        {
          "key": "independence",
          "label": "内容独立性",
          "default": "课程用于学习参考，不承诺特定学习成绩、职业资格或收益。",
          "required": false,
          "type": "textarea"
        },
        {
          "key": "refund",
          "label": "售后说明",
          "default": "可在个人中心 → 我的购买 → 退款 / 售后提交申请。当前演示申请后暂时移除权益；正式退款规则待确认。",
          "required": true,
          "type": "textarea"
        },
        {
          "key": "copyright",
          "label": "使用与版权",
          "default": "仅供购买者个人学习，请勿擅自复制、转售或传播。",
          "required": false,
          "type": "textarea"
        },
        {
          "key": "rulesStatus",
          "label": "正式售后规则",
          "default": "待确认",
          "required": false,
          "options": [
            "待确认"
          ]
        }
      ],
      "rows": [],
      "related": [
        {
          "label": "配置课程付费设置",
          "href": "content.html#courses"
        },
        {
          "label": "处理退款与售后",
          "href": "commerce.html#refunds"
        }
      ]
    }
  ]
};
// Admin-owned content examples mirror the current frontend review baseline; no runtime data link.
const courseModels=window.AdminCourseModels;
managementConfig.sections.splice(2,0,{
  "id": "arena",
  "title": "课内竞技",
  "description": "关联当前课程课时，在页面内编辑选择题与竞技规则；AI 导师使用通用引导语。",
  "fields": [
    {
      "key": "name",
      "label": "名称",
      "default": "变量与类型实战",
      "required": true,
      "type": "text"
    },
    {
      "key": "lesson",
      "label": "关联课时",
      "default": "Python 2.4",
      "required": false,
      "type": "text"
    },
    {
      "key": "opponents",
      "label": "模拟对手数量",
      "default": 30,
      "required": false,
      "type": "number"
    },
    {
      "key": "batch",
      "label": "每批对手数",
      "default": 10,
      "required": false,
      "type": "number"
    },
    {
      "key": "rounds",
      "label": "每局抽题",
      "default": 3,
      "required": false,
      "type": "number"
    },
    {
      "key": "accuracy",
      "label": "分身正确率（%）",
      "default": 70,
      "required": false,
      "type": "number"
    },
    {
      "key": "delay",
      "label": "模拟思考时长",
      "default": "1—2.5 秒",
      "required": false,
      "type": "text"
    },
    {
      "key": "reward",
      "label": "结算与 XP 规则",
      "default": "按总分优先、同分耗时判定；越级与鼓励奖励。",
      "required": false,
      "type": "textarea"
    },
    {
      "key": "status",
      "label": "状态",
      "default": "已发布",
      "required": false,
      "options": [
        "草稿",
        "已发布",
        "已下架"
      ]
    }
  ],
  "rows": [
    {
      "name": "变量与类型实战",
      "lesson": "变量与类型实战",
      "opponents": 30,
      "batch": 10,
      "rounds": 3,
      "accuracy": 70,
      "delay": "1—2.5 秒",
      "reward": "按总分优先、同分耗时判定；越级与鼓励奖励。",
      "status": "已发布"
    },
    {
      "name": "表达式与输入输出挑战",
      "lesson": "表达式与输入输出挑战",
      "opponents": 30,
      "batch": 10,
      "rounds": 3,
      "accuracy": 70,
      "delay": "1—2.5 秒",
      "reward": "按总分优先、同分耗时判定；越级与鼓励奖励。",
      "status": "已发布"
    }
  ],
  "columns": [
    "name",
    "lesson",
    "status"
  ]
});
const courseRecord=AdminCourseState.current();
if(!courseRecord){
 document.querySelector('#management-root').innerHTML='<section class="card empty-state"><h2>暂无可建设的课程</h2><p>请先创建课程并填写基础信息。</p><a class="btn primary" href="content.html#courses">前往课程列表</a></section>';
}else{
const requestedCourse=new URLSearchParams(location.search).get('course')||courseRecord.name;
const selectedCourse=courseRecord.name;
if(selectedCourse!==requestedCourse){const url=new URL(location.href);url.searchParams.set('course',selectedCourse);history.replaceState(null,'',url);}
const sourceName=AdminCourseCatalog.find(row=>row.id===courseRecord.id)?.name||selectedCourse;
const model=courseModels[sourceName], section=id=>managementConfig.sections.find(s=>s.id===id);
document.querySelector('#course-context').textContent='当前课程：'+selectedCourse;
section('overview').rows[0].name=selectedCourse;
if(model){
 Object.assign(section('overview').rows[0],{owner:model.teacher,goals:model.goals?.join('\n')||'掌握'+model.knowledge.slice(0,4).join('、'),outline:model.chapters.map((c,i)=>`第 ${i+1} 章 · ${c}`).join('\n')});
 if(sourceName!=='Python 程序设计'){
  const seed=section('catalog').rows[0];
  section('catalog').rows=model.lessons.map((n,i)=>({...seed,name:n,chapter:model.chapters[Math.min(model.chapters.length-1,Math.floor(i/(model.lessons.length/model.chapters.length)))],order:i+1,type:model.id==='python-foundations'?'课件':seed.type,resource:`${model.id||'lesson'}-${i+1}.${model.id==='python-foundations'?'md':'mp4'}`,arena:'不启用',minutes:model.materials?.[i]?.minutes||10,body:model.materials?.[i]?.body||'',example:model.materials?.[i]?.example||''}));
  section('tasks').rows=model.id?[]:[{...section('tasks').rows[0],name:selectedCourse+'课程练习',reference:selectedCourse==='数据科学导论'?'DATA-CLASS-05':'课程内题卷',chapter:model.chapters[0],visibility:selectedCourse==='数字素养与安全'?'专属课程审核通过':'课程可学'}];
  const knowledge=section('knowledge').rows[0];section('knowledge').rows=model.knowledge.map((n,i)=>({...knowledge,name:n,parent:selectedCourse,target:model.knowledge[(i+1)%model.knowledge.length],lessons:model.lessons[Math.min(i,model.lessons.length-1)],description:n+'的基础方法与应用。'}));
  Object.assign(section('notices').rows[0],{name:selectedCourse+'学习安排',body:'请按课程目录完成学习与练习。'});
  Object.assign(section('discussion').rows[0],{name:model.lessons[0]+'学习交流',scope:selectedCourse,body:'这一节学习应关注哪些重点？',reply:'先理解概念，再通过案例练习。'});
  section('results').rows[0].progress='0 / '+model.lessons.length+' 课时';section('results').rows[0].outcome='暂无成果记录';
 }
 Object.assign(section('team').rows[0],{name:model.teacher,school:model.school});
 if(model.materials?.length){
  const lessons=model.lessons.map((n,i)=>`1.${i+1} ${n}`);
  section('coding-tasks').fields.find(f=>f.key==='lesson').options=lessons;
  section('coding-tasks').rows=model.materials.map((m,i)=>({name:model.lessons[i]+'配套题',lesson:lessons[i],problems:m.problems.join('\n'),order:i+1,access:'继承所属课时权限',status:'已发布'})).filter(row=>row.problems.trim());
 }
 if(model.paid){
  section('highlights').rows=[{name:'核心方法，循序掌握',body:'围绕'+model.knowledge.slice(0,4).join('、')+'建立知识框架。',order:1},{name:'跟随案例，动手实践',body:'从「'+model.lessons[0]+'」到「'+model.lessons[model.lessons.length-1]+'」，串联概念与应用。',order:2},{name:'节奏灵活，自主学习',body:model.lessons.length+' 节课程可分节理解、反复练习。',order:3}];
  section('payment-notes').rows=[Object.fromEntries(section('payment-notes').fields.map(f=>[f.key,f.default]))];
  section('payment-notes').rows[0].scope='仅包含「'+selectedCourse+'」的全部 '+model.lessons.length+' 节课程，其他课程独立购买。';
 }
}else{
 managementConfig.sections.forEach(s=>s.rows=[]);section('overview').rows=[{name:selectedCourse,owner:courseRecord.teacher||'待配置',goals:courseRecord.summary||'待补充',outline:'待补充',prerequisite:'待补充',schedule:'待补充',status:'草稿'}];
}
const arena=section('arena'),lessonField=arena.fields.find(f=>f.key==='lesson');
lessonField.options=section('catalog').rows.map(r=>r.name);lessonField.required=true;lessonField.default=lessonField.options[0]||'';
arena.create=lessonField.options.length>0;
if(sourceName!=='Python 程序设计'){
 arena.rows=[];
 arena.fields.find(f=>f.key==='name').default=selectedCourse+'课内竞技';

}
const arenaRecords=selectedCourse==='Python 程序设计'?[{lesson:'变量与类型实战',name:'林同学',mode:'速度对战',result:'2 胜 / 1 负',xp:'120 XP'}]:[];
arena.records={label:'参与记录',fields:[{key:'name',label:'学员'},{key:'mode',label:'竞技模式'},{key:'result',label:'战绩'},{key:'xp',label:'知识量'}],rows:record=>arenaRecords.filter(row=>row.lesson===record.lesson)};
managementConfig.sections=managementConfig.sections.filter(s=>(!['highlights','payment-notes'].includes(s.id)||model?.paid)&&(s.id!=='coding-tasks'||model?.materials?.length));
managementConfig.sections.forEach(s=>{(s.related||[]).forEach(link=>{if(link.href.startsWith('course-editor.html#'))link.href='course-editor.html?course='+encodeURIComponent(selectedCourse)+link.href.slice('course-editor.html'.length);});});
managementConfig.validate=(record,current)=>{
 if(current.id==='arena'&&!lessonField.options.includes(record.lesson))return {key:'lesson',message:'请选择当前课程的课时。'};
 if(current.id==='coding-tasks'){
  const ids=record.problems.split(/\s+/).filter(Boolean);
  if(ids.some(id=>!/^P00[1-9]$|^P010$/.test(id)))return {key:'problems',message:'请使用现有编程题库编号 P001—P010。'};
  if(new Set(ids).size!==ids.length)return {key:'problems',message:'同一课时不能重复关联同一道题。'};
 }
};
if(document.body.dataset.page==='smart-build')AdminSmartBuild.mount(managementConfig,courseRecord,model);
else {
 const contentModules=AdminCourseState.modules(courseRecord.id)||AdminPreparationModel.create(managementConfig,selectedCourse,model);
 AdminPreparation.mount(managementConfig,selectedCourse,model);

 AdminCourseKnowledge.mount(section('knowledge'),selectedCourse);
 AdminCourseContent.mount(managementConfig,courseRecord,contentModules);
}

}
