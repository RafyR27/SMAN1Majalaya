"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { SessionUser } from "@/types/user";
import { Controller } from "react-hook-form";
import Link from "next/link";
import { useProfile } from "./useProfile";

const ProfileContent = ({ user }: { user?: SessionUser }) => {
  const { control, handleSubmit, isPendingUpdate, handleUpdate, isDirty } =
    useProfile({ user });

  return (
    <Card className="min-w-0">
      <CardContent className="space-y-6 p-4 md:p-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <Avatar className="size-20 rounded-full">
            <AvatarImage
              src={
                user?.image ||
                "https://res.cloudinary.com/dejhqj1te/image/upload/v1787872501/Frame_3_ytpno7.png"
              }
              alt={user?.name || "User"}
            />
            <AvatarFallback className="rounded-full">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "CN"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{user?.name || "User"}</h3>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(handleUpdate)}>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>

                <FieldContent>
                  <Input
                    {...field}
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    className="rounded-lg px-4 bg-background h-10"
                  />
                </FieldContent>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>

            <div className="flex items-center gap-2">
              <Input
                id="email"
                name="email"
                value={user?.email || ""}
                className="rounded-lg px-4 bg-background h-10"
                disabled
              />

              <Link
                href={"/user/profile/edit-email"}
                className={buttonVariants({
                  className: "rounded-lg h-11 lg:h-9 px-4",
                })}
              >
                Edit Email
              </Link>
            </div>
          </Field>

          <Controller
            name="noHP"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="noHP">Nomor Handphone</FieldLabel>

                <Input
                  {...field}
                  id="noHP"
                  name="noHP"
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  autoComplete="tel"
                  className="rounded-lg px-4 bg-background h-10"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="h-10 px-8 rounded-lg cursor-pointer"
              disabled={!isDirty || isPendingUpdate}
            >
              {isPendingUpdate ? (
                <Spinner className="size-4" />
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileContent;
