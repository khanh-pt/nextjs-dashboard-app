'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { deleteCookie, setCookie } from '@/app/common/cookie';
import { RegisterState } from '@/app/user/types/auth';

const RegisterFormSchema = z.object({
  username: z.string().min(1, { message: 'Please enter a username.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Please enter a name.' }),
});

const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Please enter a name.' }),
});

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

//   user: {
//     username: 'user',
//     email: 'user@gmail.com',
//     token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwiaWF0IjoxNzYzOTY4MTQ1LCJleHAiOjE3NjM5NzE3NDV9.KWEba7m1h7CY2xwFd7IWqsPYoulbd-wNYpIQR56hugg',
//     refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsImhhc2giOiI5MjlmN2YxODEyZWQ5YmM3ZTkyODU1MDI3M2VkZGM2YTk3YjhiOWU4MjM2NDUyZmZmYjA0Y2M0MGNjNWFiOGE5IiwiaWF0IjoxNzYzOTY4MTQ1LCJleHAiOjE3NjQ1NzI5NDV9.uvwg0L_2V4am2f5G4JuGrohcxnkB4UVhcSnBACmNdck',
//     bio: 'user',
//     image: 'https://picsum.photos/id/1/200/300'
//   }
// }
type LoginRes = {
  user: {
    username: string;
    email: string;
    token: string;
    refreshToken: string;
    bio: string;
    image: string;
  };
};

export async function register(prevState: RegisterState, formData: FormData) {
  const validatedFields = RegisterFormSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    return {
      formData: Object.fromEntries(formData.entries()),
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Register.',
    } as RegisterState;
  }

  const data = validatedFields.data;

  const res = await fetch(`${process.env.NEST_BE_URL}/users`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({ user: data }),
  });

  if (!res.ok) {
    // details: [
    //   {
    //     property: 'username',
    //     code: 'unique',
    //     message: 'Username already exists',
    //   },
    //   {
    //     property: 'email',
    //     code: 'unique',
    //     message: 'Email already exists',
    //   },
    // ];
    let errors = {};
    if (res.status === 422) {
      const resJson = await res.json();
      errors = resJson.details?.reduce((acc: any, curr: any) => {
        if (!acc[curr.property]) {
          acc[curr.property] = [];
        }
        acc[curr.property].push(curr.message);
        return acc;
      }, {} as Record<string, string[]>);
    }
    return {
      formData: Object.fromEntries(formData.entries()),
      errors,
      message: 'Registration failed. Please try again.',
    } as RegisterState;
  }

  redirect('/login');
}

export async function login(prevState: LoginState, formData: FormData) {
  const validatedFields = LoginFormSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    return {
      formData: Object.fromEntries(formData.entries()),
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Login.',
    } as LoginState;
  }

  const data = validatedFields.data;

  const res = await fetch(`${process.env.NEST_BE_URL}/users/login`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({ user: data }),
  });
  if (!res.ok) {
    return {
      formData: Object.fromEntries(formData.entries()),
      errors: {},
      message: 'Invalid email or password. Please try again.',
    } as LoginState;
  }
  const resJson: LoginRes = await res.json();

  await setCookie({
    cookieName: 'accessToken',
    value: resJson.user.token,
  });
  await setCookie({
    cookieName: 'refreshToken',
    value: resJson.user.refreshToken,
  });

  redirect(formData.get('redirectTo')?.toString() || '/');
}

export async function logout() {
  await deleteCookie('accessToken');
  await deleteCookie('refreshToken');

  redirect('/login');
}
