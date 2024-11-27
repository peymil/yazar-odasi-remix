import { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { prisma } from "~/.server/prisma";
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useOutlet,
} from "@remix-run/react";
import Modal from "react-modal";
import { WriterProfileItem } from "~/routes/user.$userId.profile/WriterProfileItem";
import { WriterProfileStoryCard } from "~/routes/user.$userId.profile/WriterProfileStoryCard";
import { Button } from "~/components/ui/button";
import { getProject } from "./service.server";
import { getUserWithRequest } from "~/.server/auth";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  invariant(params.userId, "userId is required");
  const { userId } = params;

  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: Number(userId),
    },
  });
  const profile = await prisma.user_profile.findFirstOrThrow({
    where: {
      user_id: Number(userId),
    },
  });

  const projects = await getProject(profile.id);

  const experiences = await prisma.user_profile_experience.findMany({
    where: {
      profile_id: profile.id,
    },
  });
  const requestUser = await getUserWithRequest(request);
  console.log(requestUser);
  const isUsersProfile = Number(requestUser?.id) === Number(userId);

  return {
    user,
    profile,
    projects,
    experiences,
    isUsersProfile,
  };
}

export default function Layout() {
  const { user, profile, projects, experiences, isUsersProfile } =
    useLoaderData<typeof loader>();
  const inOutlet = !!useOutlet();
  const navigate = useNavigate();

  return (
    <div>
      <div className={""}>
        <img
          src={
            profile.background_image ||
            "https://cdn.yazarodasi.com/profile-background-placeholder.png"
          }
          alt={"Background"}
          width={1920}
          height={400}
          className={"w-full h-48 object-cover"}
        />
      </div>

      <div className={"container mx-auto"}>
        <div className={"xl:mx-96"}>
          <div className={""}>
            <img
              src={
                user.image ||
                "https://cdn.yazarodasi.com/profile-photo-placeholder.webp"
              }
              alt={"Avatar"}
              width={150}
              height={150}
              className={"rounded-full -translate-y-1/2"}
            />
          </div>
          <div className={"flex flex-row"}>
            <div className={"flex flex-col min-w-full"}>
              <p className={"text-5xl font-bold mb-10"}>{user.name}</p>
              {isUsersProfile && (
                <Button className={"w-20 h-8 m mb-2"}>Düzenle</Button>
              )}
              <div className={"min-w-full p-5 bg-[#F9F9FA]"}>
                <p className={"text-2xl inline mb-5 "}>{profile.about}</p>
              </div>
            </div>
          </div>
          <div className={"flex flex-row text-sm"}>
            <p className={"text-3xl mb-3 font-bold "}>Projelerim</p>
            {isUsersProfile && (
              <Button
                onClick={() => navigate("/project")}
                className={"w-20 h-8 ml-5"}
              >
                Proje ekle
              </Button>
            )}
          </div>
          <div className={"mb-5 grid grid-cols-3 gap-4"}>
            {projects.map((experience, index) => (
              <WriterProfileStoryCard
                {...experience}
                className={"h-72"}
                key={index}
              />
            ))}
          </div>
          <div className={"flex flex-row text-sm"}>
            <p className={"text-3xl mb-3 font-bold"}>İşler</p>
            {isUsersProfile && (
              <Button
                onClick={() => {
                  navigate("/experience");
                }}
                className={"w-20 h-8 ml-5"}
              >
                İş ekle
              </Button>
            )}
          </div>
          <div className={"flex flex-col gap-8 mb-36"}>
            {experiences.map((experience, index) => (
              <WriterProfileItem {...experience} key={index} />
            ))}
          </div>
        </div>
      </div>
      <Modal isOpen={inOutlet}>
        <Outlet />
      </Modal>
    </div>
  );
}
