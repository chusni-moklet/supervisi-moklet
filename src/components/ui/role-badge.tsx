import { type Role, ROLE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLE_STYLES: Record<Role, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700",
  KEPALA_SEKOLAH: "bg-purple-100 text-purple-700",
  ADMIN: "bg-blue-100 text-blue-700",
};

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export default function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span className={cn("badge", ROLE_STYLES[role], className)}>
      {ROLE_LABELS[role]}
    </span>
  );
}
