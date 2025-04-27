import { Metadata } from 'next';
import PdfUpload from '@/components/quiz/pdf-upload';

export const metadata: Metadata = {
  title: 'Create Quiz | PDF Quiz Generator',
  description: 'Upload a PDF to generate a new quiz'
};

export default function CreateQuizPage() {
  return (
    <div className="container py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Quiz</h1>
          <p className="text-muted-foreground">
            Upload a PDF document to generate a quiz automatically
          </p>
        </div>
        
        <div className="mt-6">
          <PdfUpload />
        </div>
      </div>
    </div>
  );
}