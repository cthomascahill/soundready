export default function FirebaseSetupScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e2e2e2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 24 }}>
          <span style={{ color: '#3dba6f' }}>Sound</span>Ready
        </div>

        <div style={{
          background: '#141414',
          border: '1px solid #2a2a2a',
          borderRadius: 16,
          padding: '32px',
        }}>
          <div style={{
            display: 'inline-block',
            background: '#e3b34118',
            border: '1px solid #e3b34140',
            color: '#e3b341',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: 6,
            marginBottom: 16,
          }}>
            Setup required
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f2f2f2', marginBottom: 8 }}>
            Firebase not configured
          </h1>
          <p style={{ color: '#777', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            The app needs a Firebase project to run. Create a{' '}
            <code style={{ background: '#1e1e1e', color: '#a8d8b0', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>.env.local</code>{' '}
            file in the project root with your Firebase credentials.
          </p>

          <div style={{
            background: '#0f0f0f',
            border: '1px solid #1f1f1f',
            borderRadius: 10,
            padding: '16px 18px',
            fontFamily: '"SF Mono", "Fira Code", monospace',
            fontSize: 12,
            lineHeight: 1.8,
            color: '#888',
            marginBottom: 24,
          }}>
            <div><span style={{ color: '#555' }}># .env.local</span></div>
            <div><span style={{ color: '#79c0ff' }}>VITE_FIREBASE_API_KEY</span>=<span style={{ color: '#a5d6ff' }}>your-api-key</span></div>
            <div><span style={{ color: '#79c0ff' }}>VITE_FIREBASE_AUTH_DOMAIN</span>=<span style={{ color: '#a5d6ff' }}>your-project.firebaseapp.com</span></div>
            <div><span style={{ color: '#79c0ff' }}>VITE_FIREBASE_PROJECT_ID</span>=<span style={{ color: '#a5d6ff' }}>your-project-id</span></div>
            <div><span style={{ color: '#79c0ff' }}>VITE_FIREBASE_STORAGE_BUCKET</span>=<span style={{ color: '#a5d6ff' }}>your-project.appspot.com</span></div>
            <div><span style={{ color: '#79c0ff' }}>VITE_FIREBASE_MESSAGING_SENDER_ID</span>=<span style={{ color: '#a5d6ff' }}>123456789</span></div>
            <div><span style={{ color: '#79c0ff' }}>VITE_FIREBASE_APP_ID</span>=<span style={{ color: '#a5d6ff' }}>1:123:web:abc</span></div>
          </div>

          <p style={{ color: '#555', fontSize: 13, lineHeight: 1.6 }}>
            Get these values from{' '}
            <strong style={{ color: '#777' }}>Firebase Console → Project Settings → Your apps → Web app</strong>.
            Then restart the dev server.
          </p>
        </div>

        <p style={{ color: '#333', fontSize: 12, marginTop: 16, textAlign: 'center' }}>
          See <code style={{ color: '#444' }}>MIGRATION.html</code> for full setup instructions.
        </p>
      </div>
    </div>
  );
}
