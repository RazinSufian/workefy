'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Users, Search, CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Worker, User, Category } from '@/types';

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workersRes, usersRes, categoriesRes] = await Promise.all([
          fetch('/api/workers'),
          fetch('/api/users'),
          fetch('/api/categories'),
        ]);

        setWorkers(await workersRes.json());
        setUsers(await usersRes.json());
        setCategories(await categoriesRes.json());
      } catch (error) {
        console.error("Failed to fetch workers data:", error);
      }
    };

    fetchData();
  }, []);

  // Filter workers
  let filteredWorkers = workers;

  if (searchTerm) {
    filteredWorkers = filteredWorkers.filter(worker => {
      const user = users.find(u => u.user_id === worker.user_id);
      return worker.skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }

  if (statusFilter) {
    filteredWorkers = filteredWorkers.filter(worker => 
      worker.verification_status === statusFilter
    );
  }

  if (categoryFilter) {
    filteredWorkers = filteredWorkers.filter(worker => 
      worker.category_id.toString() === categoryFilter
    );
  }

  const handleApproveWorker = (workerId: number) => {
    toast.success('Worker approved successfully!');
  };

  const handleRejectWorker = (workerId: number) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    toast.success('Worker rejected with reason provided');
    setRejectionReason('');
    setSelectedWorker(null);
  };

  const handleSuspendWorker = (workerId: number) => {
    toast.success('Worker suspended successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/admin/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-purple-600" />
              <h1 className="text-xl font-bold">Worker Management</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filter Workers</CardTitle>
            <CardDescription>Manage worker verifications and accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Verification Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setCategoryFilter('');
              }}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Workers List */}
        <div className="space-y-4">
          {filteredWorkers.map(worker => {
            const user = users.find(u => u.user_id === worker.user_id);
            const category = categories.find(c => c.category_id === worker.category_id);
            return (
              <Card key={worker.worker_id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{user?.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {worker.skills} • {category?.name} Work
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        worker.verification_status === 'approved' ? 'default' :
                        worker.verification_status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {worker.verification_status}
                      </Badge>
                      {worker.is_available && (
                        <Badge variant="outline">Available</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div><strong>Phone:</strong> {user?.phone}</div>
                    <div><strong>Address:</strong> {user?.address}</div>
                    <div><strong>Rating:</strong> {worker.rating}/5.0</div>
                    <div><strong>Jobs Completed:</strong> {worker.total_jobs}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedWorker(worker)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{user?.name} - Worker Details</DialogTitle>
                          <DialogDescription>Complete worker information</DialogDescription>
                        </DialogHeader>
                        {selectedWorker && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h3 className="font-medium mb-2">Personal Information</h3>
                                <div className="space-y-2 text-sm">
                                  <div><strong>Name:</strong> {user?.name}</div>
                                  <div><strong>Email:</strong> {user?.email}</div>
                                  <div><strong>Phone:</strong> {user?.phone}</div>
                                  <div><strong>Address:</strong> {user?.address}</div>
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="font-medium mb-2">Work Information</h3>
                                <div className="space-y-2 text-sm">
                                  <div><strong>Skills:</strong> {selectedWorker.skills}</div>
                                  <div><strong>Category:</strong> {categories.find(c => c.category_id === selectedWorker.category_id)?.name}</div>
                                  <div><strong>Rating:</strong> {selectedWorker.rating}/5.0</div>
                                  <div><strong>Total Jobs:</strong> {selectedWorker.total_jobs}</div>
                                  <div><strong>Balance:</strong> ৳{selectedWorker.balance.toLocaleString()}</div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-medium mb-2">Verification Status</h3>
                              <div className="flex items-center space-x-2">
                                <Badge variant={
                                  selectedWorker.verification_status === 'approved' ? 'default' :
                                  selectedWorker.verification_status === 'pending' ? 'secondary' : 'destructive'
                                }>
                                  {selectedWorker.verification_status}
                                </Badge>
                                {selectedWorker.nid_card_url && (
                                  <Button variant="outline" size="sm">
                                    <FileText className="h-4 w-4 mr-2" />
                                    View NID
                                  </Button>
                                )}
                              </div>
                            </div>

                            {selectedWorker.verification_status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button 
                                  onClick={() => handleApproveWorker(selectedWorker.worker_id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="destructive">
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reject Worker</DialogTitle>
                                      <DialogDescription>
                                        Please provide a reason for rejecting this worker
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                        <Textarea
                                          id="rejection-reason"
                                          value={rejectionReason}
                                          onChange={(e) => setRejectionReason(e.target.value)}
                                          placeholder="Explain why this worker is being rejected..."
                                          rows={3}
                                        />
                                      </div>
                                      <div className="flex space-x-2">
                                        <Button 
                                          variant="destructive" 
                                          onClick={() => handleRejectWorker(selectedWorker.worker_id)}
                                        >
                                          Confirm Rejection
                                        </Button>
                                        <Button variant="outline" onClick={() => setRejectionReason('')}>
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}

                            {selectedWorker.verification_status === 'approved' && (
                              <div className="flex space-x-2">
                                <Button variant="outline" onClick={() => handleSuspendWorker(selectedWorker.worker_id)}>
                                  Suspend Worker
                                </Button>
                                <Button variant="outline">
                                  Adjust Balance
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {worker.verification_status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveWorker(worker.worker_id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => setSelectedWorker(worker)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}

                    {worker.nid_card_url && (
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View NID
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredWorkers.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No workers found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
