'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Briefcase, Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userType, setUserType] = useState('');
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    // Worker specific
    skills: '',
    category: '',
    preferredTimes: [],
    nidFile: null,
    // Client specific
    safetyAgreement: false
  });

  useEffect(() => {
    const type = searchParams.get('type');
    if (type && ['worker', 'client'].includes(type)) {
      setUserType(type);
    }

    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        setCategories(await res.json());
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, [searchParams]);

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

    if (!userType) {
      toast.error('Please select a user type');
      return;
    }

    if (userType === 'worker' && !formData.nidFile) {
      toast.error('NID card upload is required for workers');
      return;
    }

    if (userType === 'client' && !formData.safetyAgreement) {
      toast.error('Safety agreement must be accepted');
      return;
    }

    try {
      // Step 1: Create the user
      const userRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          role: userType,
          agreement_signed: formData.safetyAgreement,
        }),
      });

      if (!userRes.ok) {
        throw new Error('Failed to create user');
      }

      const userData = await userRes.json();
      const userId = userData.result.insertId;

      // Step 2: Create the worker or client profile
      if (userType === 'worker') {
        const workerRes = await fetch('/api/workers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            skills: formData.skills,
            category_id: formData.category,
            preferred_times: formData.preferredTimes.join(', '),
            nid_card_url: '/uploads/placeholder.jpg', // Placeholder for now
          }),
        });

        if (!workerRes.ok) {
          throw new Error('Failed to create worker profile');
        }
      } else if (userType === 'client') {
        const clientRes = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            safety_agreement_accepted: formData.safetyAgreement,
          }),
        });

        if (!clientRes.ok) {
          throw new Error('Failed to create client profile');
        }
      }

      toast.success('Registration successful! Please wait for verification.');

      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Login successful!');
        router.push('/');
      }

    } catch (error) {
      console.error("Registration failed:", error);
      toast.error('Registration failed. Please try again.');
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Choose Account Type</CardTitle>
            <CardDescription>Select how you want to use our platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full h-12" onClick={() => setUserType('worker')}>
              Join as Worker
            </Button>
            <Button variant="outline" className="w-full h-12" onClick={() => setUserType('client')}>
              Join as Client
            </Button>
            <div className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setUserType('')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to account type
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Register as {userType === 'worker' ? 'Worker' : 'Client'}
            </CardTitle>
            <CardDescription>
              {userType === 'worker'
                ? 'Create your worker profile to start finding jobs'
                : 'Create your client account to hire workers'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Worker Specific Fields */}
              {userType === 'worker' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Worker Details</h3>

                  <div>
                    <Label htmlFor="skills">Skills *</Label>
                    <Textarea
                      id="skills"
                      placeholder="e.g., Plumbing, Electrical work, House cleaning"
                      value={formData.skills}
                      onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label>Work Category *</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                            {cat.name} - {cat.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Preferred Working Times *</Label>
                    <div className="mt-2 space-y-2">
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

                  <div>
                    <Label htmlFor="nid">NID Card Upload *</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <Label htmlFor="nid-upload" className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                              Click to upload your NID card
                            </span>
                            <Input
                              id="nid-upload"
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setFormData(prev => ({ ...prev, nidFile: file }));
                                }
                              }}
                            />
                          </Label>
                        </div>
                        {formData.nidFile && (
                          <p className="mt-2 text-sm text-green-600">
                            File selected: {formData.nidFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Client Specific Fields */}
              {userType === 'client' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Client Agreement</h3>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="safety-agreement"
                        checked={formData.safetyAgreement}
                        onCheckedChange={(checked) =>
                          setFormData(prev => ({ ...prev, safetyAgreement: !!checked }))
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor="safety-agreement" className="text-sm">
                          I accept responsibility for worker safety and any damage that may occur during the job.
                          I understand that I am liable for providing a safe working environment and proper equipment when necessary.
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg">
                Create {userType === 'worker' ? 'Worker' : 'Client'} Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
