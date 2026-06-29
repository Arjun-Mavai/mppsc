'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, MessageSquare, Plus, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { addOrUpdateTestimonial, deleteTestimonial } from '@/actions/admin-testimonials-actions';

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().optional(),
  location: z.string().optional(),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
  image: z.string().optional(),
  stars: z.number().min(1).max(5),
  displayOrder: z.number(),
  isActive: z.boolean(),
});

type TestimonialFormValues = z.infer<typeof formSchema>;

export default function TestimonialsAdminClient({ initialData }: { initialData: TestimonialFormValues[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      role: 'Aspirant',
      location: '',
      comment: '',
      image: '',
      stars: 5,
      displayOrder: 0,
      isActive: true,
    },
  });

  const onSubmit = async (values: TestimonialFormValues) => {
    const formData = new FormData();
    if (values.id) formData.append('id', values.id);
    formData.append('name', values.name);
    formData.append('role', values.role || '');
    formData.append('location', values.location || '');
    formData.append('comment', values.comment);
    formData.append('image', values.image || '');
    formData.append('stars', values.stars.toString());
    formData.append('displayOrder', values.displayOrder.toString());
    formData.append('isActive', values.isActive.toString());

    await addOrUpdateTestimonial(formData);
    setIsOpen(false);
    form.reset();
    setEditingId(null);
  };

  const handleEdit = (item: TestimonialFormValues) => {
    form.reset({
      id: item.id,
      name: item.name,
      role: item.role || '',
      location: item.location || '',
      comment: item.comment,
      image: item.image || '',
      stars: item.stars,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    setEditingId(item.id || null);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      await deleteTestimonial(id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Star className="h-8 w-8 text-amber-500 fill-amber-500" />
            Testimonials Manager
          </h1>
          <p className="text-slate-500 mt-2">Manage the testimonials showing on the homepage.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            form.reset({
              name: '', role: 'Aspirant', location: '', comment: '', image: '', stars: 5, displayOrder: 0, isActive: true
            });
            setEditingId(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" /> Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField<TestimonialFormValues>
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} value={(field.value ?? '') as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField<TestimonialFormValues>
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input placeholder="Aspirant" {...field} value={(field.value ?? '') as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField<TestimonialFormValues>
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Indore" {...field} value={(field.value ?? '') as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField<TestimonialFormValues>
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="/testimonials/xyz.png" {...field} value={(field.value ?? '') as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField<TestimonialFormValues>
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment</FormLabel>
                      <FormControl>
                        <Textarea placeholder="The app is amazing..." className="h-24" {...field} value={(field.value ?? '') as string} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField<TestimonialFormValues>
                    control={form.control}
                    name="stars"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stars (1-5)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="5" 
                            {...field} 
                            value={(field.value ?? '') as string | number}
                            onChange={(e) => field.onChange(Number(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField<TestimonialFormValues>
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            value={(field.value ?? '') as string | number}
                            onChange={(e) => field.onChange(Number(e.target.value))} 
                          />
                        </FormControl>
                        <FormDescription>Lower shows first</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField<TestimonialFormValues>
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-2">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value as boolean}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  {editingId ? 'Save Changes' : 'Create Testimonial'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {initialData.map((item) => (
          <div key={item.id} className={`bg-white border rounded-xl p-6 shadow-sm flex flex-col justify-between transition-all ${item.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'}`}>
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-slate-100 bg-slate-50 relative">
                  <Image
                    fill
                    src={item.image || '/default-avatar.png'}
                    alt={item.name}
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 truncate">{item.name}</h3>
                  <div className="text-sm text-slate-500 truncate">
                    {item.location} • {item.role}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="ml-auto flex shrink-0 gap-0.5 rounded-full border border-amber-100 bg-amber-50 px-2 py-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="ml-0.5 text-xs font-bold text-amber-700">{item.stars}.0</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg relative">
                <MessageSquare className="absolute top-4 left-4 h-5 w-5 text-slate-300" />
                <p className="text-slate-700 text-sm pl-8 italic leading-relaxed line-clamp-4">"{item.comment}"</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {item.isActive ? 'Active' : 'Hidden'}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="h-8">
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => item.id && handleDelete(item.id)} className="h-8">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
