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

export { ILogin, SessionUser, ProfileData };
