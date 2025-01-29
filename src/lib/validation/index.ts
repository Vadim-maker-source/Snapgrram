import { z } from "zod"

export const SignupValidation = z.object({
  name: z.string().min(2, { message: 'Слишком короткий' }),
  username: z.string().min(2, { message: 'Слишком короткий' }),
  email: z.string().email(),
  password: z.string().min(8, { message: 'Пароль должен содержать как минимум 8 символов.' }),
})

export const SigninValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: 'Пароль должен содержать как минимум 8 символов.' }),
})

export const PostValidation = z.object({
  caption: z.string().min(5).max(2200),
  file: z.custom<File[]>(),
  location: z.string().min(2).max(100),
  tags: z.string(),
})

export const ProfileValidation = z.object({
  file: z.custom<File[]>(),
  name: z.string().min(2, { message: "Имя должно содержать как минимум 2 символа." }),
  username: z.string().min(2, { message: "Имя должно содержать как минимум 2 символа." }),
  email: z.string().email(),
  bio: z.string(),
});