'use client';

import { toast } from "sonner";
import FormField from "./FormField";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { signUp,signIn } from "@/lib/actions/auth.action";


import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {  z } from "zod";


import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/firebase/client";



const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
async  function onSubmit (values: z.infer<typeof formSchema>) {
    try {
      if (type === "sign-up") {
        const { name, email, password } = values;
        const userCredentials = await createUserWithEmailAndPassword(auth,email,password);

        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result?.success) {
          toast.error(result?.message);
          return;
        }

        toast.success("Account created successfully! Please sign in.");
        router.push("/sign-in");

        console.log("Sign Up", values);
      } else  {
        const {email,password}= values;
        const userCredentials= await signInWithEmailAndPassword(auth,email,password);

        const idToken= await userCredentials.user.getIdToken();
        if(!idToken){
          toast.error('Sign-in failed')
          return;
        }
        await signIn({
          email,idToken
        })
        toast.success("Signed in successfully!");
        router.push("/");
        console.log("Sign In", values);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        `There was an error processing your request :${error}. Please try again later.`
      );
    }
  }
  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10 ">
        <div className="flex flex-row gap-2 justify-center ">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">CrackIt</h2>
        </div>
        <h3 className="text-center">AI That Gets You Interview-Ready.</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Enter your name"
              />
            )}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
            />

            <Button className="btn" type="submit">
              {isSignIn ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>
        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
