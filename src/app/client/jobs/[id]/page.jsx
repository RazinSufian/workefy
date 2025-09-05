'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, DollarSign, Check, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from 'next-auth/react';

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { data: session } = useSession();
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [assignedWorker, setAssignedWorker] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const [jobRes, bidsRes, usersRes, workersRes, jobAssignmentsRes] = await Promise.all([
            fetch(`/api/jobs/${id}`),
            fetch(`/api/biddings?job_id=${id}`),
            fetch('/api/users'),
            fetch('/api/workers'),
            fetch(`/api/job-assignments?job_id=${id}`),
          ]);

          const jobData = await jobRes.json();
          const bidsData = await bidsRes.json();
          const usersData = await usersRes.json();
          const workersData = await workersRes.json();
          const jobAssignmentsData = await jobAssignmentsRes.json();

          setJob(jobData);
          console.log('Job Status:', jobData.status); // Log the job status
          setBids(bidsData);
          setUsers(usersData);
          setWorkers(workersData);

          if (jobAssignmentsData.length > 0) {
            const worker = workersData.find(w => w.worker_id === jobAssignmentsData[0].worker_id);
            const user = usersData.find(u => u.user_id === worker?.user_id);
            setAssignedWorker({ worker, user });
          }
        } catch (error) {
          console.error("Failed to fetch job details:", error);
        }
      };

      fetchData();
    }
  }, [id]);

  const handleAcceptBid = async (bidId) => {
    try {
      const res = await fetch(`/api/biddings/${bidId}/accept`, {
        method: 'PUT',
      });

      if (!res.ok) {
        throw new Error('Failed to accept bid');
      }

      toast.success('Bid accepted successfully!');
      router.push('/client/dashboard');
    } catch (error) {
      console.error("Failed to accept bid:", error);
      toast.error('Failed to accept bid. Please try again.');
    }
  };

  const handleMarkAsComplete = async () => {
    try {
      const res = await fetch(`/api/jobs/${id}/complete`, {
        method: 'PUT',
      });

      if (!res.ok) {
        throw new Error('Failed to mark job as complete');
      }

      toast.success('Job marked as complete successfully!');
      // a bit of delay to allow the server to process the request
      setTimeout(() => {
        router.push('/client/dashboard');
      }, 1000);
    } catch (error) {
      console.error("Failed to mark job as complete:", error);
      toast.error('Failed to mark job as complete. Please try again.');
    }
  };

  const handleReviewSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: id,
          reviewer_id: session.user.id,
          reviewee_id: assignedWorker.user.user_id,
          rating,
          comment,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit review');
      }

      toast.success('Review submitted successfully!');
      setRating(0);
      setComment('');
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error('Failed to submit review. Please try again.');
    }
  };

  if (!job) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold">Job Details</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription>{job.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {job.status === 'completed' && assignedWorker && (
              <div className="my-4">
                <h3 className="font-medium mb-2">Leave a Review for {assignedWorker.user?.name}</h3>
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer ${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
                <Textarea
                  placeholder="Write your review here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-2"
                />
                <Button onClick={handleReviewSubmit}>Submit Review</Button>
              </div>
            )}

            {job.job_type === 'bidding' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Bids</h3>
                  <div className="space-y-4">
                    {bids.map(bid => {
                      const worker = workers.find(w => w.worker_id === bid.worker_id);
                      const user = users.find(u => u.user_id === worker?.user_id);
                      return (
                        <Card key={bid.bid_id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span>{user?.name}</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                  <DollarSign className="h-4 w-4 text-gray-400" />
                                  <span>{bid.bid_amount}</span>
                                </div>
                              </div>
                              {job.status === 'posted' && (
                                <Button size="sm" onClick={() => handleAcceptBid(bid.bid_id)}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Accept Bid
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-2">Assigned Worker</h3>
                {assignedWorker ? (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{assignedWorker.user?.name}</span>
                          </div>
                        </div>
                        {(job.status === 'in_progress' || job.status === 'assigned') && (
                          <Button onClick={handleMarkAsComplete}>Mark as Complete</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <p>No worker assigned yet.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}