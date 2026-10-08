"use client"

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useLogin } from "./useLogin";
import { Spinner } from "@/components/ui/spinner";
import { Controller } from "react-hook-form";


const LoginSection = () => {
    const {
      isSuccessLogin,
      handleShowPassword,
      showPassword,
      isPendingLogin,
      control,
      handleLogin,
      handleSubmit,
    } = useLogin();

    return (
      <>
        <form
            className="w-full space-y-7 py-5"
            onSubmit={handleSubmit(handleLogin)}
          >
            <Controller
              name="credential"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="credential">Email</FieldLabel>

                  <FieldContent>
                    <Input
                      {...field}
                      id="credential"
                      name="credential"
                      type="text"
                      placeholder="Masukkan email"
                      className="rounded-lg px-5 bg-background h-11 lg:h-9"
                      disabled={isPendingLogin || isSuccessLogin}
                    />
                  </FieldContent>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>

                    <Link
                      href={"/auth/forgot-password"}
                      className="text-primary hover:underline text-[0.8rem]"
                    >
                      Lupa Kata Sandi?
                    </Link>
                  </div>

                  <FieldContent>
                    <InputGroup className="rounded-lg bg-background h-11 lg:h-9">
                      <InputGroupInput
                        {...field}
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan kata sandi"
                        className="px-5 "
                        disabled={isPendingLogin || isSuccessLogin}
                      />
                      <InputGroupAddon align="inline-end">
                        <button
                          type="button"
                          onClick={handleShowPassword}
                          className="px-1"
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
                </Field>
              )}
            />
            <Button
              type="submit"
              className="h-11 lg:h-10 w-full rounded-full"
              disabled={isPendingLogin || isSuccessLogin}
            >
              {isPendingLogin || isSuccessLogin ? (
                <Spinner className="size-4" />
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
      </>
    );
}

export default LoginSection