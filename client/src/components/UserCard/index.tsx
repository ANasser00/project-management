import { User } from "@/state/api";
import Image from "next/image";
import React from "react";

type Props = {
  user: User;
};

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

const UserCard = ({ user }: Props) => {
  return (
    <div className="flex items-center rounded border p-4 shadow">
      <Image
        src={
          user.profilePictureUrl
            ? `${API}/uploads/${user.profilePictureUrl}`
            : `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(
                user.username || "User",
              )}&backgroundColor=1f2937&fontSize=38`
        }
        alt="profile picture"
        width={32}
        height={32}
        className="rounded-full"
      />
      <div className="ml-3">
        <h3>{user.username}</h3>
        <p>{user.email}</p>
      </div>
    </div>
  );
};

export default UserCard;
