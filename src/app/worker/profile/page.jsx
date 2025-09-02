'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { User, Camera, ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

export default function WorkerProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [categories, setCategories] = useState([]);
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
        }
      } catch (error) {
        console.error("Failed to fetch worker profile data:", error);
      }
    };

    fetchData();
  }, []);

  if (!currentUser || !workerData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">Worker Profile</h1>
            </div>
            <Button asChild>
              <Link href="/worker/profile/edit">Edit Profile</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">JPG, PNG up to 5MB</p>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <p>{currentUser.name}</p>
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <p>{currentUser.phone}</p>
                  </div>
                </div>

                <div>
                  <Label>Address</Label>
                  <p>{currentUser.address}</p>
                </div>

                <div>
                  <Label>Bio</Label>
                  <p>{workerData.bio}</p>
                </div>
              </CardContent>
            </Card>

            {/* Work Details */}
            <Card>
              <CardHeader>
                <CardTitle>Work Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Skills</Label>
                  <p>{workerData.skills}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Work Category</Label>
                    <p>{categories.find(c => c.category_id === workerData.category_id)?.name}</p>
                  </div>

                  <div>
                    <Label>Hourly Rate (৳)</Label>
                    <p>{workerData.hourly_rate}</p>
                  </div>
                </div>

                <div>
                  <Label>Preferred Working Times</Label>
                  <div className="flex flex-wrap gap-2">
                    {workerData.preferred_times.split(', ').map(time => (
                      <Badge key={time} variant="secondary">{time}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Availability</CardTitle>
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
                            disabled
                          />
                          <Label htmlFor={`${slot.day}-morning`} className="text-sm">Morning</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${slot.day}-afternoon`}
                            checked={slot.afternoon}
                            disabled
                          />
                          <Label htmlFor={`${slot.day}-afternoon`} className="text-sm">Afternoon</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${slot.day}-evening`}
                            checked={slot.evening}
                            disabled
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Available for Work</Label>
                  </div>
                  <Switch
                    checked={workerData.is_available}
                    disabled
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Verification Status</span>
                    <Badge variant={workerData?.verification_status === 'approved' ? 'default' : 'secondary'}>
                      {workerData?.verification_status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
