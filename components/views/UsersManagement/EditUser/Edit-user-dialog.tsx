"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Controller } from "react-hook-form";
import useEditUser from "./useEditUser";
import { ProfileData } from "@/types/user";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

const EditUserDialog = ({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ProfileData | null;
}) => {
  const {
    control,
    handleSubmit,
    handleEditUser,
    isPendingEditUser,
    isSuccessEditUser,
  } = useEditUser({ user });

  useEffect(() => {
    if(isSuccessEditUser) {
      onOpenChange(false);
    }
  }, [isSuccessEditUser, onOpenChange]);
  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm md:max-w-lg">
        <form
          onSubmit={handleSubmit(handleEditUser)}
        >
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>
              Perbarui informasi pengguna di sini. Klik simpan setelah selesai.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4 no-scrollbar max-h-[50vh] overflow-y-auto px-1">
            {/* Name */}
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
                      className="rounded-lg px-5 bg-background h-11 lg:h-9"
                    />
                  </FieldContent>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Email */}
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>

                  <FieldContent>
                    <Input
                      {...field}
                      id="email"
                      name="email"
                      type="text"
                      placeholder="Masukkan email"
                      className="rounded-lg px-5 bg-background h-11 lg:h-9"
                    />
                  </FieldContent>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Phone */}
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
                    placeholder="081234567890"
                    autoComplete="tel"
                    className="rounded-lg px-5 bg-background h-11 lg:h-9"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button
              type="submit"
              className="p-4 cursor-pointer w-full md:w-40"
              disabled={isPendingEditUser}
            >
              {isPendingEditUser ? <Spinner /> : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
