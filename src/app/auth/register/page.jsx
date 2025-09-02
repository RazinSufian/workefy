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
  const [uploading, setUploading] = useState(false);
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
    nidUrl: '', // Store the uploaded file URL
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
        const data = await res.json();
        console.log('Categories fetched:', data); // Debug log
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error('Failed to load categories');
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

  const handleFileUpload = async (file) => {
    if (!file) return null;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'nid');

      console.log('Uploading file:', file.name, 'Size:', file.size); // Debug log

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();
      console.log('Upload response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleNidFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and PDF files are allowed');
      return;
    }

    console.log('File selected:', file.name, 'Type:', file.type); // Debug log

    // Set the file in formData first
    setFormData(prev => ({ ...prev, nidFile: file }));

    // Upload the file
    const uploadedUrl = await handleFileUpload(file);
    if (uploadedUrl) {
      setFormData(prev => ({ ...prev, nidUrl: uploadedUrl }));
      toast.success('NID card uploaded successfully');
      console.log('NID URL set:', uploadedUrl); // Debug log
    } else {
      // Reset the file if upload failed
      setFormData(prev => ({ ...prev, nidFile: null, nidUrl: '' }));
    }
  };

  const validateForm = () => {
    if (!userType) {
      toast.error('Please select a user type');
      return false;
    }

    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return false;
    }

    if (!formData.password) {
      toast.error('Please enter a password');
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }

    if (!formData.address.trim()) {
      toast.error('Please enter your address');
      return false;
    }

    // Worker specific validation
    if (userType === 'worker') {
      if (!formData.skills.trim()) {
        toast.error('Please enter your skills');
        return false;
      }

      if (!formData.category) {
        toast.error('Please select a work category');
        return false;
      }

      if (formData.preferredTimes.length === 0) {
        toast.error('Please select at least one preferred working time');
        return false;
      }

      if (!formData.nidFile || !formData.nidUrl) {
        toast.error('Please upload your NID card');
        return false;
      }
    }

    // Client specific validation
    if (userType === 'client' && !formData.safetyAgreement) {
      toast.error('Safety agreement must be accepted');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log('Submitting form with data:', {
      ...formData,
      nidFile: formData.nidFile ? formData.nidFile.name : null
    }); // Debug log

    try {
      // Step 1: Create the user
      const userPayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        role: userType,
        agreement_signed: userType === 'client' ? formData.safetyAgreement : false,
      };

      console.log('Creating user with payload:', userPayload); // Debug log

      const userRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload),
      });

      const userData = await userRes.json();
      console.log('User creation response:', userData); // Debug log

      if (!userRes.ok) {
        throw new Error(userData.error || 'Failed to create user');
      }

      const userId = userData.result?.insertId || userData.id;
      if (!userId) {
        throw new Error('Failed to get user ID from response');
      }

      console.log('User created with ID:', userId); // Debug log

      // Step 2: Create the worker or client profile
      if (userType === 'worker') {
        const workerPayload = {
          user_id: userId,
          skills: formData.skills.trim(),
          category_id: parseInt(formData.category),
          preferred_times: formData.preferredTimes.join(', '),
          nid_card_url: formData.nidUrl,
          verification_status: 'pending',
          balance: 0,
          rating: 0,
          total_jobs: 0,
          is_available: true,
        };

        console.log('Creating worker with payload:', workerPayload); // Debug log

        const workerRes = await fetch('/api/workers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workerPayload),
        });

        const workerData = await workerRes.json();
        console.log('Worker creation response:', workerData); // Debug log

        if (!workerRes.ok) {
          throw new Error(workerData.error || 'Failed to create worker profile');
        }
      } else if (userType === 'client') {
        const clientPayload = {
          user_id: userId,
          safety_agreement_accepted: formData.safetyAgreement,
        };

        console.log('Creating client with payload:', clientPayload); // Debug log

        const clientRes = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientPayload),
        });

        const clientData = await clientRes.json();
        console.log('Client creation response:', clientData); // Debug log

        if (!clientRes.ok) {
          throw new Error(clientData.error || 'Failed to create client profile');
        }
      }

      toast.success('Registration successful! Logging you in...');

      // Step 3: Auto login
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        toast.error(`Login failed: ${result.error}`);
        // Still redirect to login page so user can manually login
        router.push('/auth/login');
      } else {
        toast.success('Login successful!');
        router.push('/');
      }

    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(`Registration failed: ${error.message}`);
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
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
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
                    {formData.preferredTimes.length > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Selected: {formData.preferredTimes.join(', ')}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="nid">NID Card Upload *</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <Label htmlFor="nid-upload" className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                              {uploading ? 'Uploading...' : 'Click to upload your NID card'}
                            </span>
                            <Input
                              id="nid-upload"
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={handleNidFileChange}
                              disabled={uploading}
                            />
                          </Label>
                        </div>
                        {formData.nidFile && (
                          <div className="mt-2">
                            <p className="text-sm text-blue-600">
                              File selected: {formData.nidFile.name}
                            </p>
                            {formData.nidUrl && (
                              <p className="text-sm text-green-600">
                                ✅ Upload successful - Ready for submission
                              </p>
                            )}
                          </div>
                        )}
                        {uploading && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Uploading NID card...</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: JPEG, PNG, PDF. Max size: 5MB
                    </p>
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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={uploading}
              >
                {uploading
                  ? 'Uploading...'
                  : `Create ${userType === 'worker' ? 'Worker' : 'Client'} Account`
                }
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