import type { User } from "~/types";
import { avatarSrc } from "~/utils/avatars";

type AvatarProps = {
  user: Pick<User, "name" | "lastname" | "avatar">;
  size?: "sm" | "md" | "lg";
};

const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-20 w-20 text-2xl" };

export default function Avatar({ user, size = "md" }: AvatarProps) {
  const src = avatarSrc(user.avatar);
  const initials = `${user.name[0] ?? ""}${user.lastname[0] ?? ""}`.toUpperCase();

  if (src) {
    return <img src={src} alt={`${user.name} ${user.lastname}`} className={`${sizes[size]} rounded-full object-cover`} />;
  }
  return (
    <span
      aria-label={`${user.name} ${user.lastname}`}
      className={`${sizes[size]} inline-flex shrink-0 items-center justify-center rounded-full bg-brand-green font-bold text-white`}
    >
      {initials}
    </span>
  );
}
