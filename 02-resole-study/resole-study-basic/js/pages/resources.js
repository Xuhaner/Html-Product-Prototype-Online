const resourceItems=[
 {title:'3.2 列表与循环 · 学习讲义',file:'列表与循环-讲义.md',body:'# 列表与循环\n\n列表有序保存多个元素。for 循环逐个访问其中的元素。\n\n```python\nnames = ["Lin", "Zhou"]\nfor name in names:\n    print(name)\n```\n\n## 练习\n使用循环求 [1, 2, 3, 4] 的和。\n\n本讲义为原型本地演示资料。'},
 {title:'词频统计 · 示例代码',file:'word_count.py',body:'from collections import Counter\n\ndef top_word(text):\n    counts = Counter(text.split())\n    return min(counts, key=lambda word: (-counts[word], word))\n\nprint(top_word("data makes data useful"))\n'},
 {title:'第三章 · 复习清单',file:'第三章复习清单.txt',body:'第三章复习清单（演示）\n□ 理解 if / elif / else\n□ 能使用 for 遍历列表\n□ 了解 break 与 continue\n□ 能用嵌套循环处理二维数据\n□ 完成章节练习与小测'}
];
$('#resources-root').innerHTML=`<div class="flow-head"><div><div class="eyebrow">Python 程序设计</div><h1>课件资料</h1><p class="meta">3 份本地演示资料 · 可预览、下载</p></div><button class="btn" data-go="learn">返回学习</button></div><div class="flow-stack">${resourceItems.map((r,i)=>`<article class="card flow-card"><h2>${r.title}</h2><p class="meta">${r.file} · 无需联网</p><button class="btn" data-preview-resource="${i}">预览</button> <button class="btn primary" data-download-resource="${i}">下载资料</button></article>`).join('')}</div>`;
document.addEventListener('click',e=>{
 const preview=e.target.closest('[data-preview-resource]');if(preview){const r=resourceItems[Number(preview.dataset.previewResource)];openFlowDialog(r.title,`<pre>${escapeHTML(r.body)}</pre>`);}
 const download=e.target.closest('[data-download-resource]');if(download){const r=resourceItems[Number(download.dataset.downloadResource)];downloadText(r.file,r.body);}
});
