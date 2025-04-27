"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileUp, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { uploadPdf } from '@/lib/api';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  pdfFile: z.instanceof(File, {
    message: 'PDF file is required',
  }).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB limit
    {
      message: 'PDF file must be less than 10MB',
    }
  ).refine(
    (file) => file.type === 'application/pdf',
    {
      message: 'File must be a PDF',
    }
  ),
});

type FormValues = z.infer<typeof formSchema>;

export default function PdfUpload() {
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('pdfFile', file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        form.setValue('pdfFile', file);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid file format',
          description: 'Please upload a PDF file.',
        });
      }
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsUploading(true);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 300);

    try {
      const response = await uploadPdf(data.pdfFile);

      if (response.success && response.data) {
        setUploadProgress(100);
        clearInterval(progressInterval);

        toast({
          title: 'PDF uploaded successfully',
          description: 'Your quiz is being generated...',
        });
        console.log(response.data);

        // Redirect to quiz status page
        setTimeout(() => {
          router.push(`/quiz/${response.data?.quizSetId}`);
        }, 1000);
      } else {
        throw new Error(response.error || 'Failed to upload PDF');
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'An error occurred while uploading your PDF.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const selectedFile = form.watch('pdfFile');

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload PDF Document</CardTitle>
          <CardDescription>
            Upload a PDF to generate quiz questions. The system will analyze the content and create relevant questions.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a title for your quiz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-4" />

              <FormField
                control={form.control}
                name="pdfFile"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>PDF Document</FormLabel>
                    <FormControl>
                      <div
                        {...fieldProps}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          isDragOver ? 'border-primary bg-primary/5' : 'border-input'
                        } ${form.formState.errors.pdfFile ? 'border-destructive' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="application/pdf"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <div className="flex flex-col items-center gap-2">
                          <FileUp className="h-10 w-10 text-muted-foreground" />
                          <div>
                            {selectedFile ? (
                              <div className="flex flex-col items-center">
                                <p className="font-medium text-primary">{selectedFile.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            ) : (
                              <>
                                <p className="font-medium">Click to upload or drag and drop</p>
                                <p className="text-sm text-muted-foreground">
                                  PDF files only (max 10MB)
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {form.formState.errors.pdfFile && (
                <div className="flex gap-2 items-center text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{form.formState.errors.pdfFile.message}</span>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload and Generate Quiz
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}