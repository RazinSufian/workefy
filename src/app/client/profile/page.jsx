'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { User, Camera, ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';

export default function ClientProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate getting the current user. In a real app, this would come from an auth context.
        const usersRes = await fetch('/api/users');
        const allUsers = await usersRes.json();
        setUsers(allUsers);
        const clientUser = allUsers.find((u) => u.role === 'client');
        setCurrentUser(clientUser);

        if (clientUser) {
          const [clientsRes, reviewsRes] = await Promise.all([
            fetch('/api/clients'),
            fetch(`/api/reviews?reviewee_id=${clientUser.user_id}`),
          ]);

          const allClients = await clientsRes.json();
          const currentClient = allClients.find((c) => c.user_id === clientUser.user_id);
          setClientData(currentClient);
          setReviews(await reviewsRes.json());
        }
      } catch (error) {
        console.error("Failed to fetch client profile data:", error);
      }
    };

    fetchData();
  }, []);

  if (!currentUser || !clientData) {
    return <div>Loading...</div>; // Or a proper loading skeleton
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">Client Profile</h1>
            </div>
            <Button asChild>
              <Link href="/client/profile/edit">Edit Profile</Link>
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
                    <Label>Email Address</Label>
                    <p>{currentUser.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone Number</Label>
                    <p>{currentUser.phone}</p>
                  </div>
                  <div>
                    <Label>Company (Optional)</Label>
                    <p>Tech Solutions Ltd.</p>
                  </div>
                </div>
                
                <div>
                  <Label>Address</Label>
                  <p>{currentUser.address}</p>
                </div>

                <div>
                  <Label>Bio</Label>
                  <p>Looking for reliable workers for various projects. We value quality work and timely completion.</p>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const reviewer = users.find(u => u.user_id === review.reviewer_id);
                    return (
                      <div key={review.review_id} className="border-b pb-4">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{reviewer?.name}</div>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${review.rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mt-2">{review.comment}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{clientData?.total_jobs_posted || 0}</div>
                    <div className="text-sm text-gray-500">Jobs Posted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{clientData?.rating || 0}/5.0</div>
                    <div className="text-sm text-gray-500">Your Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{new Date(currentUser.created_at).getFullYear()}</div>
                    <div className="text-sm text-gray-500">Member Since</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Agreement */}
            <Card>
              <CardHeader>
                <CardTitle>Safety Agreement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-800">Safety Agreement Status</div>
                    <div className="text-sm text-green-600">
                      You have accepted responsibility for worker safety and any damage during jobs
                    </div>
                  </div>
                  <Badge variant="default">Accepted</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive updates about your jobs via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive urgent updates via SMS</p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Credit Card ending in 4242</div>
                        <div className="text-sm text-gray-500">Expires 12/25</div>
                      </div>
                      <Badge variant="outline">Primary</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}