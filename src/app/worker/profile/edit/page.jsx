'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, User, Upload, Save, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function EditWorkerProfilePage() {
  const router = useRouter();
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
    profileImage: null,
    nidImage: null
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser || !workerData) {
      toast.error('Could not identify worker account.');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    data.append('skills', formData.skills);
    data.append('category_id', formData.category);
    data.append('preferred_times', formData.preferredTimes.join(', '));
    data.append('is_available', formData.isAvailable);
    if (formData.nidImage) {
      data.append('nidImage', formData.nidImage);
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
          body: data,
        }
      );

      if (!workerRes.ok) {
        throw new Error('Failed to update worker profile');
      }

      toast.success('Profile updated successfully!');
      router.push('/worker/profile');
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
            <Button variant="ghost" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
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

            {/* NID Verification */}
            <Card>
              <CardHeader>
                <CardTitle>NID Verification</CardTitle>
                <CardDescription>Upload a clear image of your NID for verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="w-32 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <Label htmlFor="nid-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload NID
                        </span>
                      </Button>
                      <Input
                        id="nid-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData(prev => ({ ...prev, nidImage: file }));
                          }
                        }}
                      />
                    </Label>
                    <p className="text-sm text-gray-500 mt-2">JPG, PNG up to 5MB</p>
                  </div>
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
                <Link href="/worker/profile">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
