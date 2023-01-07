import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "../utils/api";

const Single = () => {
  const answerId = useRouter().query.id;
  const { data: session } = useSession();

  const { data: answer, isLoading } = api.answer.getOne.useQuery({
    id: answerId as string,
  });

  const router = useRouter();
  const deleteMessage = api.answer.deleteAnswer.useMutation({
    onSettled: () => {
      router.push("/");
    },
  });
  if (isLoading) return <div>Loading...</div>;

  if (!answer && !isLoading) return <div>Answer not found</div>;
  return (
    <div className="m-3 flex flex-col gap-y-2">
      <p className="text-xl">{answer?.answerContent}</p>
      {session?.user?.email === answer?.user.email && (
        <>
          <button
            className="w-40 border"
            onClick={() => {
              deleteMessage.mutate({
                id: answer?.id as string,
              });
            }}
          >
            Delete
          </button>
          <Link
            href={`${answer?.id}/update`}
            className="w-40 border text-center"
          >
            Update
          </Link>
        </>
      )}
    </div>
  );
};

export default Single;

// export async function getServerSideProps(context) {
//   const answerId = context.query.id;
//   const { data: answer, isLoading } = api.answer.getOne.useQuery({
//     id: answerId as string,
//   });

//   return {
//     props: {
//       answer: answer,
//       isLoading: isLoading,
//     }, // will be passed to the page component as props
//   };
// }
