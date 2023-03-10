import { type NextPage } from "next";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import fsPromises from "fs/promises";
import path from "path";
import { useRouter } from "next/router";

import { api } from "@/utils/api";

const FormValuesSchema = z.object({
  items: z.array(z.object({ answerContent: z.string() })),
});

const QuestionDataSchema = z.object({
  questions: z.array(
    z.object({
      no: z.number(),
      content: z.string(),
      image: z.string(),
    })
  ),
});

type FormValues = z.infer<typeof FormValuesSchema>;
type QuestionData = z.infer<typeof QuestionDataSchema>;

const Form = (props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: {
      items: [{ answerContent: "" }],
    },
  });
  const { data: session } = useSession();
  const utils = api.useContext();
  const postAnswer = api.answer.postAnswer.useMutation({
    onSettled: () => {
      utils.answer.getAll.invalidate();
      router.push("/");
    },
  });
  const questions = props.questions;

  const router = useRouter();
  const [step, setStep] = useState(1);

  const goToStep = (step: number, asPath: string) => {
    router.push(`/answer/?step=${step}`, asPath);
    setStep(step);
  };

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
      <div className="flex text-[#181624]">
        <div>{`${questions[step - 1].no}. `}</div>
        <div>
          {questions[step - 1].content.split("\n").map((t, idx) => (
            <div key={idx}>{t}</div>
          ))}
        </div>
      </div>
      <Image
        src={questions[step - 1].image}
        alt="clickable image"
        width={200}
        height={300}
      />
      <>
        <input
          key={step - 1}
          type="text"
          placeholder="Your answerContent..."
          {...register(`items.${step - 1}.answerContent`)}
          className="rounded-md border-2 border-zinc-800 bg-neutral-900 px-4 py-2 focus:outline-none"
        />
        <ErrorMessage
          errors={errors}
          name={`items.${step - 1}.answerContent`}
        />
      </>

      <div className="flex">
        {step >= 2 && (
          <button
            className="rounded-md border-2 border-zinc-800 p-2 focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              goToStep(step - 1, "/answer/personal_info");
            }}
          >
            ??????
          </button>
        )}
        {step === 3 ? (
          <button
            className="rounded-md border-2 border-zinc-800 p-2 focus:outline-none"
            type="submit"
            disabled={postAnswer.isLoading}
          >
            ??????
          </button>
        ) : (
          <button
            className="rounded-md border-2 border-zinc-800 p-2 focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              goToStep(step + 1, "/answer/personal_info2");
            }}
          >
            ??????
          </button>
        )}
      </div>
    </form>
  );
};

const Home: NextPage = (props) => {
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
          {session && (
            <>
              <p>hi {session.user?.name}</p>

              <div className="pt-6">
                <Form questions={props.questions} />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;

// Fetching data from the JSON file
export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "data.json");
  const jsonData = await fsPromises.readFile(filePath);
  const objectData: QuestionData = JSON.parse(jsonData.toString());

  return {
    props: objectData,
  };
}
