// Shared course knowledge graph: layout and interaction; labels belong to each course.
function renderKnowledgeGraph(labels,keys=[]){
 return `<div class="view-head"><div><h2>课程知识点</h2><p class="meta">按课程结构展示知识点的包含与关联关系。</p></div></div><div class="knowledge-toolbar"><label for="knowledge-locator">知识点定位</label><select id="knowledge-locator"><option value="">选择要高亮的知识点</option>${labels.map((label,i)=>`<option value="${keys[i]||'node-'+i}">${escapeHTML(label)}</option>`).join('')}</select><button class="btn small" id="clear-knowledge">清除高亮</button><button class="btn small" id="reset-knowledge">↻ 重置视图</button><div class="knowledge-legend"><b>图例</b><span><i class="legend-root"></i>根节点</span><span><i></i>知识点</span><span>— 包含关系</span><span class="relation">— 关联关系</span></div></div><div class="knowledge-canvas"><div class="knowledge-map" id="knowledge-map"><svg class="graph-lines" viewBox="0 0 800 440" preserveAspectRatio="none" aria-hidden="true"><g stroke="#b8c1bc" stroke-width="2"><line x1="400" y1="220" x2="220" y2="95"/><line x1="400" y1="220" x2="585" y2="92"/><line x1="400" y1="220" x2="180" y2="320"/><line x1="400" y1="220" x2="610" y2="322"/><line x1="220" y1="95" x2="80" y2="55"/><line x1="220" y1="95" x2="120" y2="165"/><line x1="220" y1="95" x2="310" y2="42"/><line x1="585" y1="92" x2="700" y2="45"/><line x1="585" y1="92" x2="720" y2="160"/><line x1="180" y1="320" x2="72" y2="380"/><line x1="180" y1="320" x2="290" y2="395"/><line x1="610" y1="322" x2="725" y2="385"/></g><g stroke="#66a9ff" stroke-width="2"><line x1="120" y1="165" x2="585" y2="92"/><line x1="290" y1="395" x2="610" y2="322"/></g></svg><button class="graph-node root" style="--x:50%;--y:50%" data-k-node="${keys[0]||'node-0'}">${escapeHTML(labels[0])}</button><button class="graph-node" style="--x:27%;--y:22%" data-k-node="${keys[1]||'node-1'}">${escapeHTML(labels[1])}</button><button class="graph-node" style="--x:73%;--y:21%" data-k-node="${keys[2]||'node-2'}">${escapeHTML(labels[2])}</button><button class="graph-node" style="--x:23%;--y:73%" data-k-node="${keys[3]||'node-3'}">${escapeHTML(labels[3])}</button><button class="graph-node" style="--x:76%;--y:73%" data-k-node="${keys[4]||'node-4'}">${escapeHTML(labels[4])}</button><button class="graph-node minor" style="--x:10%;--y:12%" data-k-node="${keys[5]||'node-5'}">${escapeHTML(labels[5])}</button><button class="graph-node minor" style="--x:15%;--y:37%" data-k-node="${keys[6]||'node-6'}">${escapeHTML(labels[6])}</button><button class="graph-node minor" style="--x:39%;--y:9%" data-k-node="${keys[7]||'node-7'}">${escapeHTML(labels[7])}</button><button class="graph-node minor" style="--x:87%;--y:10%" data-k-node="${keys[8]||'node-8'}">${escapeHTML(labels[8])}</button><button class="graph-node minor" style="--x:90%;--y:36%" data-k-node="${keys[9]||'node-9'}">${escapeHTML(labels[9])}</button><button class="graph-node minor" style="--x:9%;--y:87%" data-k-node="${keys[10]||'node-10'}">${escapeHTML(labels[10])}</button><button class="graph-node minor" style="--x:36%;--y:90%" data-k-node="${keys[11]||'node-11'}">${escapeHTML(labels[11])}</button><button class="graph-node minor" style="--x:91%;--y:88%" data-k-node="${keys[12]||'node-12'}">${escapeHTML(labels[12])}</button></div></div><p class="knowledge-detail" id="knowledge-detail" aria-live="polite">选择或点击知识点，可查看它在课程中的位置与掌握情况。</p>`;
}
function clearKnowledge() {
  const map=$('#knowledge-map');
  if(!map)return;
  map.classList.remove('has-focus');
  $$('.graph-node',map).forEach(n=>n.classList.remove('focused'));
  $('#knowledge-detail').textContent='选择或点击知识点，可查看它在课程中的位置与掌握情况。';
  const locator=$('#knowledge-locator');
  if(locator)locator.value=''
}
function focusKnowledge(node) {
  const map=$('#knowledge-map');
  if(!map||!node)return;
  map.classList.add('has-focus');
  $$('.graph-node',map).forEach(n=>n.classList.toggle('focused',n===node));
  $('#knowledge-detail').textContent=`${node.textContent.trim()}：点击相邻节点可以继续查看知识关系；掌握情况以最近一次练习为准。`
}
document.addEventListener('change',e=> {
  if(e.target.id==='knowledge-locator') {
    const node=$(`[data-k-node="${e.target.value}"]`);
    if(node)focusKnowledge(node);
    else clearKnowledge()
  }
}
);
document.addEventListener('click',e=> {
  const node=e.target.closest('.graph-node');
  if(node)focusKnowledge(node);
  if(e.target.closest('#clear-knowledge'))clearKnowledge();
  if(e.target.closest('#reset-knowledge')) {
    clearKnowledge();
    const canvas=$('.knowledge-canvas');
    if(canvas)canvas.scrollLeft=0
  }
}
);
