import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from 'react-router-dom'

import { useToast } from "@/hooks/use-toast"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { useForm } from "react-hook-form"
import { SignupValidation } from "@/lib/validation"
import { z } from "zod"
import { Loader } from "lucide-react"
import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"

const SignupForm = () => {

  const { toast } = useToast()
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
  const navigate = useNavigate();

  const { mutateAsync: createUserAccount, isPending: isCreatingAccount} = useCreateUserAccount();

  const { mutateAsync: signInAccount, isPending: isSigningIn } = useSignInAccount();

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  })

  // [const { mutateAsync: createUserAccount, isLoading: isCreatingAccount } = useCreateUserAccountMutation();]
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof SignupValidation>) {
    try {
      const newUser = await createUserAccount(values);
  
      if (!newUser) {
        toast({ title: "Ошибка. Попробуйте еще раз." });
        return;
      }
  
      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });
  
      if (!session) {
        toast({ title: "Ошибка. Попробуйте еще раз." });
        return;
      }
  
      const isLoggedIn = await checkAuthUser();
  
      if (isLoggedIn) {
        form.reset();
        navigate('/');
      } else {
        toast({ title: "Ошибка при регистрации" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Произошла ошибка. Попробуйте еще раз." });
    }
  }
  

  return (
      <Form {...form}>

      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg" alt="logo" />

      <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Создайте аккаунт</h2>
      <p className="text-light-3 small-medium md:base-regular mt-2">Чтобы использовать Snapgram введите свои данные</p>

      {isUserLoading && (
          <div className="flex-center gap-2 mb-4">
            <Loader /> Проверка статуса пользователя...
          </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя пользователя</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Почта</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input type="password" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="shad-button_primary">
            {isCreatingAccount || isSigningIn ? (
              <div className="flex-center gap-2">
                <Loader /> Загрузка...
              </div>
            ) : "Sign up"}
          </Button>

        <p className="text-small-regular text-light-2 text-center mt-2">
          Уже есть аккаунт?
          <Link to="/sign-in" className="text-primary-500 text-small-semibold ml-1">Войдите</Link>
        </p>

      </form>
      </div>
    </Form>
  )
}

export default SignupForm