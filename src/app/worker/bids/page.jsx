'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, DollarSign, Clock, MapPin, Calendar, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Job, Bidding, User, Worker } from '@/types';

export default function WorkerBidsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [biddings, setBiddings] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await fetch('/api/users');
        const allUsers = await usersRes.json();
        const workerUser = allUsers.find((u) => u.role === 'worker');
        setCurrentUser(workerUser);

        if (workerUser) {
          const [workersRes, jobsRes, biddingsRes] = await Promise.all([
            fetch('/api/workers'),
            fetch('/api/jobs'),
            fetch('/api/biddings'),
          ]);

          const allWorkers = await workersRes.json();
          const currentWorker = allWorkers.find((w) => w.user_id === workerUser.user_id);
          setWorkerData(currentWorker);

          const allJobs = await jobsRes.json();
          setJobs(allJobs);

          const allBiddings = await biddingsRes.json();
          setBiddings(allBiddings);
        }
      } catch (error) {
        console.error("Failed to fetch bids data:", error);
      }
    };

    fetchData();
  }, []);

  // Get available jobs for bidding
  const availableJobs = jobs.filter(job => 
    job.job_type === 'bidding' && 
    job.status === 'posted' &&
    job.category_id === workerData?.category_id
  );

  // Get worker's existing bids
  const myBids = biddings.filter(bid => bid.worker_id === workerData?.worker_id);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!bidAmount || !selectedJob || !workerData) return;

    try {
      const res = await fetch('/api/biddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: selectedJob.job_id,
          worker_id: workerData.worker_id,
          bid_amount: parseFloat(bidAmount),
          message: bidMessage,
          status: 'pending',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to place bid');
      }

      toast.success('Bid placed successfully!');
      setBidAmount('');
      setBidMessage('');
      setSelectedJob(null);
      // Refresh bids
      const biddingsRes = await fetch('/api/biddings');
      setBiddings(await biddingsRes.json());

    } catch (error) {
      console.error("Failed to place bid:", error);
      toast.error('Failed to place bid. Please try again.');
    }
  };

  if (!currentUser || !workerData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/worker/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">My Bids</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Jobs */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Available Jobs for Bidding</h2>
            <div className="space-y-4">
              {availableJobs.map(job => {
                const existingBid = myBids.find(bid => bid.job_id === job.job_id);
                return (
                  <Card key={job.job_id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <CardDescription className="mt-2">{job.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">৳{job.budget.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{job.workers_needed} workers</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{job.duration_value} {job.duration_type}(s)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {existingBid ? (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <div className="font-medium">Your Bid: ৳{existingBid.bid_amount.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">{existingBid.message}</div>
                          </div>
                          <Badge variant={
                            existingBid.status === 'accepted' ? 'default' :
                            existingBid.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {existingBid.status}
                          </Badge>
                        </div>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedJob(job)}>
                              <Send className="h-4 w-4 mr-2" />
                              Place Bid
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Place Your Bid</DialogTitle>
                              <DialogDescription>
                                Submit your bid for "{job.title}"
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handlePlaceBid} className="space-y-4">
                              <div>
                                <Label htmlFor="bidAmount">Bid Amount (৳)</Label>
                                <Input
                                  id="bidAmount"
                                  type="number"
                                  value={bidAmount}
                                  onChange={(e) => setBidAmount(e.target.value)}
                                  placeholder="Enter your bid amount"
                                  required
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                  Client budget: ৳{job.budget.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <Label htmlFor="bidMessage">Message (Optional)</Label>
                                <Textarea
                                  id="bidMessage"
                                  value={bidMessage}
                                  onChange={(e) => setBidMessage(e.target.value)}
                                  placeholder="Why should the client choose you?"
                                  rows={3}
                                />
                              </div>
                              <Button type="submit" className="w-full">
                                Submit Bid
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* My Bids History */}
          <div>
            <h2 className="text-2xl font-bold mb-6">My Bid History</h2>
            <div className="space-y-4">
              {myBids.map(bid => {
                const job = jobs.find(j => j.job_id === bid.job_id);
                return (
                  <Card key={bid.bid_id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{job?.title}</CardTitle>
                          <CardDescription>{bid.message}</CardDescription>
                        </div>
                        <Badge variant={
                          bid.status === 'accepted' ? 'default' :
                          bid.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {bid.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-lg font-bold">৳{bid.bid_amount.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Your bid amount</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Client budget</div>
                          <div className="font-medium">৳{job?.budget.toLocaleString()}</div>
                        </div>
                      </div>
                      
                      {bid.status === 'accepted' && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <div className="text-green-800 font-medium">Congratulations! Your bid was accepted.</div>
                          <div className="text-green-600 text-sm">Check your dashboard for job details.</div>
                        </div>
                      )}
                      
                      {bid.status === 'rejected' && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg">
                          <div className="text-red-800 font-medium">Bid was not selected</div>
                          <div className="text-red-600 text-sm">Keep trying! More opportunities are available.</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
