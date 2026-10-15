import { getSession } from "@/lib/auth-client";
import instance from "@/lib/instance";
import { IEditProfile, SessionUser } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

export const formProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Nama harus memiliki minimal 5 karakter")
    .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh mengandung huruf"),

  noHP: z
    .string()
    .trim()
    .min(1, "Nomor handphone wajib diisi")
    .regex(
      /^08\d{8,12}$/,
      "Nomor handphone harus diawali 08 dan terdiri dari 10–14 digit",
    ),
});

export type FormProfileValues = z.infer<typeof formProfileSchema>;

export const useProfile = ({ user }: { user?: SessionUser }) => {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<FormProfileValues>({
    resolver: zodResolver(formProfileSchema),
    defaultValues: {
      name: user?.name ?? "",
      noHP: user?.noHP ?? "",
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name ?? "",
      noHP: user.noHP ?? "",
    });
  }, [user, reset]);

  const updateProfileService = async (payload: IEditProfile) => {
    const res = await instance.patch("/admin/edit-profile", payload);
    return res.data;
  };

  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useMutation({
    mutationFn: updateProfileService,
    onError() {
      toast.error("Gagal memperbarui profil", {
        position: "top-right",
      });
    },

    onSuccess: async () => {
      toast.success("Profil berhasil diperbarui", {
        position: "top-right",
      });

      // Refresh Better Auth session on client and server
      await getSession();
      router.refresh();
    },
  });

  const handleUpdate = (payload: FormProfileValues) => mutateUpdate(payload);

  return {
    control,
    handleSubmit,
    isPendingUpdate,
    handleUpdate,
    isDirty,
    reset,
  };
};
