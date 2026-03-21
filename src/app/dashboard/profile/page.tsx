import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserAvatar from "@/components/UserAvatar";
import { getUserProfile, getProfileStats } from "@/lib/db/profile";
import { ICON_MAP } from "@/components/dashboard/icon-map";
import ChangePasswordForm from "./ChangePasswordForm";
import DeleteAccountDialog from "./DeleteAccountDialog";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [profile, stats] = await Promise.all([
    getUserProfile(session.user.id),
    getProfileStats(session.user.id),
  ]);

  if (!profile) redirect("/sign-in");

  const joinedDate = profile.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <UserAvatar
            name={profile.name}
            image={profile.image}
            size="lg"
            className="h-16 w-16 text-lg"
          />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">
              {profile.name || "User"}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {profile.email}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Joined {joinedDate}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-md border border-border p-3 text-center">
              <p className="text-2xl font-bold">{stats.totalItems}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
            <div className="rounded-md border border-border p-3 text-center">
              <p className="text-2xl font-bold">{stats.totalCollections}</p>
              <p className="text-xs text-muted-foreground">Collections</p>
            </div>
          </div>

          {/* Item Type Breakdown */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Items by Type
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stats.itemsByType.map((type) => {
                const Icon = ICON_MAP[type.icon];
                return (
                  <div
                    key={type.name}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
                  >
                    {Icon && (
                      <Icon
                        size={14}
                        style={{ color: type.color }}
                        className="shrink-0"
                      />
                    )}
                    <span className="text-sm capitalize">{type.name}s</span>
                    <span className="ml-auto text-sm font-medium tabular-nums">
                      {type.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password — only for credentials users */}
      {profile.hashedPassword && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </div>
  );
}
