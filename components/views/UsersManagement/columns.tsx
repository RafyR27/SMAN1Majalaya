"use client";

import { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { MoreHorizontal, UserRoundPen, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditUserDialog from "./EditUser/Edit-user-dialog";
import { useState } from "react";
import BannedUserDialog from "./DeleteUser/Delete-user-dialog";
import { ProfileData } from "@/types/user";


export const Columns: LegacyColumnDef<ProfileData, unknown>[] = [
  {
    id: "name",
    header: () => <div>Nama</div>,
    accessorFn: (row) => `${row.name}`,
    filterFn: "includesString",
    cell: ({ row }) => {
      const nama = row.original.name;

      return <p className="font-medium text-foreground">{nama}</p>;
    },
  },
  {
    id: "email",
    header: () => <div>Email</div>,
    accessorFn: (row) => `${row.email}`,
    filterFn: "includesString",
    cell: ({ row }) => {
      const email = row.original.email;

      return <p className="text-muted-foreground">{email}</p>;
    },
  },
  {
    id: "phone",
    accessorFn: (row) => row.noHP ?? "-",
    header: () => <div>No. Handphone</div>,
    cell: ({ row }) => {
      const phone = row.original.noHP;
      if (!phone) return <span className="text-muted-foreground">-</span>;
      const formatted = phone.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
      return <div className="text-muted-foreground">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <UserActions user={row.original} />;
    },
  },
];

// Fallback default columns
export const columns = Columns;

const UserActions = ({ user }: { user: ProfileData }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProfileData | null>(null);

  const handleEdit = () => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleDelete = () => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        />

        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="flex cursor-pointer justify-between"
              onClick={handleEdit}
            >
              Edit
              <UserRoundPen />
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="flex cursor-pointer justify-between"
              variant="destructive"
              onClick={handleDelete}
            >
              Hapus
              <Trash />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedUser && (
        <EditUserDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          user={selectedUser}
        />
      )}

      {selectedUser && (
        <BannedUserDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          user={selectedUser}
        />
      )}
    </>
  );
};
