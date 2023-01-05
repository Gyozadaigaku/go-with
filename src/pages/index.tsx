import { type NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";

const AnswerContent = () => {
  const { data: answercontents, isLoading } = api.answer.getAll.useQuery();

  if (isLoading) return <div>Fetching messages...</div>;

  return (
    <div className="flex flex-col gap-4">
      {answercontents?.map((msg, index) => {
        return (
          <div key={index} className="border p-2">
            <Link href={`${msg.id}`}>
              <p>{msg.answerContent}</p>
              <span>- {msg.name}</span>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

const Form = () => {
  const { data: session } = useSession();
  const [answerContent, setAnswerContent] = useState("");
  const utils = api.useContext();
  const postAnswer = api.answer.postAnswer.useMutation({
    onSettled: () => {
      utils.answer.getAll.invalidate();
    },
  });

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();

        if (session !== null) {
          postAnswer.mutate({
            name: session.user?.name as string,
            answerContent,
          });
        }

        setAnswerContent("");
      }}
    >
      <input
        type="text"
        value={answerContent}
        placeholder="Your answerContent..."
        minLength={2}
        maxLength={100}
        onChange={(event) => setAnswerContent(event.target.value)}
        className="rounded-md border-2 border-zinc-800 bg-neutral-900 px-4 py-2 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md border-2 border-zinc-800 p-2 focus:outline-none"
      >
        Submit
      </button>
    </form>
  );
};

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main className="flex flex-col items-center pt-4">Loading...</main>;
  }

  return (
    <main className="flex flex-col items-center">
      <h1 className="pt-4 text-3xl">Guestbook</h1>
      <p>
        Tutorial for <code>create-t3-app</code>
      </p>

      <div className="pt-10">
        <div>
          {session ? (
            <>
              <p>hi {session.user?.name}</p>

              <button onClick={() => signOut()}>Logout</button>

              <div className="pt-6">
                <Form />
              </div>
            </>
          ) : (
            <button onClick={() => signIn("discord")}>
              Login with Discord
            </button>
          )}
          <div className="pt-10">{<AnswerContent />}</div>
        </div>
      </div>
    </main>
  );
};

export default Home;
