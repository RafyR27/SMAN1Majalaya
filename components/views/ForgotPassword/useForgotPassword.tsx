import { requestPasswordReset } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formForgotPasswordSchema = z.object({
  email: z.email("Email wajib diisi").trim().toLowerCase(),
});

export const useForgotPassword = () => {
  const { control, handleSubmit } = useForm<
    z.infer<typeof formForgotPasswordSchema>
  >({
    resolver: zodResolver(formForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordService = async (payload: { email: string }) => {
    const { data, error } = await requestPasswordReset({
      email: payload.email,
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  const {
    mutate: mutateForgotPassword,
    isPending: isPendingForgotPassword,
    isSuccess: isSuccessForgotPassword,
  } = useMutation({
    mutationFn: forgotPasswordService,
    onError(error: Error) {
      toast.error(error?.message || "Terjadi kesalahan saat mengirim email", {
        position: "top-right",
      });
    },

    onSuccess: () => {
      toast.success("Instruksi reset password telah dikirim ke email Anda.", {
        position: "top-right",
      });
    },
  });

  const handleForgotPassword = (payload: { email: string }) =>
    mutateForgotPassword(payload);

  return {
    control,
    handleSubmit,
    handleForgotPassword,
    isPendingForgotPassword,
    isSuccessForgotPassword,
  };
};
