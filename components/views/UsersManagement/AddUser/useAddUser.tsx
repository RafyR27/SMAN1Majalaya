"use client";

import instance from "@/lib/instance";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formAddSchema = z.object({
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

  password: z
    .string("Password wajib diisi")
    .min(8, "Password harus memiliki minimal 8 karakter")
    .regex(/[0-9]/, "Password harus mengandung setidaknya satu angka")
    .regex(/^(?!.*\s).*$/, "Password tidak boleh mengandung spasi"),
});

export type IFormAddUser = z.infer<typeof formAddSchema>;

const useAddUser = () => {
  const [isVisiblePassword, setVisiblePassword] = useState(false);
  const [isVisiblePasswordConfirm, setVisiblePasswordConfirm] = useState(false);

  const queryClient = useQueryClient();

  const handleVisiblePassword = () => {
    setVisiblePassword(!isVisiblePassword);
  };

  const handleVisiblePasswordConfirm = () => {
    setVisiblePasswordConfirm(!isVisiblePasswordConfirm);
  };

  const { control, handleSubmit, reset } = useForm<
    z.infer<typeof formAddSchema>
  >({
    resolver: zodResolver(formAddSchema),
    defaultValues: {
      name: "",
      email: "",
      noHP: "",
      password: "",
    },
  });

  const addUserService = async (payload: IFormAddUser) => {
    await instance.post("/admin/user", {
      ...payload,
      image:
        "https://res.cloudinary.com/dejhqj1te/image/upload/v1787872501/Frame_2_uypphe.png",
    });
  };

  const {
    mutate: mutateAddUser,
    isPending: isPendingAddUser,
    isSuccess: isSuccessAddUser,
  } = useMutation({
    mutationFn: addUserService,
    onError(error) {
      toast.error(error?.message || "Gagal menambahkan akun pengguna", {
        position: "top-right",
      });
    },

    onSuccess: () => {
      toast.success("Berhasil menambahkan akun pengguna!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      reset({
        name: "",
        email: "",
        noHP: "",
        password: "",
      });
    },
  });

  const handleAddUser = (data: IFormAddUser) => mutateAddUser(data);

  return {
    handleVisiblePassword,
    handleVisiblePasswordConfirm,
    isVisiblePassword,
    isVisiblePasswordConfirm,
    control,
    handleSubmit,
    handleAddUser,
    isPendingAddUser,
    isSuccessAddUser,
  };
};

export default useAddUser;
