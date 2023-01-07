import { type NextPage } from "next";
import { ErrorMessage } from "@hookform/error-message";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";

const FormValuesSchema = z.object({
  items: z.array(z.object({ answerContent: z.string() })),
});

type FormValues = z.infer<typeof FormValuesSchema>;

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
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: {
      items: [{ answerContent: "" }, { answerContent: "" }],
    },
  });
  const { data: session } = useSession();
  const utils = api.useContext();
  const postAnswer = api.answer.postAnswer.useMutation({
    onSettled: () => {
      utils.answer.getAll.invalidate();
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchFieldArray = watch("items");
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index],
    };
  });

  return (
    <form
      className="flex gap-2"
      onSubmit={handleSubmit((input) => {
        console.log("input value");
        console.log(input);
        if (session !== null) {
          postAnswer.mutate({
            name: session.user?.name as string,
            items: input.items,
          });
        }
      })}
    >
      {controlledFields.map((field, index) => {
        return (
          <>
            <input
              key={index}
              type="text"
              placeholder="Your answerContent..."
              {...register(`items.${index}.answerContent`)}
              className="rounded-md border-2 border-zinc-800 bg-neutral-900 px-4 py-2 focus:outline-none"
            />
            <ErrorMessage
              errors={errors}
              name={`items.${index}.answerContent`}
            />
          </>
        );
      })}
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
