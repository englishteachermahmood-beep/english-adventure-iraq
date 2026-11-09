/* English Adventure Iraq - truthful live and cumulative visitor counters.
   Live: distinct authenticated Firebase UIDs with at least one open RTDB session.
   Total: distinct persistent Firebase Auth UIDs with a Firestore siteVisitors document.
   No passwords, emails, IP addresses, or names are stored by this module.
*/
const firebaseConfig = window.EAI_FIREBASE_CONFIG || {};
const statsNodes = {
  online: [...document.querySelectorAll('[data-eai-visitors-online]')],
  total: [...document.querySelectorAll('[data-eai-visitors-total]')],
  status: [...document.querySelectorAll('[data-eai-visitors-status]')]
};
const isPublicPage = document.body?.dataset?.eaiPage !== 'admin';
const currentSession = (() => {
  // One session per tab; each tab has its own onDisconnect() cleanup.
  const chars = 'abcdef0123456789';
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return [...bytes].map(x => chars[x & 15]).join('');
})();
const show = (type, value) => {
  for (const node of statsNodes[type] || []) node.textContent = String(value);
};
const setStatus = text => {
  for (const node of statsNodes.status) node.textContent = text;
};
const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
const databaseURL = String(firebaseConfig.databaseURL || '').trim();
const hasRtdbConfig = /^https:\/\/[^\s/]+(?:firebasedatabase\.app|firebaseio\.com)\/?$/i.test(databaseURL);
let refreshTotal = null;

if (!hasFirebaseConfig) {
  setStatus('عداد الزوار يحتاج إعدادات Firebase.');
} else {
  try {
    const base = 'https://www.gstatic.com/firebasejs/11.10.0/';
    const [appSdk, authSdk, fsSdk, dbSdk] = await Promise.all([
      import(base + 'firebase-app.js'),
      import(base + 'firebase-auth.js'),
      import(base + 'firebase-firestore.js'),
      hasRtdbConfig ? import(base + 'firebase-database.js') : Promise.resolve(null)
    ]);
    const app = appSdk.initializeApp(firebaseConfig);
    const auth = authSdk.getAuth(app);
    const fs = fsSdk.getFirestore(app);
    const visitorsCollection = fsSdk.collection(fs, 'siteVisitors');

    // Server-side COUNT aggregation: don't download all visitor documents.
    refreshTotal = async () => {
      try {
        const snapshot = await fsSdk.getCountFromServer(visitorsCollection);
        show('total', Number(snapshot.data()?.count || 0).toLocaleString('en-US'));
      } catch (error) {
        show('total', '—');
        console.warn('EAI visitor total unavailable:', error.code || error.message);
        setStatus('لا يمكن قراءة الإجمالي. تحقق من قواعد Firestore.');
      }
    };
    await refreshTotal();
    // Totals are updated on each visit and periodically, not on every click.
    setInterval(refreshTotal, 600_000);

    if (dbSdk) {
      const realtime = dbSdk.getDatabase(app, databaseURL);
      // Count Firebase identities, not tabs: one user with 3 tabs is 1 visitor.
      dbSdk.onValue(dbSdk.ref(realtime, 'sitePresence'), snap => {
        let online = 0;
        snap.forEach(userSnap => {
          if (userSnap.hasChildren()) online++;
        });
        show('online', online.toLocaleString('en-US'));
      }, error => {
        show('online', '—');
        setStatus('الزوار الحاليون غير متاحين. تحقق من قواعد Realtime Database.');
        console.warn('EAI live visitors unavailable:', error.code || error.message);
      });

      if (isPublicPage) {
        let lastUid = null;
        let stopConnectionListener = null;
        const registerVisit = async user => {
          if (!user || user.uid === lastUid) return;
          lastUid = user.uid;
          // Each Firebase identity is registered only once: first visit wins.
          const visitorDoc = fsSdk.doc(fs, 'siteVisitors', user.uid);
          try {
            const existing = await fsSdk.getDoc(visitorDoc);
            if (!existing.exists()) {
              try {
                await fsSdk.setDoc(visitorDoc, { firstSeen: fsSdk.serverTimestamp() });
              } catch (error) {
                // A second tab may have created the same document concurrently.
                const after = await fsSdk.getDoc(visitorDoc).catch(() => null);
                if (!after?.exists()) throw error;
              }
            }
            await refreshTotal();
          } catch (error) {
            setStatus('تعذّر احتساب زيارة جديدة. تحقق من تسجيل الزائر وقواعد Firestore.');
            console.warn('EAI visitor registration failed:', error.code || error.message);
          }

          if (stopConnectionListener) stopConnectionListener();
          const pagePresence = dbSdk.ref(realtime, `sitePresence/${user.uid}/${currentSession}`);
          stopConnectionListener = dbSdk.onValue(dbSdk.ref(realtime, '.info/connected'), async snapshot => {
            if (snapshot.val() !== true) return;
            try {
              // MUST be registered before set() to avoid stale online entries.
              await dbSdk.onDisconnect(pagePresence).remove();
              await dbSdk.set(pagePresence, true);
              setStatus('العداد متصل. إجمالي الزوار محسوب لكل هوية متصفح.');
            } catch (error) {
              setStatus('تعذر تسجيل الاتصال الحالي. تحقق من قواعد Realtime Database.');
              console.warn('EAI presence registration failed:', error.code || error.message);
            }
          });
          window.addEventListener('pagehide', () => {
            // Best-effort quick cleanup; onDisconnect remains the reliable fallback.
            dbSdk.remove(pagePresence).catch(() => {});
          }, { once: true });
        };
        authSdk.onAuthStateChanged(auth, user => {
          if (user) {
            registerVisit(user);
          } else {
            authSdk.signInAnonymously(auth).catch(error => {
              show('online', '—');
              setStatus('يلزم تفعيل Anonymous في Authentication لاحتساب الزوار.');
              console.warn('EAI anonymous auth unavailable:', error.code || error.message);
            });
          }
        });
      } else {
        setStatus('العدد الحالي يُحدّث فور اتصال الزوار أو خروجهم.');
      }
    } else {
      show('online', '—');
      setStatus('فعّل Realtime Database وأضف databaseURL إلى firebase-config.js.');
    }
  } catch (error) {
    console.warn('EAI visitor counters unavailable:', error);
    setStatus('لم يتم الاتصال بعدادات الزوار.');
  }
}
