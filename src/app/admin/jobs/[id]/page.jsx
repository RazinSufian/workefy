'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AdminJobDetailsPage() {
  const params = useParams();
  const { id } = params;
  const { data: session } = useSession();
  const [job, setJob] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [assignedWorker, setAssignedWorker] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const jobRes = await fetch(`/api/admin/jobs/${id}`);
        const jobData = await jobRes.json();
        setJob(jobData[0]);
      } catch (error) {
        console.error("Failed to fetch job details:", error);
      }
    };

    const fetchWorkers = async () => {
      try {
        const workersRes = await fetch('/api/workers');
        const workersData = await workersRes.json();
        setWorkers(workersData);
      } catch (error) {
        console.error("Failed to fetch workers:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const usersRes = await fetch('/api/users');
        const usersData = await usersRes.json();
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    const fetchJobAssignment = async () => {
      try {
        const assignmentRes = await fetch(`/api/job-assignments?job_id=${id}`);
        const assignmentData = await assignmentRes.json();
        if (assignmentData.length > 0) {
          setAssignedWorker(assignmentData[0]);
        }
      } catch (error) {
        console.error("Failed to fetch job assignment:", error);
      }
    };

    if (id) {
      fetchJobDetails();
      fetchWorkers();
      fetchUsers();
      fetchJobAssignment();
    }
  }, [id]);

  const handleAssignWorker = async () => {
    if (!selectedWorker) {
      toast.error('Please select a worker to assign.');
      return;
    }

    if (!session || !session.user) {
      toast.error('You must be logged in to assign a worker.');
      return;
    }

    try {
      let res;
      if (assignedWorker) {
        // Re-assign: PUT request to update the existing assignment
        res = await fetch(`/api/job-assignments?job_id=${id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ worker_id: selectedWorker }),
          });
      } else {
        // Assign: POST request to create a new assignment
        res = await fetch('/api/job-assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job_id: id,
            worker_id: selectedWorker,
            assigned_by_admin_user_id: session.user.id,
          }),
        });
      }

      if (!res.ok) {
        throw new Error('Failed to assign worker');
      }

      toast.success(`Worker ${assignedWorker ? 're-assigned' : 'assigned'} successfully!`);

      // Update job status to 'assigned' if it's not already
      if (job.status !== 'assigned') {
        const updatedJobRes = await fetch(`/api/admin/jobs/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'assigned' }),
        });
        const updatedJobData = await updatedJobRes.json();
        setJob(updatedJobData[0]);
      }

      // Re-fetch the assignment to update the UI
      const assignmentRes = await fetch(`/api/job-assignments?job_id=${id}`);
      const assignmentData = await assignmentRes.json();
      if (assignmentData.length > 0) {
        setAssignedWorker(assignmentData[0]);
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!job) {
    return <div>Loading...</div>;
  }

  const getWorkerName = (workerId) => {
    const worker = workers.find(w => w.worker_id === workerId);
    if (worker) {
      const user = users.find(u => u.user_id === worker.user_id);
      return user ? user.name : 'Unknown Worker';
    }
    return 'Unknown Worker';
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{job.title}</CardTitle>
          <CardDescription>{job.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Status:</strong> {job.status}</p>
          <p><strong>Budget:</strong> ${job.budget}</p>
          <p><strong>Location:</strong> {job.location}</p>

          {assignedWorker && (
            <div>
              <h3 className="font-semibold">Assigned Worker</h3>
              <p>{getWorkerName(assignedWorker.worker_id)}</p>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold">{assignedWorker ? 'Re-assign' : 'Assign'} Worker</h3>
            <Select onValueChange={setSelectedWorker}>
              <SelectTrigger>
                <SelectValue placeholder="Select a worker" />
              </SelectTrigger>
              <SelectContent>
                {workers.map(worker => (
                  <SelectItem key={worker.worker_id} value={worker.worker_id}>
                    {getWorkerName(worker.worker_id)} - (Rating: {worker.rating})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAssignWorker}>{assignedWorker ? 'Re-assign' : 'Assign'} Worker</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
