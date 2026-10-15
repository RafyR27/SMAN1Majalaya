import { ReactNode } from "react";
import LeftContent from "./LeftContent/LeftContent";

const UserLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center">
        <div className="flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Pengaturan</h1>
            <p className="text-muted-foreground">
              Kelola pengaturan akun Anda.
            </p>
          </div>

          {/* Content */}
          <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-[240px_1fr]">
            {/* Sidebar */}
            <LeftContent />

            {/* Main Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
