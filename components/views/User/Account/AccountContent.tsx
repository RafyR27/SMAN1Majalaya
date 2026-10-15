"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { SessionUser } from "@/types/user";
import { Check, Dot, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import {
  FormSetPasswordValues,
  useProfileKeamanan,
} from "./useProfileKeamanan";

const AccountContent = ({ user }: { user?: SessionUser }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<FormSetPasswordValues | null>(null);
  const {
    control,
    handleSubmit,
    handleSetPassword,
    isPendingSetPassword,
    isDirty,
    showPassword,
    setShowPassword,
    showOldPassword,
    setShowOldPassword,
    showConfirmPassword,
    setShowConfirmPassword,
  } = useProfileKeamanan({ user });

  const handleOpenDialog = (values: FormSetPasswordValues) => {
    setPendingValues(values);
    setDialogOpen(true);
  };

  const onConfirmChangePassword = () => {
    if (pendingValues) {
      handleSetPassword(pendingValues, {
        onSuccess: () => {
          setDialogOpen(false);
          setPendingValues(null);
        },
      });
    }
  };

  return (
    <>
      <div className="space-y-6 min-w-0">
        <Card className="min-w-0 gap-0">
          <CardHeader className="px-4 md:p-6 md:pb-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                Reset Kata Sandi Akun
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            <form
              onSubmit={handleSubmit(handleOpenDialog)}
              className="space-y-5"
            >
              {/* Password lama */}
              <Controller
                name="oldPassword"
                control={control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="oldPassword">
                        Kata Sandi Saat Ini
                      </FieldLabel>
                      <FieldContent>
                        <InputGroup className="rounded-lg bg-background h-11 lg:h-9">
                          <InputGroupInput
                            {...field}
                            id="oldPassword"
                            name="oldPassword"
                            type={showOldPassword ? "text" : "password"}
                            placeholder="Masukkan kata sandi"
                            className="px-5 "
                          />
                          <InputGroupAddon align="inline-end">
                            <button
                              type="button"
                              onClick={() =>
                                setShowOldPassword(!showOldPassword)
                              }
                              className="px-1 cursor-pointer"
                            >
                              {showOldPassword ? (
                                <EyeOff className="size-5" />
                              ) : (
                                <Eye className="size-5" />
                              )}
                            </button>
                          </InputGroupAddon>
                        </InputGroup>
                      </FieldContent>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              {/* Password Baru */}
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => {
                  const passwordRules = [
                    {
                      valid: field.value.length >= 8,
                      message: "Minimal 8 karakter",
                    },
                    {
                      valid: /[0-9]/.test(field.value),
                      message: "Mengandung minimal 1 angka",
                    },
                    {
                      valid: field.value.length > 0 && !/\s/.test(field.value),
                      message: "Tidak mengandung spasi",
                    },
                  ];

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">
                        Kata Sandi Baru
                      </FieldLabel>
                      <FieldContent>
                        <InputGroup className="rounded-lg bg-background h-11 lg:h-9">
                          <InputGroupInput
                            {...field}
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukkan kata sandi"
                            className="px-5 "
                          />
                          <InputGroupAddon align="inline-end">
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="px-1 cursor-pointer"
                            >
                              {showPassword ? (
                                <EyeOff className="size-5" />
                              ) : (
                                <Eye className="size-5" />
                              )}
                            </button>
                          </InputGroupAddon>
                        </InputGroup>
                      </FieldContent>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}

                      <div className="flex flex-col gap-1 mt-2">
                        {passwordRules.map((rule) => (
                          <span
                            key={rule.message}
                            className={`flex items-center gap-2 text-[0.8rem] ${
                              rule.valid
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            {rule.valid ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Dot className="h-4 w-4" />
                            )}

                            {rule.message}
                          </span>
                        ))}
                      </div>
                    </Field>
                  );
                }}
              />

              {/* Konfirmasi Password */}
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirmPassword">
                      Konfirmasi Kata Sandi Baru
                    </FieldLabel>

                    <FieldContent>
                      <InputGroup className="rounded-lg bg-background h-10">
                        <InputGroupInput
                          {...field}
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Ulangi kata sandi baru"
                          className="px-4"
                          disabled={isPendingSetPassword}
                        />
                        <InputGroupAddon align="inline-end">
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="px-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="size-5" />
                            ) : (
                              <Eye className="size-5" />
                            )}
                          </button>
                        </InputGroupAddon>
                      </InputGroup>
                    </FieldContent>

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
                  disabled={!isDirty || isPendingSetPassword}
                  className="h-10 px-8 rounded-lg cursor-pointer font-medium"
                >
                  {isPendingSetPassword ? (
                    <Spinner className="size-4 mr-2" />
                  ) : (
                    "Simpan Kata Sandi"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!isPendingSetPassword) setDialogOpen(open);
        }}
        disablePointerDismissal
      >
        <DialogContent className="max-w-sm md:max-w-md">
          <DialogHeader>
            <DialogTitle>Yakin ingin merubah kata sandi Anda?</DialogTitle>
            <DialogDescription>
              Perubahan ini tidak bisa di lakukan kembali selama 10 hari ke
              depan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <DialogClose
              render={
                <Button
                  variant="outline"
                  type="button"
                  className="cursor-pointer"
                  disabled={isPendingSetPassword}
                >
                  Batal
                </Button>
              }
            />

            <Button
              type="button"
              onClick={onConfirmChangePassword}
              className="cursor-pointer"
              disabled={isPendingSetPassword}
            >
              {isPendingSetPassword ? (
                <Spinner className="size-4" />
              ) : (
                "Ubah Kata Sandi"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountContent;
