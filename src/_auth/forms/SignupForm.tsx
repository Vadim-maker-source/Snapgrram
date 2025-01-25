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
        toast({ title: "Sign up failed. Please try again." });
        return;
      }
  
      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });
  
      if (!session) {
        toast({ title: "Sign in failed. Please try again." });
        return;
      }
  
      const isLoggedIn = await checkAuthUser();
  
      if (isLoggedIn) {
        form.reset();
        navigate('/');
      } else {
        toast({ title: "Authentication failed. Please try again." });
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({ title: "An error occurred. Please try again." });
    }
  }
  

  return (
      <Form {...form}>

      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg" alt="logo" />

      <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Create a new account</h2>
      <p className="text-light-3 small-medium md:base-regular mt-2">To use snapgram enter your details</p>

      {isUserLoading && (
          <div className="flex-center gap-2 mb-4">
            <Loader /> Checking user status...
          </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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
              <FormLabel>Username</FormLabel>
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
              <FormLabel>Email</FormLabel>
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
              <FormLabel>Password</FormLabel>
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
                <Loader /> Loading...
              </div>
            ) : "Sign up"}
          </Button>

        <p className="text-small-regular text-light-2 text-center mt-2">
          Already have an account?
          <Link to="/sign-in" className="text-primary-500 text-small-semibold ml-1">Log in</Link>
        </p>

      </form>
      </div>
    </Form>
  )
}

export default SignupForm