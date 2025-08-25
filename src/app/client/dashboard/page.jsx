'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Briefcase, Plus, Users, DollarSign, Clock, Star,
  MapPin, Calendar, LogOut, Eye,
  Search
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [clientJobs, setClientJobs] = useState([]);
  const [biddings, setBiddings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }

    if (status === 'authenticated' && session?.user) {
      const user = session.user;
      setCurrentUser(user);

      const fetchData = async () => {
        try {
          if (user) {
            const [clientsRes, jobsRes, biddingsRes, workersRes, reviewsRes] = await Promise.all([
              fetch(`/api/clients?userId=${user.id}`),
              fetch('/api/jobs'),
              fetch('/api/biddings'),
              fetch('/api/workers'),
              fetch('/api/reviews'),
            ]);

            const client = await clientsRes.json();
            setClientData(client);

            const allJobs = await jobsRes.json();
            setClientJobs(allJobs.filter((j) => j.client_id === client.client_id));

            setBiddings(await biddingsRes.json());
            setWorkers(await workersRes.json());
            setReviews(await reviewsRes.json());
          }
        } catch (error) {
          console.error("Failed to fetch client dashboard data:", error);
        }
      };

      fetchData();
    }
  }, [session, status, router]);

  const stats = {
    totalJobs: clientData?.total_jobs_posted || 0,
    activeJobs: clientJobs.filter(job => ['posted', 'assigned', 'in_progress'].includes(job.status)).length,
    completedJobs: clientJobs.filter(job => job.status === 'completed').length,
    totalSpent: clientJobs.reduce((sum, job) => sum + job.budget, 0)
  };

  if (status === 'loading' || !currentUser || !clientData) {
    return <div>Loading...</div>; // Or a proper loading skeleton
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
                <h1 className="text-xl font-bold">Client Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {currentUser.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild>
                <Link href="/client/post-job">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Job
                </Link>
              </Button>
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
              <p className="text-xs text-muted-foreground">Jobs posted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedJobs}</div>
              <p className="text-xs text-muted-foreground">Successfully completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time spending</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="workers">Find Workers</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Jobs</h2>
              <Button asChild>
                <Link href="/client/post-job">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              {clientJobs.map(job => {
                const jobBiddings = biddings.filter(b => b.job_id === job.job_id);
                return (
                  <Card key={job.job_id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <CardDescription className="mt-2">{job.description}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={
                            job.status === 'completed' ? 'default' :
                              job.status === 'in_progress' ? 'secondary' :
                                job.status === 'assigned' ? 'outline' :
                                  job.status === 'posted' ? 'secondary' : 'destructive'
                          }>
                            {job.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <div className="text-right">
                            <div className="font-bold">৳{job.budget.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{job.duration_value} {job.duration_type}(s)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{job.workers_needed} workers needed</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          <span>{job.job_type === 'bidding' ? 'Bidding' : 'Direct Hire'}</span>
                        </div>
                      </div>

                      {job.job_type === 'bidding' && jobBiddings.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-2">Bids Received ({jobBiddings.length})</div>
                          <div className="space-y-2">
                            {jobBiddings.slice(0, 2).map(bid => {
                              const worker = workers.find(w => w.worker_id === bid.worker_id);
                              const workerUser = users.find(u => u.user_id === worker?.user_id);
                              return (
                                <div key={bid.bid_id} className="flex justify-between items-center p-2 border rounded">
                                  <div className="flex items-center space-x-2">
                                    <div>
                                      <div className="font-medium text-sm">{workerUser?.name}</div>
                                      <div className="text-xs text-gray-500">Rating: {worker?.rating}/5</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold">৳{bid.bid_amount.toLocaleString()}</div>
                                    <Badge variant="outline" className="text-xs">
                                      {bid.status}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {job.status === 'posted' && jobBiddings.length > 0 && (
                          <Button size="sm">Review Bids</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="workers" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Available Workers</h2>
              <div className="mb-4">
                <Button asChild>
                  <Link href="/client/workers">
                    <Search className="h-4 w-4 mr-2" />
                    Advanced Search
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workers.filter(w => w.verification_status === 'approved' && w.is_available).map(worker => {
                  const workerUser = users.find(u => u.user_id === worker.user_id);
                  return (
                    <Card key={worker.worker_id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{workerUser?.name}</CardTitle>
                            <CardDescription>{worker.skills}</CardDescription>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{worker.rating}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm mb-4">
                          <div><strong>Category:</strong> {worker.category_id === 1 ? 'Indoor' : 'Outdoor'}</div>
                          <div><strong>Jobs Completed:</strong> {worker.total_jobs}</div>
                          <div><strong>Location:</strong> {workerUser?.address}</div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">Hire Directly</Button>
                          <Button size="sm" variant="outline">View Profile</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
                <CardDescription>See what workers say about working with you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600">{clientData?.rating}/5.0</div>
                  <div className="flex justify-center items-center space-x-1 mt-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="text-gray-500 mt-2">Based on {stats.completedJobs} completed jobs</div>
                </div>

                <div className="space-y-4">
                  {reviews.filter(r => r.reviewee_id === currentUser.user_id).map(review => (
                    <div key={review.review_id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">Job #{review.job_id}</div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>

                <Button variant="outline" asChild>
                  <Link href="/client/profile">Edit Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
