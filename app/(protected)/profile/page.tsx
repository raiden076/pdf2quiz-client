"use client";

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaveIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile } from '@/lib/api';
import { getUserFromToken } from '@/lib/auth';
import type { User } from '@/lib/types';

const profileSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }),
  currentPassword: z.string().min(6, {
    message: 'Current password must be at least 6 characters.',
  }),
  newPassword: z.string().min(6, {
    message: 'New password must be at least 6 characters.',
  }),
  confirmPassword: z.string().min(6, {
    message: 'Confirm password must be at least 6 characters.',
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        // First try to get from API
        const response = await getUserProfile();
        
        if (response.success && response.data) {
          setUser(response.data);
          form.setValue('username', response.data.username);
        } else {
          // Fallback to token data
          const tokenUser = getUserFromToken();
          if (tokenUser) {
            setUser(tokenUser);
            form.setValue('username', tokenUser.username);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load profile information.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [form, toast]);

  async function onSubmit(data: ProfileFormValues) {
    // This would typically call an API to update the user profile
    // Since we're mocking this, we'll just show a success message
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully.',
    });
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and change your password
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-8">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>View and update your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
                      <p className="text-base">{isLoading ? 'Loading...' : user?.username}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
                      <p className="text-base">
                        {isLoading ? 'Loading...' : user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Update Password */}
            <Card>
              <CardHeader>
                <CardTitle>Update Password</CardTitle>
                <CardDescription>Change your password to a new one</CardDescription>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="ml-auto">
                      <SaveIcon className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
            
            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Permanent actions that can't be undone</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive">Delete Account</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}