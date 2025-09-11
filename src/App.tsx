import { useAuth } from "./contexts/AuthContext";
import { supabase } from "./lib/supabase";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Checking authentication...</p>;

  return (
    <div>
      {user ? (
        <>
          <h1>Welcome {user.email}</h1>
          <button onClick={() => supabase.auth.signOut()}>Logout</button>
        </>
      ) : (
        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
        >
          Login with Google
        </button>
      )}
    </div>
  );
}

export default App;
