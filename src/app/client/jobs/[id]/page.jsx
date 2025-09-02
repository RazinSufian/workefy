'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function JobDetailsPage() {
  const params = useParams();
  const { id } = params;
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);

  useEffect(() => {
    if (id) {
      const fetchJobDetails = async () => {
        try {
          const jobRes = await fetch(`/api/jobs/${id}`);
          const jobData = await jobRes.json();
          setJob(jobData[0]);
        } catch (error) {
          console.error("Failed to fetch job details:", error);
        }
      };

      const fetchBids = async () => {
        try {
          const bidsRes = await fetch(`/api/bids?job_id=${id}`);
          const bidsData = await bidsRes.json();
          setBids(bidsData);
        } catch (error) {
          console.error("Failed to fetch bids:", error);
        }
      };

      fetchJobDetails();
      fetchBids();
    }
  }, [id]);

  const handleAcceptBid = async (bidId) => {
    try {
      const res = await fetch(`/api/bids/${bidId}/accept`, {
        method: 'PUT',
      });

      if (!res.ok) {
        throw new Error('Failed to accept bid');
      }

      setBids(bids.map(b => b.bid_id === bidId ? { ...b, status: 'accepted' } : b));
      toast.success('Bid accepted successfully!');
    } catch (error) {
      console.error("Failed to accept bid:", error);
      toast.error('Failed to accept bid. Please try again.');
    }
  };

  const handleRejectBid = async (bidId) => {
    try {
      const res = await fetch(`/api/bids/${bidId}/reject`, {
        method: 'PUT',
      });

      if (!res.ok) {
        throw new Error('Failed to reject bid');
      }

      setBids(bids.map(b => b.bid_id === bidId ? { ...b, status: 'rejected' } : b));
      toast.success('Bid rejected successfully!');
    } catch (error) {
      console.error("Failed to reject bid:", error);
      toast.error('Failed to reject bid. Please try again.');
    }
  };

  if (!job) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/client/jobs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Job Details</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>{job.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{job.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Budget:</strong> ৳{job.budget}</div>
                  <div><strong>Workers Needed:</strong> {job.workers_needed}</div>
                  <div><strong>Job Type:</strong> {job.job_type}</div>
                  <div><strong>Status:</strong> <Badge variant={job.status === 'posted' ? 'secondary' : 'default'}>{job.status}</Badge></div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mt-8 mb-4">Bids</h2>
            <div className="space-y-4">
              {bids.map(bid => (
                <Card key={bid.bid_id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{bid.worker_name}</p>
                      <p className="text-sm text-gray-600">Bid Amount: ৳{bid.bid_amount}</p>
                      <p className="text-sm text-gray-500 mt-2">{bid.message}</p>
                    </div>
                    <div className="flex space-x-2">
                      {bid.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleAcceptBid(bid.bid_id)}>
                            <Check className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectBid(bid.bid_id)}>
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      {bid.status !== 'pending' && (
                        <Badge variant={bid.status === 'accepted' ? 'default' : 'destructive'}>{bid.status}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {bids.length === 0 && (
                <p>No bids yet.</p>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Client Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold">{job.client_name}</p>
                    <p className="text-sm text-gray-500">Member Since {new Date(job.client_created_at).getFullYear()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
