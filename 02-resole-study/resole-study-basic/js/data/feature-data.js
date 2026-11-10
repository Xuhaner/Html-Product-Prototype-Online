const featureContent={
 'digital-education':{zone:'featured',title:'数字化转型与未来大学',author:'周远航 · 高等教育研究院',duration:'32 分钟',free:true},
 'ai-classroom':{zone:'featured',title:'AI 助教如何进入真实课堂',author:'陈珺 · 华东师范大学',duration:'48 分钟',price:39},
 'project-learning':{zone:'featured',title:'项目制学习的评价设计',author:'刘岚 · 教师发展中心',duration:'41 分钟',price:29,paidOnly:true},
 'data-thinking':{zone:'featured',title:'从图表到判断：数据思维入门',author:'孙睿 · 数据科学学院',duration:'36 分钟',free:true},
 'course-community':{zone:'featured',title:'让在线课堂真正发生互动',author:'王璐 · 在线教育中心',duration:'45 分钟',price:29},
 'hybrid-learning':{zone:'featured',title:'混合式教学的课堂重构',author:'许言 · 教师发展中心',duration:'40 分钟',free:true},
 'learning-analytics':{zone:'featured',title:'学习分析如何支持教学决策',author:'唐敏 · 教育学部',duration:'37 分钟',price:19},
 'micro-credential':{zone:'featured',title:'微专业与能力认证实践',author:'郑为 · 教务处',duration:'46 分钟',free:true},
 'ai-literacy':{zone:'ai',title:'生成式 AI 素养第一课',author:'吴飞 · 浙江大学',duration:'28 分钟',free:true},
 'ai-safety':{zone:'ai',title:'人工智能伦理与安全边界',author:'杨子祺 · 浙江大学',duration:'52 分钟',price:39},
 'ai-research':{zone:'ai',title:'AI 赋能科研全流程',author:'周彦 · 湘潭大学',duration:'39 分钟',free:true},
 'ai-medicine':{zone:'ai',title:'人工智能与智慧医学',author:'李校笙 · 温州医科大学',duration:'44 分钟',free:true},
 'prompt-design':{zone:'ai',title:'提示词设计与任务拆解',author:'韩宁 · 计算机学院',duration:'33 分钟',free:true},
 'ai-law':{zone:'ai',title:'生成式 AI 的法律问题',author:'顾晨 · 法学院',duration:'49 分钟',free:true},
 'machine-learning':{zone:'ai',title:'机器学习模型如何形成判断',author:'陆原 · 人工智能研究院',duration:'43 分钟',free:true},
 'ecology':{zone:'gold',title:'生态文明与绿色发展',author:'张禾 · 北京林业大学',duration:'46 分钟',free:true},
 'culture':{zone:'gold',title:'典籍里的中华文化',author:'刘彦仕 · 四川文理学院',duration:'50 分钟',free:true},
 'innovation':{zone:'gold',title:'创新创业风险管理',author:'孟奕爽 · 湖南师范大学',duration:'43 分钟',free:true},
 'open-science':{zone:'gold',title:'开放科学实践导论',author:'林远 · 科学技术研究院',duration:'34 分钟',free:true},
 'modern-china':{zone:'gold',title:'理解现代中国',author:'梁辛 · 马克思主义学院',duration:'48 分钟',free:true},
 'engineering-ethics':{zone:'gold',title:'工程伦理与公共责任',author:'罗清 · 工程学院',duration:'39 分钟',free:true},
 'public-health':{zone:'gold',title:'公共健康与社会生活',author:'方舒 · 公共卫生学院',duration:'45 分钟',free:true},
 'information-literacy':{zone:'literacy',title:'大学生信息素养导论',author:'赵清 · 图书馆',duration:'30 分钟',free:true},
 'privacy':{zone:'literacy',title:'数字身份与隐私保护',author:'何川 · 网络安全学院',duration:'38 分钟',free:true},
 'fact-checking':{zone:'literacy',title:'网络信息核验方法',author:'高宁 · 新闻传播学院',duration:'35 分钟',free:true},
 'academic-integrity':{zone:'literacy',title:'AI 时代的学术诚信',author:'沈瑜 · 教务处',duration:'42 分钟',free:true},
 'copyright':{zone:'literacy',title:'学习资源与版权基础',author:'程沐 · 法学院',duration:'31 分钟',free:true},
 'media-literacy':{zone:'literacy',title:'短视频时代的媒介素养',author:'苏晓 · 传播学院',duration:'44 分钟',price:19},
 'digital-wellbeing':{zone:'literacy',title:'数字健康与注意力管理',author:'叶青 · 心理与认知学院',duration:'36 分钟',free:true}
};
const featureZones={
 featured:{name:'精选内容',description:'编辑精选的高校公开课、专题讲座与教学分享'},
 ai:{name:'人工智能共享课',description:'理解技术，也理解它进入学习与工作的方式'},
 gold:{name:'国家金课',description:'来自高校课堂的一线教学内容'},
 literacy:{name:'数字素养专区',description:'从信息判断到安全与学术诚信，建立数字世界的基本能力'}
};

// 专区课程与精品课程共用详情和学习模板，保留各自的课程 ID 与权益。
const featureCurricula={
 featured:{lessons:['问题导入与学习目标','核心概念与案例分析','实践方案与实施方法','总结与行动建议'],knowledge:['学习目标','核心概念','案例分析','实践应用','问题识别','场景背景','关键术语','方法选择','案例对比','实施步骤','效果评价','行动计划']},
 ai:{lessons:['认识人工智能应用场景','核心原理与使用方法','应用案例与结果核验','安全边界与实践建议'],knowledge:['应用场景','技术原理','使用方法','安全边界','任务目标','数据输入','模型输出','提示设计','结果核验','偏差识别','隐私保护','负责任使用']},
 gold:{lessons:['课程导论与核心问题','基础概念与理论框架','典型案例与分析方法','综合实践与课程总结'],knowledge:['核心问题','理论框架','案例分析','综合实践','基本概念','历史背景','研究视角','分析方法','证据判断','观点比较','实践任务','总结反思']},
 literacy:{lessons:['数字生活中的核心问题','基本知识与判断方法','典型情境与实践练习','个人行动与习惯养成'],knowledge:['数字素养','信息判断','实践方法','行为规范','信息来源','检索策略','证据核验','风险识别','隐私意识','资源使用','责任边界','行动习惯']}
};
Object.values(featureContent).forEach(course=>{
 Object.assign(course,featureCurricula[course.zone],{trial:!course.free&&!course.paidOnly,summary:`围绕“${course.title}”，结合案例理解核心概念、实践方法与应用边界，形成可执行的学习成果。`});
});
