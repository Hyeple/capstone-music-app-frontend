
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { SignupValidation } from "@/lib/validation";
import { z } from "zod";
import { Link } from "react-router-dom";

const SignupForm = () => {
  const isLoading = false;

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver : zodResolver(SignupValidation),
    defaultValues : {
      name : '',
      username : '',
      email: '',
      password: '',
    },
  })

  /*
  const { mutateSync : createUserAccount, isLoading :
    isCreatingAccount} = useCreateUserAccountMutation();
*/

  async function onSubmit(values : z.infer<typeof SignupValidation>){
    /* 
    const newUser = await createUserAccount(values);
    
    if(!newUser){
      return toast({
        title : "Sign up failed. Please try again."
      })
    }

    const session = awit signInAccount()
    */
  }

  return(
    <Form {...form}>
       <div className="sm:w-420 flex-center flex-col">
          <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
            Create a new account
          </h2>
          <p className="text-light-3 small-medium md:base-regular mt-2 mb-10">
            To use Music App, Please enter your details
          </p>
      
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
                <FormLabel className="shad-form_label">Username</FormLabel>
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
                <FormLabel className="shad-form_label">Email</FormLabel>
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
                <FormLabel className="shad-form_label">Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
      <Button type="submit" className="shad-button_primary">
      {isLoading ? (
        <div className = "flex center gap-2">
          Loading...
        </div>
      ): "Sign up"}
      </Button>

      <p className = "text-small-regular text-light-3 text-center mt-2">
        Already have an account?
        <Link to="/sign-in" className = "text-primary-500 text-small-semibold ml-1">
          Log in
        </Link>
      </p>
    </form>
    </div>
  </Form>
)
}
export default SignupForm;