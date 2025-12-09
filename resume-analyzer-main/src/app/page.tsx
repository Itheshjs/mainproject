'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { analyzeResume, type AnalyzeResumeOutput } from '@/ai/flows/analyze-resume';
import { Loader2, CheckCircle, XCircle, Lightbulb, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { PieChart, Pie, Cell, Label as RechartsLabel } from "recharts"


const CHART_CONFIG = {
  score: { label: "Score", color: "hsl(var(--chart-1))" },
  remaining: { label: "Remaining", color: "hsl(var(--chart-2))" },
} satisfies Record<string, { label: string; color: string }>;


export default function ResumeAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');


   const chartData = analysisResult ? [
    { name: "Score", value: analysisResult.score, fill: CHART_CONFIG.score.color },
    { name: "Remaining", value: 100 - analysisResult.score, fill: CHART_CONFIG.remaining.color },
  ].filter(item => item.value > 0) : [];


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
       // Limit file size (e.g., 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        setSelectedFile(null);
        setFileName('');
        return;
      }
      // Allow specific file types (e.g., PDF, DOCX)
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
         setError("Invalid file type. Please upload a PDF or DOCX file.");
         setSelectedFile(null);
         setFileName('');
         return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      setError(null); // Clear previous errors
      setAnalysisResult(null); // Clear previous results
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyzeClick = async () => {
    if (!selectedFile) {
      setError("Please select a resume file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const resumeDataUri = await readFileAsDataURL(selectedFile);
      const result = await analyzeResume({ resumeDataUri });
      setAnalysisResult(result);
    } catch (err: any) {
      console.error("Error analyzing resume:", err);
      // Display the error message directly to the user
      if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to analyze resume. Please try again.");
      }
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = 'http://localhost/geminitest/index.html';
          }}
        >
          ← Back to Home
        </Button>
      </div>
      <div className="text-center">
         <h1 className="text-4xl font-bold tracking-tight">AI Resume Analyzer</h1>
         <p className="text-muted-foreground mt-2">Get instant feedback on your resume to land your next job.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Resume</CardTitle>
          <CardDescription>Upload your resume (PDF or DOCX, max 5MB) to get AI-powered analysis and feedback.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="resume-file">Resume File</Label>
            <Input id="resume-file" type="file" accept=".pdf,.docx" onChange={handleFileChange} className="file:text-foreground"/>
             {fileName && <p className="text-sm text-muted-foreground mt-1">Selected: {fileName}</p>}
          </div>
           {error && (
             <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyzeClick} disabled={isLoading || !selectedFile}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Resume"
            )}
          </Button>
        </CardFooter>
      </Card>

      {isLoading && (
          <Card>
              <CardContent className="flex flex-col items-center justify-center p-10 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Analyzing your resume...</p>
                  <p className="text-sm text-center">This may take a moment. The AI is reviewing your document in detail.</p>
              </CardContent>
          </Card>
      )}


      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>Here's the feedback on your resume.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chart Section */}
            <Card>
               <CardHeader className="items-center pb-0">
                 <CardTitle>Resume Score Overview</CardTitle>
                 <CardDescription>Visual representation of analysis</CardDescription>
               </CardHeader>
               <CardContent className="flex-1 pb-0">
                 <ChartContainer
                   config={CHART_CONFIG}
                   className="mx-auto aspect-square max-h-[250px]"
                 >
                   <PieChart>
                     <ChartTooltip
                       cursor={false}
                       content={<ChartTooltipContent hideLabel />}
                     />
                     <Pie
                       data={chartData}
                       dataKey="value"
                       nameKey="name"
                       innerRadius={60}
                       strokeWidth={5}
                       cornerRadius={20}
                     >
                       <RechartsLabel
                        value={`${analysisResult.score}/100`}
                        position="center"
                        fill="hsl(var(--foreground))"
                        className="text-3xl font-bold"
                      />
                       {chartData.map((entry) => (
                         <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                       ))}
                     </Pie>
                   </PieChart>
                 </ChartContainer>
               </CardContent>
                 <CardFooter className="flex-col gap-2 text-sm">
                    <div className="leading-none text-muted-foreground text-center">
                    Based on AI analysis. Scores are indicative.
                    </div>
                </CardFooter>
            </Card>

             {/* Text Feedback Section */}
             <div className="grid gap-4 md:grid-cols-2">
                <Alert className="border-green-500 dark:border-green-400">
                    <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                    <AlertTitle className="text-green-700 dark:text-green-300">Strengths</AlertTitle>
                    <AlertDescription>{analysisResult.strengths}</AlertDescription>
                </Alert>
                <Alert className="border-red-500 dark:border-red-400">
                    <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                    <AlertTitle className="text-red-700 dark:text-red-300">Weaknesses</AlertTitle>
                    <AlertDescription>{analysisResult.weaknesses}</AlertDescription>
                </Alert>
                <Alert className="border-blue-500 dark:border-blue-400 md:col-span-2">
                    <Lightbulb className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    <AlertTitle className="text-blue-700 dark:text-blue-300">Areas for Improvement</AlertTitle>
                    <AlertDescription>{analysisResult.improvements}</AlertDescription>
                </Alert>
                <Alert className="border-primary md:col-span-2">
                     <BarChart3 className="h-5 w-5 text-primary"/>
                    <AlertTitle className="text-primary">Overall Feedback</AlertTitle>
                    <AlertDescription>{analysisResult.overallFeedback}</AlertDescription>
                </Alert>
             </div>
            {/* Save Score Button */}
            <div className="flex justify-end mt-4">
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/resume-score', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({
                        score: analysisResult.score,
                        timestamp: new Date().toISOString(),
                        fileName,
                        details: analysisResult
                      })
                    });
                    const data = await res.json();
                    if (data.success) {
                      window.location.href = 'http://localhost/geminitest/index.html?showProgress=1';
                    } else {
                      alert('Failed to save score: ' + (data.message || 'Unknown error'));
                    }
                  } catch (e) {
                    alert('Error saving score.');
                  }
                }}
              >
                Save Score
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
