'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, PlusCircle } from 'lucide-react';

export default function ClientJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await fetch('/api/users');
        const allUsers = await usersRes.json();
        const clientUser = allUsers.find((u) => u.role === 'client');
        setCurrentUser(clientUser);

        if (clientUser) {
          const jobsRes = await fetch(`/api/jobs?client_id=${clientUser.user_id}`);
          const allJobs = await jobsRes.json();
          setJobs(allJobs);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/client/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-xl font-bold">My Jobs</h1>
            <Button asChild>
              <Link href="/client/post-job">
                <PlusCircle className="h-4 w-4 mr-2" />
                Post New Job
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {jobs.map(job => (
            <Card key={job.job_id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription className="mt-1">{job.location}</CardDescription>
                  </div>
                  <Badge variant={job.status === 'posted' ? 'secondary' : 'default'}>{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{job.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><strong>Budget:</strong> ৳{job.budget}</div>
                  <div><strong>Workers Needed:</strong> {job.workers_needed}</div>
                  <div><strong>Job Type:</strong> {job.job_type}</div>
                  <div><strong>Posted:</strong> {new Date(job.created_at).toLocaleDateString()}</div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/client/jobs/${job.job_id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {jobs.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                <p className="text-gray-500">You have not posted any jobs yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
