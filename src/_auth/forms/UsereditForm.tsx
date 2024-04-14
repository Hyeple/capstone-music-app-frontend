import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';

const userValidationSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  username: z.string().nonempty({ message: "Username is required" }),
  email: z.string().email({ message: "Invalid email" }).nonempty({ message: "Email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const UserEditForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(userValidationSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/update');
        form.reset(response.data);
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to fetch user details.";
        toast.error(`Error: ${errorMessage}`);
      }
    };
    
    fetchData();
  }, [form]);

  const handleUpdate = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/update', data);
      if (response.status === 200) {
        toast.success("Profile updated successfully.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update profile.";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      await axios.post('/api/delete');
      toast.success("Account deleted successfully.");
      navigate('/sign-in');
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete account.";
      toast.error(`Error: ${errorMessage}`);
    }
  };

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Edit Your Profile</h2>
        <p className="text-light-3 small-medium md:base-regular mt-2 mb-10">
          Update your account details below.
        </p>
      
        <form onSubmit={form.handleSubmit(handleUpdate)} className="flex flex-col gap-5 w-full mt-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="username" render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" className="shad-input" {...field} placeholder="Enter new password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" className="shad-button_primary">
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
          <Button onClick={handleWithdraw} className="shad-button_error">
            Delete Account
          </Button>
        </form>
      </div>
    </Form>
  );
};

export default UserEditForm;
