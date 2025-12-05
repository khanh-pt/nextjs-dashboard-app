export type RegisterState = {
  formData: {
    username?: string;
    email?: string;
    password?: string;
  };
  errors: {
    username?: string[];
    email?: string[];
    password?: string[];
  };
  message: string | null;
};

export type LoginState = {
  formData: {
    email?: string;
    password?: string;
  };
  errors: {
    email?: string[];
    password?: string[];
  };
  message: string | null;
};

export type LoginRes = {
  user: {
    username: string;
    email: string;
    token: string;
    refreshToken: string;
    bio: string;
    image: string;
  };
};
