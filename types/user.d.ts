interface ILogin {
  credential: string;
  password: string;
}

interface SessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: string;
  noHP: string;
}

type ProfileData = {
  id?: string;
  name: string;
  email: string;
  role: string;
  noHP: string | null;
  image?: string | null;
  createdAt: Date;
};

type IEditProfile = {
  name: string;
  noHP: string;
};

interface ISetPassword {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

export { ILogin, SessionUser, ProfileData, IEditProfile, ISetPassword };
