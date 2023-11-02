import { nextAuthConfig } from "@/auth";
import { UserIcon } from "@heroicons/react/20/solid";
import getServerSession from 'next-auth';

export default async function CurrentUser() {
  const session = getServerSession(nextAuthConfig);
  const auth = await session.auth();
  const name = auth?.user?.name;
  return (
    <div className="relative flex justify-between rounded-lg p-2 bg-blue-600 text-white">
      <UserIcon className="pointer-events-none absolute left-2 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white" />
      <span className="block ml-6">{name}</span>
    </div>
  );
}