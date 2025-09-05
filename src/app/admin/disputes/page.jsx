'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, AlertTriangle, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [disputesRes, jobsRes, usersRes, workersRes] = await Promise.all([
          fetch('/api/disputes'),
          fetch('/api/jobs'),
          fetch('/api/users'),
          fetch('/api/workers'),
        ]);

        setDisputes(await disputesRes.json());
        setJobs(await jobsRes.json());
        setUsers(await usersRes.json());
        setWorkers(await workersRes.json());
      } catch (error) {
        console.error("Failed to fetch disputes data:", error);
      }
    };

    fetchData();
  }, []);

  const handleResolveDispute = (disputeId, resolution) => {
    if (!resolutionNotes.trim()) {
      toast.error('Please provide resolution notes');
      return;
    }

    toast.success(`Dispute resolved in ${resolution.replace('_', ' ')}`);
    setResolutionNotes('');
    setSelectedDispute(null);
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
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h1 className="text-xl font-bold">Dispute Management</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Active Disputes ({disputes.length})</h2>
          <p className="text-gray-600">Resolve conflicts between clients and workers</p>
        </div>

        <div className="space-y-6">
          {disputes.map(dispute => {
            const job = jobs.find(j => j.job_id === dispute.job_id);
            const client = users.find(u => u.user_id === dispute.client_id);
            const worker = workers.find(w => w.worker_id === dispute.worker_id);
            const workerUser = users.find(u => u.user_id === worker?.user_id);

            return (
              <Card key={dispute.dispute_id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-red-800">
                        Dispute #{dispute.dispute_id} - {job?.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        <strong>Reason:</strong> {dispute.reason}
                      </CardDescription>
                    </div>
                    <Badge variant="destructive">
                      {dispute.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-2">Client Information</h3>
                        <div className="space-y-1 text-sm">
                          <div><strong>Name:</strong> {client?.name}</div>
                          <div><strong>Phone:</strong> {client?.phone}</div>
                          <div><strong>Email:</strong> {client?.email}</div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Worker Information</h3>
                        <div className="space-y-1 text-sm">
                          <div><strong>Name:</strong> {workerUser?.name}</div>
                          <div><strong>Phone:</strong> {workerUser?.phone}</div>
                          <div><strong>Rating:</strong> {worker?.rating}/5.0</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Job Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div><strong>Budget:</strong> ৳{job?.budget.toLocaleString()}</div>
                        <div><strong>Duration:</strong> {job?.duration_value} {job?.duration_type}(s)</div>
                        <div><strong>Location:</strong> {job?.location}</div>
                      </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-medium text-red-800 mb-2">Dispute Description</h3>
                      <p className="text-red-700 text-sm">{dispute.description}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedDispute(dispute)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Resolve Dispute
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Resolve Dispute #{dispute.dispute_id}</DialogTitle>
                            <DialogDescription>
                              Choose the appropriate resolution for this dispute
                            </DialogDescription>
                          </DialogHeader>
                          {selectedDispute && (
                            <div className="space-y-6">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium mb-2">Dispute Summary</h3>
                                <p className="text-sm text-gray-700">{selectedDispute.description}</p>
                              </div>

                              <div>
                                <Label htmlFor="resolution-notes">Resolution Notes</Label>
                                <Textarea
                                  id="resolution-notes"
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                  placeholder="Explain your decision and any actions taken..."
                                  rows={4}
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Button
                                  onClick={() => handleResolveDispute(selectedDispute.dispute_id, 'client_favor')}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Client Favor
                                </Button>

                                <Button
                                  onClick={() => handleResolveDispute(selectedDispute.dispute_id, 'worker_favor')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Worker Favor
                                </Button>

                                <Button
                                  onClick={() => handleResolveDispute(selectedDispute.dispute_id, 'partial_refund')}
                                  className="bg-yellow-600 hover:bg-yellow-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Partial Refund
                                </Button>
                              </div>

                              <div className="bg-yellow-50 p-4 rounded-lg">
                                <h4 className="font-medium text-yellow-800 mb-2">Resolution Options:</h4>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                  <li><strong>Client Favor:</strong> Full refund to client, no payment to worker</li>
                                  <li><strong>Worker Favor:</strong> Full payment to worker, no refund to client</li>
                                  <li><strong>Partial Refund:</strong> Split payment between client refund and worker payment</li>
                                </ul>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline">
                        Contact Client
                      </Button>

                      <Button variant="outline">
                        Contact Worker
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {disputes.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Disputes</h3>
              <p className="text-gray-500">All disputes have been resolved. Great job!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
