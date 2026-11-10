/* Administrator-only UI; Firestore Rules, not this UI, enforce access. */
const $=id=>document.getElementById(id);
const cfg=window.EAI_FIREBASE_CONFIG;
const configured=cfg && cfg.apiKey && cfg.appId && cfg.projectId;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const BOOK=window.EAI_SEED_DATA?.units||[],SEED=window.EAI_SEED_DATA?.lessons||{};
const BOOK2=window.EAI_GRADE2_SEED_DATA?.units||[],SEED2=window.EAI_GRADE2_SEED_DATA?.lessons||{};
const BOOK3=window.EAI_GRADE3_SEED_DATA?.units||[],SEED3=window.EAI_GRADE3_SEED_DATA?.lessons||{};
const BOOK4=window.EAI_GRADE4_SEED_DATA?.units||[],SEED4=window.EAI_GRADE4_SEED_DATA?.lessons||{};
const BOOK5=window.EAI_GRADE5_SEED_DATA?.units||[],SEED5=window.EAI_GRADE5_SEED_DATA?.lessons||{};
const BOOK6=window.EAI_GRADE6_SEED_DATA?.units||[],SEED6=window.EAI_GRADE6_SEED_DATA?.lessons||{};
const gradeOf=d=>Number(d?.grade||1);
let firebase=null,auth=null,db=null,docs=[],selected=null,cloudEnabled=false,user=null;
const status=(msg,kind='ok')=>{$('status').innerHTML=`<div class="${kind}">${esc(msg)}</div>`;};
function syncUnitMenus(){
 const grade=Number($('gradeId').value||1),books=grade===2?BOOK2:grade===3?BOOK3:grade===4?BOOK4:grade===5?BOOK5:grade===6?BOOK6:BOOK,chosen=$('unitId').value;
 $('unitId').innerHTML=books.map(u=>`<option value="${u.id}">Unit ${u.id} – ${esc(u.title)}</option>`).join('');
 if(books.some(u=>String(u.id)===chosen))$('unitId').value=chosen;
 const filterGrade=$('gradeFilter').value,filterBook=filterGrade==='6'?BOOK6:filterGrade==='5'?BOOK5:filterGrade==='4'?BOOK4:filterGrade==='3'?BOOK3:filterGrade==='2'?BOOK2:filterGrade==='1'?BOOK:null,current=$('filter').value;
 const opts=filterBook?filterBook.map(u=>`<option value="${u.id}">Unit ${u.id} – ${esc(u.title)}</option>`).join(''):'';
 $('filter').innerHTML='<option value="all">جميع الوحدات</option>'+opts;
 if(filterBook&&filterBook.some(u=>String(u.id)===current))$('filter').value=current;
}
syncUnitMenus();
const key=(grade,u,id)=>grade===1?`${u}_${id}`:`g${grade}_${u}_${id}`;
function formRead(){const unitId=Number($('unitId').value),lessonId=Number($('lessonId').value);const words=$('words').value.split(/\r?\n/).filter(x=>x.trim()).map(line=>{const i=line.indexOf('|');return i<0?[line.trim(),'📘']:[line.slice(0,i).trim(),line.slice(i+1).trim()||'📘']});const sentences=$('sentences').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
return {...(Number($('gradeId').value)>1?{grade:Number($('gradeId').value)}:{}),unitId,lessonId,title:$('title').value.trim(),ar:$('ar').value.trim(),icon:$('icon').value.trim()||'📚',words,sentences,published:$('publishedInput').checked}}
function fillForm(d){
 selected=d?.id||null;
 $('formTitle').textContent=d?'✏️ تعديل درس':'➕ إضافة درس';
 $('gradeId').value=String(gradeOf(d));syncUnitMenus();
 $('unitId').value=d?.unitId||1;
 $('lessonId').value=d?.lessonId||nextLesson(Number($('unitId').value),gradeOf(d));
 $('title').value=d?.title||'';$('ar').value=d?.ar||'';$('icon').value=d?.icon||'📚';
 $('words').value=(d?.words||[]).map(w=>w.join(' | ')).join('\n');
 $('sentences').value=(d?.sentences||[]).join('\n');
 $('publishedInput').checked=d?.published!==false;
 $('delete').disabled=!d;renderList();
}
function nextLesson(u,grade=Number($('gradeId').value||1)){
 return 1+Math.max(0,...docs.filter(d=>d.unitId===u&&gradeOf(d)===grade).map(d=>d.lessonId));
}
function renderList(){
 const gradeFilter=$('gradeFilter').value,filter=$('filter').value,q=$('search').value.toLowerCase().trim();
 const list=docs.filter(d=>(gradeFilter==='all'||String(gradeOf(d))===gradeFilter)&&
 (filter==='all'||String(d.unitId)===filter)&&(`${d.title} ${d.ar}`.toLowerCase().includes(q)))
 .sort((a,b)=>gradeOf(a)-gradeOf(b)||a.unitId-b.unitId||a.lessonId-b.lessonId);
 $('items').innerHTML=list.length?list.map(d=>`<button type="button" class="item ${d.id===selected?'active':''}" data-id="${esc(d.id)}"><span class="num">${gradeOf(d)} · ${d.unitId}.${d.lessonId}</span><span style="flex:1"><strong>${esc(d.icon)} ${esc(d.title)}</strong><br><small class="muted">${esc(d.ar)}</small></span><span class="pill" style="background:${d.published?'#deffef':'#ffe5eb'}">${d.published?'منشور':'مخفي'}</span></button>`).join(''):'<p class="hint">لا توجد دروس ضمن هذا الاختيار.</p>';
 $('total').textContent=docs.length;$('published').textContent=docs.filter(x=>x.published).length;$('drafts').textContent=docs.filter(x=>!x.published).length;
 $('cloudStatus').textContent=cloudEnabled?'الموقع يسحب الدروس من Firestore':'الموقع يستخدم الدروس المحلية حالياً';
}
async function refresh(){
 const {collection,getDocs,doc,getDoc}=firebase.fs;
 const snapshot=await getDocs(collection(db,'lessons'));
 docs=snapshot.docs.map(d=>({id:d.id,...d.data(),words:wordsFromFirestore(d.data().words)}));
 const meta=await getDoc(doc(db,'site_meta','public'));
 cloudEnabled=meta.data()?.cloudEnabled===true;renderList();
}
function download(filename,body,mime='application/json'){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([body],{type:mime}));a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}
async function login(e){e.preventDefault();$('loginMsg').textContent='جاري التحقق من الحساب...';$('loginButton').disabled=true;try{const {signInWithEmailAndPassword,signOut}=firebase.au;const result=await signInWithEmailAndPassword(auth,$('email').value,$('password').value);const {doc,getDoc}=firebase.fs;
// Important: only the real manager can read this private marker by Firestore rules,
// even if it doesn't exist as a document yet.
try{await getDoc(doc(db,'site_meta','private-admin-check'))}catch(err){await signOut(auth);throw new Error('لا توجد صلاحية مدير لهذا الحساب. تأكد من UID في قواعد Firestore المنشورة.')}
user=result.user;$('login').classList.add('hidden');$('dashboard').classList.remove('hidden');$('signout').classList.remove('hidden');await refresh();fillForm(null);status('تم تسجيل الدخول بصلاحيات المدير.','ok');
}catch(err){$('loginMsg').innerHTML=`<div class="error">${esc(err.message||err.code||'فشل تسجيل الدخول')}</div>`}finally{$('loginButton').disabled=false}}
function handleError(e){status('تعذّر تنفيذ العملية: '+[e?.code,e?.message].filter(Boolean).join(' — '),'error')}
async function save(e){e.preventDefault();const data=formRead(),oldId=selected,newId=key(gradeOf(data),data.unitId,data.lessonId);if(!data.title||data.words.length<2){status('أدخل عنواناً وكلمتين على الأقل لكل درس.','error');return}if(data.unitId<1||data.unitId>8||!Number.isInteger(data.lessonId)||data.lessonId<1||data.lessonId>100){status('رقم الوحدة أو الدرس غير صحيح.','error');return}if(newId!==oldId&&docs.some(d=>d.id===newId)){status('يوجد درس بنفس رقم الوحدة ورقم الدرس.','error');return}
$('save').disabled=true;try{const {writeBatch,doc,serverTimestamp}=firebase.fs,batch=writeBatch(db);batch.set(doc(db,'lessons',newId),{...data,words:wordsToFirestore(data.words),updatedAt:serverTimestamp()});if(oldId&&oldId!==newId)batch.delete(doc(db,'lessons',oldId));await batch.commit();await refresh();fillForm(docs.find(d=>d.id===newId));status('حُفظ الدرس بنجاح في Firestore.','ok')}catch(e){handleError(e)}finally{$('save').disabled=false}}
async function remove(){if(!selected||!confirm('هل تريد حذف هذا الدرس نهائياً من قاعدة البيانات؟'))return;try{const {deleteDoc,doc}=firebase.fs;await deleteDoc(doc(db,'lessons',selected));await refresh();fillForm(null);status('تم حذف الدرس.','ok')}catch(e){handleError(e)}}
async function seed(){if(!confirm('استيراد الدروس التجريبية إلى Firestore؟ لن يتم استبدال أي درس موجود بالفعل.'))return;try{const {writeBatch,doc,serverTimestamp}=firebase.fs;const batch=writeBatch(db);let count=0;const exists=new Set(docs.map(d=>d.id));for(const [u,list] of Object.entries(SEED)) for(const l of list){const id=key(1,Number(u),l.id);if(exists.has(id))continue;batch.set(doc(db,'lessons',id),{unitId:Number(u),lessonId:l.id,title:l.title,ar:l.ar,icon:l.icon,words:wordsToFirestore(l.words),sentences:l.sentences,published:true,updatedAt:serverTimestamp()});count++}
if(count)await batch.commit();await refresh();status(`اكتمل استيراد ${count} درس جديد. الدروس الموجودة لم تتغير. اضغط تفعيل النشر السحابي عندما تراجعها.`)}catch(e){handleError(e)}}
async function seed2(){
 if(!confirm('إضافة 32 درساً تدريبياً للصف الثاني حسب خريطة الكتاب؟ لن نغيّر أي درس موجود.'))return;
 try{
  const {writeBatch,doc,serverTimestamp}=firebase.fs,batch=writeBatch(db);
  const exists=new Set(docs.map(d=>d.id));let count=0;
  for(const [u,list] of Object.entries(SEED2))for(const l of list){
    const id=key(2,Number(u),l.id);if(exists.has(id))continue;
    batch.set(doc(db,'lessons',id),{grade:2,unitId:Number(u),lessonId:l.id,title:l.title,ar:l.ar,icon:l.icon,words:wordsToFirestore(l.words),sentences:l.sentences,published:true,updatedAt:serverTimestamp()});count++;
  }
  if(count)await batch.commit();await refresh();
  status(`تم استيراد ${count} درس للصف الثاني. راجع الوحدات قبل مشاركة الموقع.`);
 }catch(e){handleError(e)}
}
async function seed3(){
 if(!confirm('إضافة 32 درساً تدريبياً للصف الثالث بحسب خريطة الكتاب؟ لن نستبدل أي درس موجود.'))return;
 try{
  const {writeBatch,doc,serverTimestamp}=firebase.fs,batch=writeBatch(db);
  const exists=new Set(docs.map(d=>d.id));let count=0;
  for(const [u,list] of Object.entries(SEED3))for(const l of list){
    const id=key(3,Number(u),l.id);if(exists.has(id))continue;
    batch.set(doc(db,'lessons',id),{grade:3,unitId:Number(u),lessonId:l.id,title:l.title,ar:l.ar,icon:l.icon,words:wordsToFirestore(l.words),sentences:l.sentences,published:true,updatedAt:serverTimestamp()});count++;
  }
  if(count)await batch.commit();await refresh();
  status(`تم استيراد ${count} درس للصف الثالث. راجع الوحدات والمحتوى قبل نشرها.`);
 }catch(e){handleError(e)}
}
async function seed4(){
 if(!confirm('إضافة 32 درساً تدريبياً للصف الرابع اعتماداً على خريطة الكتاب؟ الدروس الموجودة لن تتغير.'))return;
 try{
   const {writeBatch,doc,serverTimestamp}=firebase.fs,batch=writeBatch(db);
   const exists=new Set(docs.map(d=>d.id));let count=0;
   for(const [u,list] of Object.entries(SEED4))for(const l of list){
      const id=key(4,Number(u),l.id);if(exists.has(id))continue;
      batch.set(doc(db,'lessons',id),{grade:4,unitId:Number(u),lessonId:l.id,title:l.title,ar:l.ar,icon:l.icon,words:wordsToFirestore(l.words),sentences:l.sentences,published:true,updatedAt:serverTimestamp()});count++;
   }
   if(count)await batch.commit();await refresh();
   status(`تم استيراد ${count} درساً للصف الرابع دون استبدال الدروس الموجودة. راجعها قبل النشر.`);
 }catch(e){handleError(e)}
}
async function seedUpper(grade, lessonMap) {
 if(!confirm(`استيراد 32 درساً تدريبياً للصف ${grade===5?'الخامس':'السادس'}؟ لن نغيّر أي درس موجود.`))return;
 try {
   const {writeBatch,doc,serverTimestamp}=firebase.fs, exists=new Set(docs.map(d=>d.id));
   const batch=writeBatch(db); let count=0;
   for (const [u,list] of Object.entries(lessonMap)) for(const l of list){
     const id=key(grade,Number(u),l.id); if(exists.has(id))continue;
     batch.set(doc(db,'lessons',id),{grade,unitId:Number(u),lessonId:l.id,title:l.title,ar:l.ar,
       icon:l.icon,words:wordsToFirestore(l.words),sentences:l.sentences,published:true,updatedAt:serverTimestamp()});count++;
   }
   if(count)await batch.commit();
   await refresh();
   status(`تم استيراد ${count} درساً جديداً للصف ${grade===5?'الخامس':'السادس'} دون استبدال أي درس موجود.`);
 }catch(e){handleError(e)}
}
async function activate(){if(!docs.some(d=>d.published)){status('استورد أو أضف درساً منشوراً قبل تفعيل النشر السحابي.','error');return}if(!confirm('بعد التفعيل سيعتمد موقع الطلاب على دروس Firestore المنشورة بدلاً من الدروس المحلية. هل تؤكد؟'))return;try{const {setDoc,doc,serverTimestamp}=firebase.fs;await setDoc(doc(db,'site_meta','public'),{cloudEnabled:true,updatedAt:serverTimestamp()});cloudEnabled=true;renderList();status('تم تفعيل المحتوى السحابي. راجع رابط الموقع المنشور بعد رفع الملفات الجديدة.')}catch(e){handleError(e)}}
async function boot(){if(!configured){$('setup').classList.remove('hidden');return}try{const base='https://www.gstatic.com/firebasejs/11.10.0/';const [{initializeApp},{getAuth,signInWithEmailAndPassword,signOut},{getFirestore,doc,getDoc,getDocs,collection,writeBatch,serverTimestamp,deleteDoc,setDoc}]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);const app=initializeApp(cfg);auth=getAuth(app);db=getFirestore(app);firebase={au:{signInWithEmailAndPassword,signOut},fs:{getFirestore,doc,getDoc,getDocs,collection,writeBatch,serverTimestamp,deleteDoc,setDoc}};$('login').classList.remove('hidden');}catch(e){$('setup').classList.remove('hidden');$('setup').insertAdjacentHTML('beforeend','<div class="error">تعذّر تحميل Firebase. تأكد من الإنترنت وإعدادات التطبيق.</div>')}}
$('loginForm').addEventListener('submit',login);$('lessonForm').addEventListener('submit',save);$('delete').addEventListener('click',remove);$('seed').addEventListener('click',seed);$('seed2').addEventListener('click',seed2);$('seed3').addEventListener('click',seed3);$('seed4').addEventListener('click',seed4);$('seed5').addEventListener('click',()=>seedUpper(5,SEED5));$('seed6').addEventListener('click',()=>seedUpper(6,SEED6));$('activate').addEventListener('click',activate);$('reset').addEventListener('click',()=>fillForm(null));$('new').addEventListener('click',()=>fillForm(null));$('filter').addEventListener('change',renderList);$('gradeFilter').addEventListener('change',()=>{syncUnitMenus();renderList()});$('gradeId').addEventListener('change',()=>{syncUnitMenus();if(!selected)$('lessonId').value=nextLesson(Number($('unitId').value),Number($('gradeId').value))});$('search').addEventListener('input',renderList);$('unitId').addEventListener('change',()=>{if(!selected)$('lessonId').value=nextLesson(Number($('unitId').value),Number($('gradeId').value))});$('items').addEventListener('click',e=>{const item=e.target.closest('[data-id]');if(item){const d=docs.find(x=>x.id===item.dataset.id);if(d)fillForm(d)}});$('signout').addEventListener('click',async()=>{await firebase.au.signOut(auth);user=null;location.reload()});$('backup').addEventListener('click',()=>download('english-adventure-lessons-backup.json',JSON.stringify(docs,null,2)));boot();
