"use client"

import environment from "@/config/environment";
import { signIn } from "@/lib/auth-client";
import { ILogin } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formLoginSchema = z.object({
  credential: z.email("Email wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const useLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const callbackURL = `${environment.BETTER_AUTH_URL}/dashboard`;

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const { control, handleSubmit } = useForm<z.infer<typeof formLoginSchema>>({
    resolver: zodResolver(formLoginSchema),
    defaultValues: {
      credential: "",
      password: "",
    },
  });

  const loginService = async (payload: ILogin) => {
    const { data, error } = await signIn.email({
      email: payload.credential,
      password: payload.password,
    });

    if (error) {
      throw new Error(error.message || "Terjadi kesalahan saat masuk");
    }

    return data;
  };


  const { mutate: mutateLogin, isPending: isPendingLogin, isSuccess: isSuccessLogin } = useMutation({
    mutationFn: loginService,
    onError(error: Error) {
      toast.error(error?.message || "Terjadi kesalahan saat masuk", {
        position: "top-right",
      });
    },

    onSuccess: () => {
      router.push(callbackURL);
    },
  });

  const handleLogin = (payload: ILogin) => mutateLogin(payload);

  return {
    isSuccessLogin,
    handleShowPassword,
    showPassword,
    handleLogin,
    control,
    handleSubmit,
    isPendingLogin,
  };
};
