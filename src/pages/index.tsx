import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main className="flex flex-col items-center pt-4">Loading...</main>;
  }

  return (
    <main className="flex flex-col items-center">
      <h1 className="pt-4 text-3xl">ダッシュボード</h1>
      <p>
        Tutorial for <code>create-t3-app</code>
      </p>

      <div className="pt-10">
        <div>
          {session ? (
            <>
              <p>hi {session.user?.name}</p>

              <button onClick={() => signOut()}>Logout</button>

              <div className="pt-6"></div>
            </>
          ) : (
            <button onClick={() => signIn("discord")}>
              Login with Discord
            </button>
          )}
        </div>
        <div>
          <Link href="/answer">
            <button>回答画面</button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Home;
