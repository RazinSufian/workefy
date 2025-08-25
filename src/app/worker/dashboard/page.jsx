'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Briefcase, DollarSign, Clock, Star, CheckCircle, 
  AlertCircle, Calendar, MapPin, LogOut 
} from 'lucide-react';
import { User, Worker, Job, Bidding, CashoutRequest } from '@/types';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function WorkerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [biddingJobs, setBiddingJobs] = useState([]);
  const [cashoutRequests, setCashoutRequests] = useState([]);
  const [biddings, setBiddings] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }

    if (status === 'authenticated') {
      const user = session.user;
      if (user.role !== 'worker') {
        router.push('/'); // or a dedicated unauthorized page
      }
      setCurrentUser(user);

      const fetchData = async () => {
        try {
          if (user) {
            const [workersRes, jobsRes, cashoutRequestsRes, biddingsRes] = await Promise.all([
              fetch(`/api/workers?userId=${user.id}`),
              fetch('/api/jobs'),
              fetch('/api/cashout-requests'),
              fetch('/api/biddings'),
            ]);

            const worker = await workersRes.json();
            setWorkerData(worker);

            const allJobs = await jobsRes.json();
            if (worker) {
              const assigned = allJobs.filter((j) => j.status === 'assigned' || j.status === 'in_progress');
              setAssignedJobs(assigned);
              const bidding = allJobs.filter((j) => j.job_type === 'bidding' && j.status === 'posted');
              setBiddingJobs(bidding);
            }

            const allCashoutRequests = await cashoutRequestsRes.json();
            if (worker) {
              setCashoutRequests(allCashoutRequests.filter((cr) => cr.worker_id === worker.worker_id));
            }

            const allBiddings = await biddingsRes.json();
            if (worker) {
              setBiddings(allBiddings.filter((b) => b.worker_id === worker.worker_id));
            }
          }
        } catch (error) {
          console.error("Failed to fetch worker dashboard data:", error);
        }
      };

      fetchData();
    }
  }, [session, status, router]);

  const stats = {
    totalJobs: workerData?.total_jobs || 0,
    rating: workerData?.rating || 0,
    balance: workerData?.balance || 0,
    pendingJobs: assignedJobs.length
  };

  if (status === 'loading' || !currentUser || !workerData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold">Worker Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {currentUser.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={workerData?.verification_status === 'approved' ? 'default' : 'secondary'}>
                {workerData?.verification_status === 'approved' ? 'Verified' : 'Pending Verification'}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">Completed successfully</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rating}/5.0</div>
              <p className="text-xs text-muted-foreground">Average rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats.balance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Available for withdrawal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingJobs}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="opportunities">Job Opportunities</TabsTrigger>
            <TabsTrigger value="bids">My Bids</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">My Jobs</h2>
              <div className="space-y-4">
                {assignedJobs.map(job => (
                  <Card key={job.job_id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <CardDescription className="mt-2">{job.description}</CardDescription>
                        </div>
                        <Badge variant={
                          job.status === 'completed' ? 'default' :
                          job.status === 'in_progress' ? 'secondary' :
                          job.status === 'assigned' ? 'outline' : 'destructive'
                        }>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{job.duration_value} {job.duration_type}(s)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>৳{job.budget.toLocaleString()}</span>
                        </div>
                      </div>
                      {job.status === 'in_progress' && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>75%</span>
                          </div>
                          <Progress value={75} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Available Job Opportunities</h2>
              <div className="space-y-4">
                {biddingJobs.map(job => (
                  <Card key={job.job_id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <CardDescription className="mt-2">{job.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">৳{job.budget.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{job.workers_needed} workers needed</div>
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
                      <Button asChild>
                        <Link href="/worker/bids">{job.job_type === 'bidding' ? 'Place Bid' : 'Apply Now'}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bids" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Bids</h2>
              <Button asChild>
                <Link href="/worker/bids">View All Bids</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {biddings.slice(0, 3).map(bid => {
                const job = biddingJobs.find(j => j.job_id === bid.job_id);
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
                          <div className="text-sm text-gray-500">Your bid</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">৳{job?.budget.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Client budget</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Balance</CardTitle>
                  <CardDescription>Available for withdrawal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-4">
                    ৳{stats.balance.toLocaleString()}
                  </div>
                  <Button className="w-full">
                    Request Cashout
                  </Button>
                  <Button variant="outline" className="w-full mt-2" asChild>
                    <Link href="/worker/profile">Edit Profile</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cashout Requests</CardTitle>
                  <CardDescription>Track your withdrawal requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cashoutRequests.map(request => (
                      <div key={request.cashout_id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">৳{request.amount.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{request.bank_name}</div>
                        </div>
                        <Badge variant={
                          request.status === 'approved' ? 'default' :
                          request.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}