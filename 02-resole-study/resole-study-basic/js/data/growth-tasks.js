// Shared static growth tasks and point rewards. No DOM or workflow.
const growthTasks = [
 {id:'daily-lesson',period:'day',points:10,metric:'lessons',target:1,unit:'课时',icon:'book',title:'每天打开一扇窗',subtitle:'完成任意课程的 1 个课时',detail:'学习视频、图文或课件后，使用课程页的课时完成入口。不同课程均可参与，同一课时只记录首次完成。',href:'pages/courses/courses.html',action:'去学一课'},
 {id:'daily-quiz',period:'day',points:10,metric:'quizzes',target:1,unit:'次',icon:'check',title:'给知识一个回应',subtitle:'完成 1 次练习或测验',detail:'完整作答并提交一份练习或测验，不要求满分。空白交卷、正式考试和同一份测验的重复提交不累计。',href:'pages/profile/growth.html?activity=quiz',action:'开始小测'},
 {id:'daily-time',period:'day',points:10,metric:'minutes',target:20,unit:'分钟',icon:'clock',title:'留一点时间给自己',subtitle:'今日累计学习 20 分钟',detail:'在可学习的课时页阅读或播放演示时累计；页面隐藏、播放暂停或弹窗打开时不计入。成长页停留不累计。当前是本地前台计时演示。',href:'pages/courses/courses.html',action:'继续学习'},
 {id:'weekly-chapter',period:'week',points:30,metric:'chapters',target:1,unit:'章',icon:'flag',title:'把一章学成自己的',subtitle:'本周完成任意课程的 1 个章节',detail:'以课程目录的实际章节为单位，完成该章节的全部课时后记录。跨周学习可接续，章节在最后一个课时完成当周计入；重复学习不重复累计。',href:'pages/courses/courses.html',action:'推进章节'},
 {id:'weekly-lesson',period:'week',points:30,metric:'lessons',target:5,unit:'课时',icon:'book',title:'让小步汇成一程',subtitle:'本周累计完成 5 个课时',detail:'不同课程的课时可以累计；一个课时首次完成记录一次，同时推动每日与每周任务。',href:'pages/courses/courses.html',action:'去学一课'},
 {id:'weekly-quiz',period:'week',points:30,metric:'quizzes',target:3,unit:'次',icon:'check',title:'让理解多走一步',subtitle:'本周完成 3 份不同的练习或测验',detail:'不同课程、不同练习均可参与。重复作答同一份测验不增加任务进度，成绩高低不影响完成记录。',href:'pages/profile/growth.html?activity=quiz',action:'开始小测'},
 {id:'weekly-time',period:'week',points:30,metric:'minutes',target:120,unit:'分钟',icon:'clock',title:'与学习好好相处',subtitle:'本周累计学习 120 分钟',detail:'累计本周有效学习页的前台学习时间，每日时长同时计入本周，无须连续完成。',href:'pages/courses/courses.html',action:'继续学习'}
];
