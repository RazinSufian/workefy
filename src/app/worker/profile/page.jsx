'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, User, Upload, Save, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { User, Worker, Category } from '@/types';

export default function WorkerProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    skills: '',
    category: '',
    preferredTimes: [],
    isAvailable: true,
    hourlyRate: '500',
    bio: 'Experienced worker with 5+ years in the field. Committed to quality work and customer satisfaction.',
    profileImage: null
  });

  const [availabilitySlots, setAvailabilitySlots] = useState([
    { day: 'Monday', morning: true, afternoon: false, evening: false },
    { day: 'Tuesday', morning: true, afternoon: true, evening: false },
    { day: 'Wednesday', morning: false, afternoon: true, evening: false },
    { day: 'Thursday', morning: true, afternoon: false, evening: true },
    { day: 'Friday', morning: true, afternoon: true, evening: false },
    { day: 'Saturday', morning: false, afternoon: false, evening: false },
    { day: 'Sunday', morning: false, afternoon: false, evening: false }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await fetch('/api/users');
        const allUsers = await usersRes.json();
        const workerUser = allUsers.find((u) => u.role === 'worker');
        setCurrentUser(workerUser);

        if (workerUser) {
          const [workersRes, categoriesRes] = await Promise.all([
            fetch('/api/workers'),
            fetch('/api/categories'),
          ]);

          const allWorkers = await workersRes.json();
          const currentWorker = allWorkers.find((w) => w.user_id === workerUser.user_id);
          setWorkerData(currentWorker);
          setCategories(await categoriesRes.json());

          if (currentWorker) {
            setFormData(prev => ({
              ...prev,
              name: workerUser.name,
              phone: workerUser.phone,
              address: workerUser.address,
              skills: currentWorker.skills,
              category: currentWorker.category_id.toString(),
              preferredTimes: currentWorker.preferred_times.split(', '),
              isAvailable: currentWorker.is_available,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch worker profile data:", error);
      }
    };

    fetchData();
  }, []);

  const handleTimeChange = (time, checked) => {
    setFormData(prev => ({
      ...prev,
      preferredTimes: checked 
        ? [...prev.preferredTimes, time]
        : prev.preferredTimes.filter(t => t !== time)
    }));
  };

  const handleAvailabilityChange = (dayIndex, timeSlot, checked) => {
    setAvailabilitySlots(prev => prev.map((slot, index) => 
      index === dayIndex ? { ...slot, [timeSlot]: checked } : slot
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser || !workerData) {
      toast.error('Could not identify worker account.');
      return;
    }

    try {
      const userRes = await fetch(`/api/users/${currentUser.user_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
          }),
        }
      );

      if (!userRes.ok) {
        throw new Error('Failed to update user profile');
      }

      const workerRes = await fetch(`/api/workers/${workerData.worker_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skills: formData.skills,
            category_id: formData.category,
            preferred_times: formData.preferredTimes.join(', '),
            is_available: formData.isAvailable,
          }),
        }
      );

      if (!workerRes.ok) {
        throw new Error('Failed to update worker profile');
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  if (!currentUser || !workerData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <User className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">Edit Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Upload a professional photo to build trust with clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <Label htmlFor="profile-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </span>
                      </Button>
                      <Input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData(prev => ({ ...prev, profileImage: file }));
                          }
                        }}
                      />
                    </Label>
                    <p className="text-sm text-gray-500 mt-2">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell clients about your experience and expertise..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Work Details */}
            <Card>
              <CardHeader>
                <CardTitle>Work Details</CardTitle>
                <CardDescription>Manage your skills and work preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="skills">Skills</Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                    placeholder="e.g., Plumbing, Electrical work, House cleaning"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Work Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
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
                    <Label htmlFor="hourlyRate">Hourly Rate (৳)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Preferred Working Times</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['morning', 'afternoon', 'evening', 'night'].map(time => (
                      <div key={time} className="flex items-center space-x-2">
                        <Checkbox
                          id={time}
                          checked={formData.preferredTimes.includes(time)}
                          onCheckedChange={(checked) => handleTimeChange(time, !!checked)}
                        />
                        <Label htmlFor={time} className="capitalize">{time}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Availability</CardTitle>
                <CardDescription>Set your available time slots for each day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availabilitySlots.map((slot, index) => (
                    <div key={slot.day} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="font-medium w-20">{slot.day}</div>
                      <div className="flex space-x-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${slot.day}-morning`}
                            checked={slot.morning}
                            onCheckedChange={(checked) => handleAvailabilityChange(index, 'morning', !!checked)}
                          />
                          <Label htmlFor={`${slot.day}-morning`} className="text-sm">Morning</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${slot.day}-afternoon`}
                            checked={slot.afternoon}
                            onCheckedChange={(checked) => handleAvailabilityChange(index, 'afternoon', !!checked)}
                          />
                          <Label htmlFor={`${slot.day}-afternoon`} className="text-sm">Afternoon</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${slot.day}-evening`}
                            checked={slot.evening}
                            onCheckedChange={(checked) => handleAvailabilityChange(index, 'evening', !!checked)}
                          />
                          <Label htmlFor={`${slot.day}-evening`} className="text-sm">Evening</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="availability">Available for Work</Label>
                    <p className="text-sm text-gray-500">Turn off to stop receiving job offers</p>
                  </div>
                  <Switch
                    id="availability"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))}
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Verification Status</span>
                    <Badge variant={workerData?.verification_status === 'approved' ? 'default' : 'secondary'}>
                      {workerData?.verification_status}
                    </Badge>
                  </div>
                  {workerData?.verification_status === 'pending' && (
                    <p className="text-sm text-yellow-600">Your profile is under review. You'll be notified once approved.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/worker/dashboard">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
