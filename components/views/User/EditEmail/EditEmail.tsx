"use client";

import { SessionUser } from "@/types/user";
import { EditEmailPayload, useEditEmail } from "./useEditEmail";
import { Card, CardContent } from "@/components/ui/card";
import { Controller } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EditEmailSection({ user }: { user?: SessionUser }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<EditEmailPayload | null>(null);

  const {
    control,
    handleSubmit,
    isPendingUpdate,
    handleUpdateEmail,
    isDirty,
    isSameEmail,
  } = useEditEmail({ user });

  const handleOpenDialog = (values: EditEmailPayload) => {
    setPendingValues(values);
    setDialogOpen(true);
  };

  const onConfirmUpdateEmail = () => {
    if (pendingValues) {
      handleUpdateEmail(pendingValues, {
        onSuccess: () => {
          setDialogOpen(false);
          setPendingValues(null);
        },
      });
    }
  };

  return (
    <>
      <Card className="min-w-0">
        <CardContent className="space-y-6 p-4 md:p-6">
          <form className="space-y-5" onSubmit={handleSubmit(handleOpenDialog)}>
            <Controller
              name="newEmail"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="newEmail">Email Baru</FieldLabel>

                  <FieldContent>
                    <Input
                      {...field}
                      id="newEmail"
                      name="newEmail"
                      type="email"
                      placeholder="Masukkan email baru"
                      autoComplete="email"
                      className="rounded-lg px-5 bg-background h-11 lg:h-9"
                    />

                    <FieldDescription className="pt-2">
                      Masukkan alamat email baru yang ingin Anda gunakan.
                    </FieldDescription>
                  </FieldContent>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}

                  {isSameEmail && !fieldState.invalid && (
                    <p className="text-sm text-destructive">
                      Email baru tidak boleh sama dengan email saat ini
                    </p>
                  )}
                </Field>
              )}
            />

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                className="h-10 px-8 rounded-lg cursor-pointer"
                disabled={!isDirty || isSameEmail || isPendingUpdate}
              >
                {isPendingUpdate ? (
                  <Spinner className="size-4" />
                ) : (
                  "Simpan Email Baru"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!isPendingUpdate) setDialogOpen(open);
        }}
        disablePointerDismissal
      >
        <DialogContent className="max-w-sm md:max-w-md">
          <DialogHeader>
            <DialogTitle>Yakin ingin mengganti email Anda?</DialogTitle>
            <DialogDescription>
              Pastikan email baru Anda sudah benar. Perubahan email akan langsung
              diterapkan ke akun Anda.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <DialogClose
              render={
                <Button
                  variant="outline"
                  type="button"
                  className="cursor-pointer"
                  disabled={isPendingUpdate}
                >
                  Batal
                </Button>
              }
            />

            <Button
              type="button"
              onClick={onConfirmUpdateEmail}
              className="cursor-pointer"
              disabled={isPendingUpdate}
            >
              {isPendingUpdate ? (
                <Spinner className="size-4" />
              ) : (
                "Ubah Email"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
