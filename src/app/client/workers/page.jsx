'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Search, Filter, Star, MapPin, Phone, Mail, User, Briefcase } from 'lucide-react';
import { Worker, User, Category } from '@/types';

export default function FindWorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

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

  // Filter and sort workers
  let filteredWorkers = workers.filter(worker => 
    worker.verification_status === 'approved' && worker.is_available
  );

  if (searchTerm) {
    filteredWorkers = filteredWorkers.filter(worker => {
      const user = users.find(u => u.user_id === worker.user_id);
      return worker.skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user?.address.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }

  if (categoryFilter) {
    filteredWorkers = filteredWorkers.filter(worker => 
      worker.category_id.toString() === categoryFilter
    );
  }

  if (ratingFilter) {
    const minRating = parseFloat(ratingFilter);
    filteredWorkers = filteredWorkers.filter(worker => worker.rating >= minRating);
  }

  // Sort workers
  filteredWorkers.sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'jobs':
        return b.total_jobs - a.total_jobs;
      case 'name':
        const userA = users.find(u => u.user_id === a.user_id);
        const userB = users.find(u => u.user_id === b.user_id);
        return (userA?.name || '').localeCompare(userB?.name || '');
      default:
        return 0;
    }
  });

  const handleHireWorker = (workerId: number) => {
    // This would typically redirect to job posting with pre-selected worker
    console.log('Hiring worker:', workerId);
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
              <User className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">Find Workers</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filter Workers</CardTitle>
            <CardDescription>Find the perfect worker for your job</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by skills, name, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
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

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Min Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Rating</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0">4.0+ Stars</SelectItem>
                  <SelectItem value="3.5">3.5+ Stars</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="jobs">Most Experienced</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Available Workers ({filteredWorkers.length})</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map(worker => {
            const workerUser = users.find(u => u.user_id === worker.user_id);
            const category = categories.find(c => c.category_id === worker.category_id);
            return (
              <Card key={worker.worker_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{workerUser?.name}</CardTitle>
                      <CardDescription className="mt-1">{worker.skills}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{worker.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span>{category?.name} Work</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{workerUser?.address}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span><strong>Jobs Completed:</strong> {worker.total_jobs}</span>
                      <Badge variant="outline">Available</Badge>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedWorker(worker)}>
                            View Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{workerUser?.name}</DialogTitle>
                            <DialogDescription>Worker Profile Details</DialogDescription>
                          </DialogHeader>
                          {selectedWorker && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h3 className="font-medium mb-2">Contact Information</h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-4 w-4 text-gray-400" />
                                      <span>{users.find(u => u.user_id === selectedWorker.user_id)?.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Mail className="h-4 w-4 text-gray-400" />
                                      <span>{users.find(u => u.user_id === selectedWorker.user_id)?.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="h-4 w-4 text-gray-400" />
                                      <span>{users.find(u => u.user_id === selectedWorker.user_id)?.address}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="font-medium mb-2">Work Details</h3>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Skills:</strong> {selectedWorker.skills}</div>
                                    <div><strong>Category:</strong> {categories.find(c => c.category_id === selectedWorker.category_id)?.name}</div>
                                    <div><strong>Rating:</strong> {selectedWorker.rating}/5.0</div>
                                    <div><strong>Jobs Completed:</strong> {selectedWorker.total_jobs}</div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h3 className="font-medium mb-2">Availability</h3>
                                <div className="flex flex-wrap gap-2">
                                  {selectedWorker.preferred_times?.split(', ').map((time: string) => (
                                    <Badge key={time} variant="outline" className="capitalize">
                                      {time}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="flex space-x-2">
                                <Button onClick={() => handleHireWorker(selectedWorker.worker_id)} className="flex-1">
                                  Hire Directly
                                </Button>
                                <Button variant="outline" asChild>
                                  <Link href="/client/post-job">Post Job for Bidding</Link>
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button size="sm" onClick={() => handleHireWorker(worker.worker_id)}>
                        Hire Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredWorkers.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No workers found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setRatingFilter('');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
