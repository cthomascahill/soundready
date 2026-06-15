import { pb } from './pocketbase';

// PascalCase → snake_case collection names (e.g. SongLibrary → song_library)
const toCollectionName = (name) =>
  name.replace(/([A-Z])/g, (m, l, offset) => (offset === 0 ? l.toLowerCase() : `_${l.toLowerCase()}`));

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
  const col = toCollectionName(collectionName);

  return {
    list: async (sortField = '-created', lim = 200) => {
      try {
        const records = await pb.collection(col).getFullList({ requestKey: null });
        let results = records;
        if (sortField) results = sortDocs(results, sortField);
        if (lim) results = results.slice(0, lim);
        return results;
      } catch {
        return [];
      }
    },

    create: async (data) => {
      return pb.collection(col).create(data);
    },

    update: async (id, data) => {
      return pb.collection(col).update(id, data);
    },

    delete: async (id) => {
      return pb.collection(col).delete(id);
    },

    filter: async (conditions = {}, sortField, lim) => {
      try {
        const records = await pb.collection(col).getFullList({ requestKey: null });
        let results = records;

        for (const [key, value] of Object.entries(conditions)) {
          if (key === 'id') {
            results = results.filter((r) => r.id === value);
          } else {
            results = results.filter((r) => r[key] === value);
          }
        }

        if (sortField) results = sortDocs(results, sortField);
        if (lim) results = results.slice(0, lim);
        return results;
      } catch {
        return [];
      }
    },

    subscribe: (callback) => {
      pb.collection(col).subscribe('*', (e) => {
        const typeMap = { create: 'create', update: 'update', delete: 'delete' };
        callback({ type: typeMap[e.action], id: e.record.id, data: e.record });
      });
      return () => pb.collection(col).unsubscribe('*');
    },
  };
};

const authMethods = {
  isAuthenticated: () => Promise.resolve(true),
  me: async () => ({ id: 'local', email: 'local@soundready.app', full_name: 'Local User' }),
  logout: () => {},
  redirectToLogin: () => {},
  updateMe: async () => {},
};

const functionsMethods = {
  invoke: async () => { throw new Error('Cloud functions not available with PocketBase'); },
};

export const base44 = {
  entities: new Proxy({}, {
    get: (_, collectionName) => makeEntityClient(collectionName),
  }),
  auth: authMethods,
  functions: functionsMethods,
};
