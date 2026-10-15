import {
  ArrowLeftRight,
  BookUser,
  FileChartColumnIcon,
  LayoutDashboardIcon,
  Package,
  Settings2Icon,
} from "lucide-react";

const SIDEBAR_CONTENT = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Manajemen Pengguna",
      url: "/users-management",
      icon: <BookUser />,
    },
  ],
  secondary: [
    {
      title: "Data Barang",
      url: "/barang",
      icon: <Package />,
    },
    {
      title: "Barang Masuk & Keluar",
      url: "/barang-masuk-keluar",
      icon: <ArrowLeftRight />,
    },
  ],
  documents: [
    {
      title: "Mutasi",
      url: "/mutasi",
      icon: <FileChartColumnIcon />,
    },
  ],
  tools: [
    {
      title: "Pengaturan",
      url: "/settings",
      icon: <Settings2Icon />,
    },
  ],
};

export { SIDEBAR_CONTENT };
