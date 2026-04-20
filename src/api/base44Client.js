import { db, auth as firebaseAuth, functions as firebaseFunctions } from './firebase';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, where, onSnapshot, getDoc, Timestamp,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';

// Collections shared across all users (no user_id scoping)
const SHARED_COLLECTIONS = new Set(['CommunityMessage', 'ReportCollaborator', 'ReportComment']);

const fromTimestamp = (val) => {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  return val;
};

const docToData = (d) => {
  const raw = d.data();
  const result = { id: d.id };
  for (const [k, v] of Object.entries(raw)) {
    result[k] = fromTimestamp(v);
  }
  return result;
};

const sortDocs = (docs, sortField) => {
  if (!sortField) return docs;
  const desc = sortField.startsWith('-');
  const field = desc ? sortField.slice(1) : sortField;
  return [...docs].sort((a, b) => {
    const av = a[field] ?? '';
    const bv = b[field] ?? '';
    if (av < bv) return desc ? 1 : -1;
    if (av > bv) return desc ? -1 : 1;
    return 0;
  });
};

const makeEntityClient = (collectionName) => {
  const collRef = collection(db, collectionName);
  const isShared = SHARED_COLLECTIONS.has(collectionName);

  const baseQuery = () => {
    const user = firebaseAuth.currentUser;
    if (!user || isShared) return query(collRef);
    return query(collRef, where('user_id', '==', user.uid));
  };

  return {
    list: async (sortField = '-created_date', lim = 50) => {
      const snapshot = await getDocs(baseQuery());
      let results = snapshot.docs.map(docToData);
      if (sortField) results = sortDocs(results, sortField);
      return lim ? results.slice(0, lim) : results;
    },

    create: async (data) => {
      const user = firebaseAuth.currentUser;
      const now = new Date().toISOString();
      const docData = {
        ...data,
        created_date: now,
        updated_date: now,
        ...(user && !isShared && { user_id: user.uid }),
        ...(user && { created_by: user.email }),
      };
      const ref = await addDoc(collRef, docData);
      return { id: ref.id, ...docData };
    },

    update: async (id, data) => {
      const ref = doc(db, collectionName, id);
      const patch = { ...data, updated_date: new Date().toISOString() };
      await updateDoc(ref, patch);
      const snap = await getDoc(ref);
      return docToData(snap);
    },

    delete: async (id) => {
      await deleteDoc(doc(db, collectionName, id));
    },

    filter: async (conditions = {}, sortField, lim) => {
      const snapshot = await getDocs(baseQuery());
      let results = snapshot.docs.map(docToData);

      for (const [key, value] of Object.entries(conditions)) {
        if (key === 'created_by') continue; // already scoped by user_id
        if (key === 'id') {
          results = results.filter(r => r.id === value);
        } else {
          results = results.filter(r => r[key] === value);
        }
      }

      if (sortField) results = sortDocs(results, sortField);
      if (lim) results = results.slice(0, lim);
      return results;
    },

    // Real-time subscription — fires per-document change events matching Base44's format
    subscribe: (callback) => {
      return onSnapshot(baseQuery(), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = docToData(change.doc);
          const typeMap = { added: 'create', modified: 'update', removed: 'delete' };
          callback({ type: typeMap[change.type], id: data.id, data });
        });
      });
    },
  };
};

// ── Auth ──────────────────────────────────────────────────────────────────────

const getUserProfile = async (firebaseUser) => {
  const ref = doc(db, 'users', firebaseUser.uid);
  try {
    const snap = await getDoc(ref);
    const profile = snap.exists() ? snap.data() : {};
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      full_name: profile.full_name ?? firebaseUser.displayName ?? '',
      ...profile,
    };
  } catch {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      full_name: firebaseUser.displayName ?? '',
    };
  }
};

const authMethods = {
  isAuthenticated: () => Promise.resolve(!!firebaseAuth.currentUser),

  me: async () => {
    const user = firebaseAuth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return getUserProfile(user);
  },

  logout: (redirectUrl) => {
    signOut(firebaseAuth).then(() => {
      window.location.href = redirectUrl ?? '/';
    });
  },

  redirectToLogin: (redirectUrl) => {
    if (redirectUrl) sessionStorage.setItem('auth_redirect', redirectUrl);
    window.location.href = '/login';
  },

  updateMe: async (data) => {
    const user = firebaseAuth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const ref = doc(db, 'users', user.uid);
    await updateDoc(ref, { ...data, updated_date: new Date().toISOString() });
  },
};

// ── Functions ─────────────────────────────────────────────────────────────────

const functionsMethods = {
  invoke: async (name, args = {}) => {
    const fn = httpsCallable(firebaseFunctions, name);
    const result = await fn(args);
    // Firebase callable returns { data: <fn-result> } — matches Base44's res.data pattern
    return result;
  },
};

// ── Export ────────────────────────────────────────────────────────────────────

export const base44 = {
  entities: new Proxy({}, {
    get: (_, collectionName) => makeEntityClient(collectionName),
  }),
  auth: authMethods,
  functions: functionsMethods,
};
