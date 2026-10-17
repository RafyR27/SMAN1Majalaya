"use client";

import { Button } from "@/components/ui/button";
import { Check, Dot, Eye, EyeOff, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import useAddUser from "./useAddUser";
import { Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

const AddUserDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    handleVisiblePassword,
    isVisiblePassword,
    control,
    handleSubmit,
    handleAddUser,
    isPendingAddUser,
    isSuccessAddUser,
  } = useAddUser();

  useEffect(() => {
    if (isSuccessAddUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(false);
    }
  }, [isSuccessAddUser]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            size={"lg"}
            className="max-w-50 flex gap-3 p-4 cursor-pointer rounded-lg"
          >
            <UserPlus />
            Tambah Pengguna
          </Button>
        }
      />
      <DialogContent className="max-w-sm md:max-w-lg">
        <form onSubmit={handleSubmit(handleAddUser)}>
          <DialogHeader>
            <DialogTitle>Tambah Pengguna</DialogTitle>
            <DialogDescription>
              Tambahkan data pengguna baru. Klik Simpan setelah semua data
              selesai diisi.
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

            {/* Password */}
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
                    <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
                    <FieldContent>
                      <InputGroup className="rounded-lg bg-background h-11 lg:h-9">
                        <InputGroupInput
                          {...field}
                          id="password"
                          name="password"
                          type={isVisiblePassword ? "text" : "password"}
                          placeholder="Masukkan kata sandi"
                          className="px-5 "
                        />
                        <InputGroupAddon align="inline-end">
                          <button
                            type="button"
                            onClick={handleVisiblePassword}
                            className="px-1 cursor-pointer"
                          >
                            {isVisiblePassword ? (
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
                          className={cn(
                            "flex items-center gap-2 text-[0.8rem]",
                            rule.valid
                              ? "text-green-500"
                              : "text-muted-foreground",
                          )}
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
          </FieldGroup>

          <DialogFooter className=" mt-2">
            <Button
              type="submit"
              className="p-4 cursor-pointer w-full md:w-30"
              disabled={isPendingAddUser}
            >
              {isPendingAddUser ? <Spinner /> : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
