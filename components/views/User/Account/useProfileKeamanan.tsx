import instance from "@/lib/instance";
import { ISetPassword, SessionUser } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

export const formSetPasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
    password: z
      .string("Kata sandi baru wajib diisi")
      .min(8, "Kata sandi harus memiliki minimal 8 karakter")
      .regex(/[0-9]/, "Kata sandi harus mengandung setidaknya satu angka")
      .regex(/^(?!.*\s).*$/, "Kata sandi tidak boleh mengandung spasi"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export type FormSetPasswordValues = z.infer<typeof formSetPasswordSchema>;

export const useProfileKeamanan = ({ user }: { user?: SessionUser }) => {
  const queryClient = useQueryClient();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<FormSetPasswordValues>({
    resolver: zodResolver(formSetPasswordSchema),
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const setPasswordService = async (payload: ISetPassword) => {
    const response = await instance.post("/auth/change-password", payload);
    return response.data;
  };

  const { mutate: mutateSetPassword, isPending: isPendingSetPassword } =
    useMutation({
      mutationFn: setPasswordService,
      onError(error) {
        toast.error(error.message || "Gagal membuat kata sandi baru", {
          position: "top-right",
        });
      },
      onSuccess: () => {
        toast.success("Password baru berhasil disimpan!", {
          position: "top-right",
        });
        reset();
        queryClient.invalidateQueries({ queryKey: ["user-security"] });
      },
    });

  const handleSetPassword = (
    payload: FormSetPasswordValues,
    options?: { onSuccess?: () => void; onError?: () => void },
  ) => {
    mutateSetPassword(payload, options);
  };

  return {
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
  };
};
