"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserSettings } from "./actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function SettingsForm({
  dbUser,
  email,
}: {
  dbUser: any;
  email: string;
}) {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      await updateUserSettings(formData);

      setShowToast(true);

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Kayıt sırasında hata oluştu:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {}
      {showToast && (
        <div className="fixed top-21 right-6 z-50 transition-all animate-in fade-in slide-in-from-top-5">
          <Button
            variant="success"
            className="rounded-2xl shadow-xl px-6 py-4 cursor-default hover:scale-100"
          >
            <Check className="mr-2 h-5 w-5" />

            <span className="font-medium text-sm">Successfully recorded!</span>
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">User Settings</CardTitle>
          <CardDescription>
            Update your profile details and address information here.
          </CardDescription>
        </CardHeader>

        {}
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {/* EMAIL */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                name="email"
                defaultValue={email}
                disabled
                className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>

            {/* USERNAME */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Username</label>
              <input
                type="text"
                name="username"
                defaultValue={dbUser?.username || ""}
                placeholder="Choose a cool username"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* FIRST NAME */}
              <div className="space-y-1">
                <label className="text-sm font-medium">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  defaultValue={dbUser?.firstName || ""}
                  placeholder="John"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {/* LAST NAME */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  defaultValue={dbUser?.lastName || ""}
                  placeholder="Doe"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Full Address</label>
              <textarea
                name="address"
                defaultValue={dbUser?.address || ""}
                placeholder="Enter your full shipping address..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
