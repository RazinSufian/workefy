
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const CashoutRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/cashout-requests");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      toast.error("Failed to fetch cashout requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/cashout-requests/${id}/approve`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error("Approval failed");
      toast.success("Request approved");
      fetchRequests(); // Refresh the list
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`/api/cashout-requests/${id}/reject`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error("Rejection failed");
      toast.success("Request rejected");
      fetchRequests(); // Refresh the list
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Cashout Requests</h1>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Bank Name</TableHead>
                <TableHead>Bank Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.cashout_id}>
                  <TableCell>{req.worker_id}</TableCell>
                  <TableCell>৳{req.amount}</TableCell>
                  <TableCell>{req.bank_name}</TableCell>
                  <TableCell>{req.bank_account}</TableCell>
                  <TableCell>
                    <Badge variant={req.status === 'approved' ? 'default' : req.status === 'pending' ? 'secondary' : 'destructive'}>
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {req.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleApprove(req.cashout_id)}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(req.cashout_id)}>Reject</Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashoutRequestsPage;
