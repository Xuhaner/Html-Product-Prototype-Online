/* Default signed-in prototype; logout only opens the login demonstration. */
(() => {
 'use strict';
 const role=new URLSearchParams(location.search).get('role')==='super'?'super':'teacher';
 const home=mode=>(mode==='super'?'super-admin':'index')+'.html?role='+mode;
 const loginUrl=(mode,next='',signedOut=false)=>'login.html?'+new URLSearchParams({role:mode,...(next?{next}:{}),...(signedOut?{signedOut:'1'}:{})});
 const signOut=mode=>{location.href=loginUrl(mode,'',true);};
 // Only local HTML in this administration directory may be a return destination.
 const destination=(value,mode)=>{
  if(!value)return home(mode);
  try {
  const target=new URL(value,location.href),directory=new URL('.',location.href);
  if(target.origin!==directory.origin||new URL('.',target).href!==directory.href||!target.pathname.endsWith('.html')||target.pathname.endsWith('/login.html'))return home(mode);
  target.searchParams.set('role',mode);
  return target.pathname.split('/').pop()+target.search+target.hash;
  }catch{return home(mode);}
 };
 window.AdminAuth={role,home,loginUrl,signOut,destination};
})();
