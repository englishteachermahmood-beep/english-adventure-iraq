/* Read-only public content sync, safe on the static GitHub Pages site. */
const cfg = window.EAI_FIREBASE_CONFIG;
const ready = cfg && cfg.apiKey && cfg.projectId && cfg.appId;
if (ready) {
  try {
    const root = 'https://www.gstatic.com/firebasejs/11.10.0/';
    const [{ initializeApp }, { getFirestore, doc, collection, query, where, onSnapshot }] = await Promise.all([
      import(root + 'firebase-app.js'), import(root + 'firebase-firestore.js')
    ]);
    const app = initializeApp(cfg);
    const db = getFirestore(app);
    let subscribed = false;
    // Restore the last public snapshot if cloud mode had already been activated.
    // No privileged or unpublished data are stored here.
    try {
      if (localStorage.getItem('eai_cloud_active_v14') === 'yes') {
        const saved = JSON.parse(localStorage.getItem('eai_public_content_v14') || '[]');
        if (saved.length && window.EAI_PUBLIC) window.EAI_PUBLIC.applyLessons(saved);
      }
    } catch {}
    onSnapshot(doc(db, 'site_meta', 'public'), (snap) => {
      if (!snap.exists() || snap.data()?.cloudEnabled !== true || subscribed) return;
      subscribed = true;
      try { localStorage.setItem('eai_cloud_active_v14','yes'); } catch {}
      // Published field is in the query because Firestore rules are NOT filters.
      const q = query(collection(db,'lessons'),where('published','==',true));
      onSnapshot(q, (set) => {
        // Restore the [word, picture] format expected by the existing lesson games.
        const items=set.docs.map(d=>{
          const data=d.data();
          return {...data,words:(Array.isArray(data.words)?data.words:[]).map(w=>
            Array.isArray(w)?[String(w[0]??''),String(w[1]??'📘')]:
            (w&&typeof w==='object')?[String(w.text??''),String(w.picture??'📘')]:[String(w??''),'📘']
          ).filter(w=>w[0].trim())};
        });
        if (window.EAI_PUBLIC) window.EAI_PUBLIC.applyLessons(items);
        try { localStorage.setItem('eai_public_content_v14',JSON.stringify(items)); } catch {}
      }, (e) => console.warn('Lesson sync:',e.code||e.message));
    }, (e) => console.warn('Site settings:',e.code||e.message));
  } catch (e) { console.warn('Firebase unavailable; displaying local lessons.',e); }
}
