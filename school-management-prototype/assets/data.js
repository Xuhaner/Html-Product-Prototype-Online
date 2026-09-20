/* =========================================================
   模拟数据
   分层：
   - ACCOUNT  账号级：跨学校共享，切换学校不变化
   - SCHOOLS  学校级：认证关系（用户 × 学校）
   - enrollments 学籍阶段：一所学校下可以有多个学历阶段（专升本 / 读研）
     课程、考试、成绩挂在「学籍阶段」上，不挂在学校上
   ========================================================= */
(function () {
  "use strict";

  var ACCOUNT = {
    uid: "U_18500082826",
    account: "18500082826",
    phone: "18500082826",
    phoneMask: "185****2826",
    nickname: "wxh26",
    gender: "未知",
    wechat: null,
    intro: null,
    joinedAt: "2026-08-20"
  };

  /* 学历层次选项，供重新认证表单使用 */
  var LEVELS = ["专科", "本科", "硕士", "博士"];
  var TRACKS = ["普通高考", "专升本", "研究生", "成人教育"];

  var SCHOOLS = [
    {
      id: "guida-test",
      name: "贵州大学测试1",
      authedAt: "2026-09-01 14:20",
      authStatus: "active",
      enrollments: [
        {
          id: "enr-guida-2026",
          level: "本科",
          track: "专升本",
          studentNo: "2026090302",
          realName: "wxh26",
          college: "152",
          major: "532",
          className: "345",
          enrollYear: "2026",
          status: "在读",
          isCurrent: true,
          verifiedAt: "2026-09-01 14:20",
          metrics: { courses: 5, exams: 2, credits: 12.5, gpa: "3.42" },
          courses: [
            { name: "高等数学（下）", teacher: "李国强", progress: 78, status: "学习中" },
            { name: "大学英语（3）", teacher: "Amy Chen", progress: 64, status: "学习中" },
            { name: "数据结构", teacher: "王海涛", progress: 92, status: "学习中" },
            { name: "计算机网络", teacher: "刘敏", progress: 41, status: "学习中" },
            { name: "形势与政策", teacher: "周文", progress: 100, status: "已完成" }
          ],
          exams: [
            { name: "数据结构 · 期中测验", date: "2026-10-12", score: "88", state: "已出分" },
            { name: "计算机网络 · 章节测（第 2 章）", date: "2026-10-20", score: "--", state: "待考试" }
          ],
          transcript: [
            { term: "2026-2027 学年 第一学期", course: "形势与政策", credit: "2.0", score: "92" },
            { term: "2026-2027 学年 第一学期", course: "数据结构", credit: "3.5", score: "88" },
            { term: "2026-2027 学年 第一学期", course: "高等数学（下）", credit: "4.0", score: "81" }
          ]
        }
      ]
    },
    {
      id: "guizhouwen",
      name: "贵州文",
      authedAt: "2026-06-11 09:05",
      authStatus: "active",
      enrollments: [
        {
          id: "enr-gzw-2024",
          level: "专科",
          track: "普通高考",
          studentNo: "1237821",
          realName: "王东喜",
          college: "贵在",
          major: "贵州",
          className: "7823",
          enrollYear: "2024",
          status: "已毕业",
          isCurrent: true,
          verifiedAt: "2026-06-11 09:05",
          metrics: { courses: 4, exams: 1, credits: 9.0, gpa: "3.08" },
          courses: [
            { name: "大学语文", teacher: "陈静", progress: 100, status: "已完成" },
            { name: "思想道德与法治", teacher: "赵鹏", progress: 100, status: "已完成" },
            { name: "计算机应用基础", teacher: "孙倩", progress: 55, status: "学习中" },
            { name: "体育（1）", teacher: "马强", progress: 30, status: "学习中" }
          ],
          exams: [
            { name: "计算机应用基础 · 期末考", date: "2026-11-02", score: "--", state: "待考试" }
          ],
          transcript: [
            { term: "2025-2026 学年 第二学期", course: "大学语文", credit: "2.0", score: "90" },
            { term: "2025-2026 学年 第二学期", course: "思想道德与法治", credit: "2.0", score: "86" }
          ]
        }
      ]
    },
    {
      id: "gzu-master",
      name: "贵州大学（研究生院）",
      authedAt: "2026-09-10 16:40",
      authStatus: "active",
      enrollments: [
        {
          id: "enr-gzu-m2026",
          level: "硕士",
          track: "研究生",
          studentNo: "M20261088",
          realName: "wxh26",
          college: "计算机科学与技术学院",
          major: "计算机技术",
          className: "研 2601 班",
          enrollYear: "2026",
          status: "在读",
          isCurrent: true,
          verifiedAt: "2026-09-10 16:40",
          metrics: { courses: 3, exams: 0, credits: 6.0, gpa: "--" },
          courses: [
            { name: "高级算法设计", teacher: "何伟", progress: 22, status: "学习中" },
            { name: "机器学习导论", teacher: "林小雨", progress: 15, status: "学习中" },
            { name: "学术英语写作", teacher: "D. Brown", progress: 48, status: "学习中" }
          ],
          exams: [],
          transcript: []
        }
      ]
    }
  ];

  var SCENARIOS = [
    { id: "default", label: "两所学校（默认）", primary: "guida-test", ids: ["guida-test", "guizhouwen"] },
    { id: "three", label: "三所学校", primary: "guida-test", ids: ["guida-test", "guizhouwen", "gzu-master"] },
    { id: "single", label: "仅一所（不可解绑）", primary: "guida-test", ids: ["guida-test"] },
    { id: "empty", label: "空态（从未认证）", primary: null, ids: [] }
  ];

  window.PROTO_DATA = {
    ACCOUNT: ACCOUNT,
    SCHOOLS: SCHOOLS,
    SCENARIOS: SCENARIOS,
    LEVELS: LEVELS,
    TRACKS: TRACKS,
    MOCK_CODE: "123456",
    UNBIND_KEEP_DAYS: 90
  };
})();
