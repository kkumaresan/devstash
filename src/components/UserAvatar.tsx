"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string;
  size?: "default" | "sm" | "lg";
}

export default function UserAvatar({
  name,
  image,
  className,
  size = "default",
}: UserAvatarProps) {
  const displayName = name || "User";

  return (
    <Avatar className={className} size={size}>
      {image && <AvatarImage src={image} alt={displayName} />}
      <AvatarFallback className="text-xs">{getInitials(displayName)}</AvatarFallback>
    </Avatar>
  );
}
