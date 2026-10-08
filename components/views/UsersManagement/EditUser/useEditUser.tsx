"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ProfileData } from "@/types/user";
import { toast } from "sonner";
import instance from "@/lib/instance";

const formEditSchema = z.object({
  name: z
    .string("Nama wajib diisi")
    .trim()
    .min(5, "Nama harus memiliki minimal 5 karakter")
    .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh mengandung huruf"),

  email: z.email("Email wajib diisi").trim().toLowerCase(),

  noHP: z
    .string()
    .trim()
    .min(1, "Nomor handphone wajib diisi")
    .regex(
      /^08\d{8,12}$/,
      "Nomor handphone harus diawali 08 dan terdiri dari 10–14 digit",
    ),
});

export type IFormEditUser = z.infer<typeof formEditSchema>;

const useEditUser = ({ user }: { user: ProfileData | null }) => {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<z.infer<typeof formEditSchema>>({
    resolver: zodResolver(formEditSchema),
    defaultValues: {
      name: user?.name,
      email: user?.email,
      noHP: user?.noHP ?? "",
    },
  });

  const editUserService = async (payload: IFormEditUser) => {
    await instance.put("/admin/user", {
      id: user?.id,
      ...payload,
    })
  };

  const {
    mutate: mutateEditUser,
    isPending: isPendingEditUser,
    isSuccess: isSuccessEditUser,
  } = useMutation({
    mutationFn: editUserService,
    onError(error) {
      toast.error(error?.message || "Gagal mengubah akun pengguna", {
        position: "top-right",
      });
    },

    onSuccess: () => {
      toast.success("Berhasil mengubah akun pengguna!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      reset({
        name: "",
        email: "",
        noHP: "",
      });
    },
  });

  const handleEditUser = (data: IFormEditUser) => mutateEditUser(data);

  return {
    control,
    handleSubmit,
    handleEditUser,
    isPendingEditUser,
    isSuccessEditUser,
  };
};

export default useEditUser;
