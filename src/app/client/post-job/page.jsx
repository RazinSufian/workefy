'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { Category, User, Client } from '@/types';
import Link from 'next/link';

export default function PostJobPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    durationType: '',
    durationValue: '',
    workersNeeded: '1',
    budget: '',
    jobType: 'direct_hire', // direct_hire or bidding
    paymentType: 'online', // online or manual
    startDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, usersRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/users'),
        ]);

        setCategories(await categoriesRes.json());

        const allUsers = await usersRes.json();
        const clientUser = allUsers.find((u) => u.role === 'client');
        setCurrentUser(clientUser);

        if (clientUser) {
          const clientsRes = await fetch('/api/clients');
          const allClients = await clientsRes.json();
          const currentClient = allClients.find((c) => c.user_id === clientUser.user_id);
          setClientData(currentClient);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.budget) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!clientData) {
      toast.error('Could not identify client account.');
      return;
    }

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          client_id: clientData.client_id,
          category_id: formData.category,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to post job');
      }

      toast.success('Job posted successfully!');
      setTimeout(() => {
        router.push('/client/dashboard');
      }, 2000);

    } catch (error) {
      console.error("Failed to post job:", error);
      toast.error('Failed to post job. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/client/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">Post a Job</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create Job Posting</CardTitle>
              <CardDescription>
                Fill in the details below to post your job and start receiving applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Job Details</h3>
                  
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., House Cleaning Service"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the work that needs to be done..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Work Category *</Label>
                      <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g., Gulshan, Dhaka"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Duration and Workers */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Job Requirements</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Duration Type</Label>
                      <Select onValueChange={(value) => setFormData(prev => ({ ...prev, durationType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hour">Hour(s)</SelectItem>
                          <SelectItem value="day">Day(s)</SelectItem>
                          <SelectItem value="week">Week(s)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="durationValue">Duration Value</Label>
                      <Input
                        id="durationValue"
                        type="number"
                        min="1"
                        value={formData.durationValue}
                        onChange={(e) => setFormData(prev => ({ ...prev, durationValue: e.target.value }))}
                        placeholder="e.g., 3"
                      />
                    </div>

                    <div>
                      <Label htmlFor="workersNeeded">Workers Needed</Label>
                      <Input
                        id="workersNeeded"
                        type="number"
                        min="1"
                        value={formData.workersNeeded}
                        onChange={(e) => setFormData(prev => ({ ...prev, workersNeeded: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget">Budget (৳) *</Label>
                      <Input
                        id="budget"
                        type="number"
                        min="1"
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                        placeholder="e.g., 5000"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Hiring Type */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Hiring Method</h3>
                  
                  <RadioGroup value={formData.jobType} onValueChange={(value) => setFormData(prev => ({ ...prev, jobType: value }))}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="direct_hire" id="direct_hire" />
                      <Label htmlFor="direct_hire">Direct Hire - Choose workers directly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bidding" id="bidding" />
                      <Label htmlFor="bidding">Accept Bids - Let workers bid on your job</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Payment Method</h3>
                  
                  <RadioGroup value={formData.paymentType} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentType: value }))}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online">Online Payment - Automatic processing (15% platform fee)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual">Manual Payment - Pay directly to worker</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Important Notice</h4>
                  <p className="text-sm text-blue-800">
                    By posting this job, you acknowledge that you are responsible for worker safety 
                    and any damage that may occur during the job execution. Please ensure proper 
                    safety measures are in place.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="flex-1">
                    Post Job
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
