import { getSession } from "@/lib/auth-client";
import instance from "@/lib/instance";
import { SessionUser } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formEditEmailSchema = z.object({
  newEmail: z.email("Email baru wajib diisi").trim().toLowerCase(),
});

export type EditEmailPayload = z.infer<typeof formEditEmailSchema>;

export const useEditEmail = ({ user }: { user?: SessionUser }) => {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<EditEmailPayload>({
    resolver: zodResolver(formEditEmailSchema),
    defaultValues: {
      newEmail: "",
    },
  });

  const newEmailValue = useWatch({
    control,
    name: "newEmail",
  });

  const isSameEmail =
    newEmailValue?.trim().toLowerCase() === user?.email?.toLowerCase();

  const updateEmailService = async (payload: EditEmailPayload) => {
    await instance.patch("/admin/edit-email", payload);
  };

  const { mutate: mutateUpdateEmail, isPending: isPendingUpdate } = useMutation(
    {
      mutationFn: updateEmailService,
      onError() {
        toast.error("Gagal memperbarui email", {
          position: "top-right",
        });
      },
      onSuccess: async () => {
        toast.success("Email berhasil diperbarui", {
          position: "top-right",
        });
        await getSession();
        router.refresh();
        router.back();
      },
    },
  );

  const handleUpdateEmail = (
    payload: EditEmailPayload,
    options?: { onSuccess?: () => void },
  ) => mutateUpdateEmail(payload, options);

  return {
    control,
    handleSubmit,
    isPendingUpdate,
    handleUpdateEmail,
    isDirty,
    isSameEmail,
  };
};
