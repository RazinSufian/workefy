'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, Users, Briefcase, DollarSign, TrendingUp, CheckCircle, 
  XCircle, Clock, AlertTriangle, LogOut, Settings
} from 'lucide-react';
import { User, Worker, Job, Payment, CashoutRequest, Dispute } from '@/types';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cashoutRequests, setCashoutRequests] = useState<CashoutRequest[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }

    if (status === 'authenticated') {
      if ((session.user as User).role !== 'admin') {
        router.push('/'); // or a dedicated unauthorized page
      }

      const fetchData = async () => {
        try {
          const [usersRes, workersRes, jobsRes, paymentsRes, cashoutRequestsRes, disputesRes] = await Promise.all([
            fetch('/api/users'),
            fetch('/api/workers'),
            fetch('/api/jobs'),
            fetch('/api/payments'),
            fetch('/api/cashout-requests'),
            fetch('/api/disputes'),
          ]);

          setUsers(await usersRes.json());
          setWorkers(await workersRes.json());
          setJobs(await jobsRes.json());
          setPayments(await paymentsRes.json());
          setCashoutRequests(await cashoutRequestsRes.json());
          setDisputes(await disputesRes.json());
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        }
      };

      fetchData();
    }
  }, [session, status, router]);

  const stats = {
    totalUsers: users.length,
    totalWorkers: workers.length,
    pendingVerifications: workers.filter(w => w.verification_status === 'pending').length,
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => ['posted', 'assigned', 'in_progress'].includes(j.status)).length,
    totalRevenue: payments.reduce((sum, p) => sum + p.admin_commission, 0),
    pendingCashouts: cashoutRequests.filter(cr => cr.status === 'pending').length
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Platform Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
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
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
              <p className="text-xs text-muted-foreground">Workers awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total commission earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Alert Section */}
        {(stats.pendingVerifications > 0 || stats.pendingCashouts > 0) && (
          <div className="mb-8">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <CardTitle className="text-yellow-800">Action Required</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-yellow-700">
                  {stats.pendingVerifications > 0 && (
                    <div>• {stats.pendingVerifications} worker(s) pending verification</div>
                  )}
                  {stats.pendingCashouts > 0 && (
                    <div>• {stats.pendingCashouts} cashout request(s) awaiting approval</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="verifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="verifications">Worker Verifications</TabsTrigger>
            <TabsTrigger value="jobs">Job Management</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="cashouts">Cashout Requests</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="verifications" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Worker Verifications</h2>
              <div className="space-y-4">
                {workers.map(worker => {
                  const user = users.find(u => u.user_id === worker.user_id);
                  return (
                    <Card key={worker.worker_id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{user?.name}</CardTitle>
                            <CardDescription>
                              {worker.skills} • {worker.category_id === 1 ? 'Indoor' : 'Outdoor'}
                            </CardDescription>
                          </div>
                          <Badge variant={
                            worker.verification_status === 'approved' ? 'default' :
                            worker.verification_status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {worker.verification_status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                          <div><strong>Phone:</strong> {user?.phone}</div>
                          <div><strong>Address:</strong> {user?.address}</div>
                          <div><strong>Rating:</strong> {worker.rating}/5.0</div>
                          <div><strong>Jobs Completed:</strong> {worker.total_jobs}</div>
                        </div>
                        
                        {worker.verification_status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button size="sm" variant="outline">
                              View NID
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Job Management</h2>
              <div className="space-y-4">
                {jobs.map(job => (
                  <Card key={job.job_id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <CardDescription>{job.description}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={
                            job.status === 'completed' ? 'default' :
                            job.status === 'in_progress' ? 'secondary' :
                            job.status === 'assigned' ? 'outline' : 'secondary'
                          }>
                            {job.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <div className="text-sm font-bold">৳{job.budget.toLocaleString()}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div><strong>Location:</strong> {job.location}</div>
                        <div><strong>Duration:</strong> {job.duration_value} {job.duration_type}(s)</div>
                        <div><strong>Workers:</strong> {job.workers_needed}</div>
                        <div><strong>Type:</strong> {job.job_type === 'bidding' ? 'Bidding' : 'Direct Hire'}</div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        {job.status === 'posted' && (
                          <Button size="sm">Manage</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Payment Management</h2>
              <div className="space-y-4">
                {payments.map(payment => (
                  <Card key={payment.payment_id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Payment #{payment.payment_id}</CardTitle>
                          <CardDescription>Job ID: {payment.job_id}</CardDescription>
                        </div>
                        <Badge variant={
                          payment.status === 'completed' ? 'default' :
                          payment.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {payment.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div><strong>Total Amount:</strong> ৳{payment.total_amount.toLocaleString()}</div>
                        <div><strong>Worker Amount:</strong> ৳{payment.worker_amount.toLocaleString()}</div>
                        <div><strong>Commission:</strong> ৳{payment.admin_commission.toLocaleString()} ({payment.commission_percentage}%)</div>
                        <div><strong>Payment Type:</strong> {payment.payment_type}</div>
                      </div>
                      
                      {payment.status === 'pending' && payment.payment_type === 'manual' && (
                        <div className="flex space-x-2">
                          <Button size="sm">Mark as Paid</Button>
                          <Button size="sm" variant="outline">Adjust Amount</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cashouts" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Cashout Requests</h2>
              <div className="space-y-4">
                {cashoutRequests.map(request => {
                  const worker = workers.find(w => w.worker_id === request.worker_id);
                  const user = users.find(u => u.user_id === worker?.user_id);
                  return (
                    <Card key={request.cashout_id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{user?.name}</CardTitle>
                            <CardDescription>
                              Cashout Request #{request.cashout_id}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">৳{request.amount.toLocaleString()}</div>
                            <Badge variant={
                              request.status === 'approved' ? 'default' :
                              request.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {request.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                          <div><strong>Bank:</strong> {request.bank_name}</div>
                          <div><strong>Account:</strong> {request.bank_account}</div>
                          <div><strong>Worker Balance:</strong> ৳{worker?.balance.toLocaleString()}</div>
                          <div><strong>Request Date:</strong> {new Date(request.created_at).toLocaleDateString()}</div>
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button size="sm" variant="outline">Add Note</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="disputes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Active Disputes</h2>
              <Button asChild>
                <Link href="/admin/disputes">Manage All Disputes</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {disputes.map(dispute => {
                const job = jobs.find(j => j.job_id === dispute.job_id);
                return (
                  <Card key={dispute.dispute_id} className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Dispute #{dispute.dispute_id}</CardTitle>
                          <CardDescription>{job?.title} - {dispute.reason}</CardDescription>
                        </div>
                        <Badge variant="destructive">Open</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{dispute.description}</p>
                      <Button size="sm">Resolve Dispute</Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth</CardTitle>
                  <CardDescription>User registration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Workers</span>
                      <span className="font-medium">{workers.length}</span>
                    </div>
                    <Progress value={(workers.length / users.length) * 100} />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Clients</span>
                      <span className="font-medium">{users.filter(u => u.role === 'client').length}</span>
                    </div>
                    <Progress value={(users.filter(u => u.role === 'client').length / users.length) * 100} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Commission breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        ৳{stats.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Total Revenue</div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>This Month</span>
                      <span className="font-medium">৳{payments.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).reduce((sum, p) => sum + p.admin_commission, 0).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Average per Job</span>
                      <span className="font-medium">৳{stats.totalJobs > 0 ? Math.round(stats.totalRevenue / stats.totalJobs).toLocaleString() : 0}</span>
                    </div>
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
