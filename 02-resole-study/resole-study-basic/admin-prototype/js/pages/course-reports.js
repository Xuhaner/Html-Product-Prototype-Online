window.AdminCourseReports={open(course,trigger,modules=[]){
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 document.querySelector('#course-report-subtitle').textContent=course+' · 基础学习记录';
 const students=AdminTeaching.students.filter(s=>s.course===course);
 document.querySelector('#course-report-body').innerHTML='<p class="meta">独立示例，不读取学生端真实学习或提交。课程学习成果入口提供明细与 CSV 导出。</p><div class="table-wrap"><table><thead><tr><th>学号</th><th>姓名</th><th>课程进度</th><th>任务数</th></tr></thead><tbody>'+students.map(s=>'<tr><td>'+esc(s.student)+'</td><td>'+esc(s.name)+'</td><td>'+esc(s.progress)+'</td><td>'+modules.reduce((n,m)=>n+m.resources.length,0)+'</td></tr>').join('')+'</tbody></table></div>';
 document.querySelector('#report-print').onclick=()=>window.print();AdminUI.openModal('course-report-modal',trigger);
}};
