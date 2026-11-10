/* Same-tab course draft lifecycle. Independent of student state and real accounts. */
(() => {
 'use strict';
 const key='ruixiu-basic-admin-courses-v1:'+new URL('.',location.href).href+':'+AdminUI.role;
 let state={courses:[],removed:[],preparations:{},builds:{}},available=true;
 try{const saved=JSON.parse(sessionStorage.getItem(key)||'null');if(saved?.courses&&saved?.preparations&&saved?.builds&&saved?.removed)state=saved;}catch{available=false;}
 const clone=value=>JSON.parse(JSON.stringify(value));
 function commit(){
  try{sessionStorage.setItem(key,JSON.stringify(state));available=true;return true;}
  catch{available=false;AdminUI.toast('无法保存本地演示','浏览器存储不可用或已满，请保留当前页面；此次操作未完成跨页保存。');return false;}
 }
 function courses(){
  const seeds=AdminCourseCatalog.filter(row=>AdminUI.isSuper||AdminTeaching.courses.includes(row.name));
  return clone([...state.courses.filter(row=>!seeds.some(s=>s.id===row.id)),...seeds.map(row=>state.courses.find(s=>s.id===row.id)||row)].filter(row=>!state.removed.includes(row.id)));
 }
 function current(){const params=new URLSearchParams(location.search),rows=courses();return rows.find(row=>row.id===params.get('courseId'))||rows.find(row=>row.name===params.get('course'))||rows[0];}
 window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
 window.AdminCourseState={
  courses,current,available:()=>available,
  putCourse(row){const previous=clone(state);state.courses=state.courses.filter(r=>r.id!==row.id);state.courses.unshift(clone(row));state.removed=state.removed.filter(id=>id!==row.id);if(commit())return true;state=previous;return false;},
  removeCourse(id){const previous=clone(state);state.removed.push(id);delete state.preparations[id];delete state.builds[id];if(commit())return true;state=previous;return false;},
  modules:id=>state.preparations[id]?clone(state.preparations[id]):null,
  saveModules(id,modules){const previous=state.preparations[id];state.preparations[id]=clone(modules);if(commit())return true;state.preparations[id]=previous;return false;},
  build:id=>state.builds[id]?clone(state.builds[id]):null,
  saveBuild(id,draft){const previous=state.builds[id];state.builds[id]=clone(draft);if(commit())return true;state.builds[id]=previous;return false;},
  // Adoption and its receipt commit together, so returning cannot insert a batch twice.
  adopt(id,modules,draft){const previous=clone(state);state.preparations[id]=clone(modules);state.builds[id]=clone(draft);if(commit())return true;state=previous;return false;},
  reset(){try{sessionStorage.removeItem(key);state={courses:[],removed:[],preparations:{},builds:{}};available=true;return true;}catch{return false;}}
 };
})();
