
"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await response.json();
        // Filter for jobs that are open for bidding
        const postedJobs = data.jobs.filter(job => job.status === 'posted' && job.job_type === 'bidding');
        setJobs(postedJobs);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Find Work</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <Card key={job.job_id}>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>
                  Posted by Client #{job.client_id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{job.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Budget: ${job.budget}</Badge>
                  <Badge variant="secondary">
                    Duration: {job.duration_value} {job.duration_type}(s)
                  </Badge>
                  <Badge variant="outline">
                    {job.workers_needed} worker(s) needed
                  </Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/worker/jobs/${job.job_id}`} passHref>
                  <Button>View Details & Bid</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p>No jobs available for bidding at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
