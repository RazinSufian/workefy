"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Star } from "lucide-react";

const JobDetailsPage = () => {
  const { data: session } = useSession();
  const params = useParams();
  const { id } = params;

  const [job, setJob] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/jobs/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch job details");
        }
        const data = await response.json();
        setJob(data);

        // Fetch client data
        const clientResponse = await fetch(`/api/clients/${data.client_id}`);
        if (!clientResponse.ok) {
            throw new Error("Failed to fetch client details");
        }
        const clientData = await clientResponse.json();
        setClient(clientData);

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!session || session.user.role !== "worker") {
      toast.error("You must be logged in as a worker to place a bid.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/biddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: id,
          worker_id: session.user.id, // Assuming session.user.id is the worker_id
          bid_amount: parseFloat(bidAmount),
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit bid");
      }

      toast.success("Bid submitted successfully!");
      // Optionally, redirect or update UI
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: id,
          reviewer_id: session.user.id,
          reviewee_id: client.user_id,
          rating,
          comment,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit review');
      }

      toast.success('Review submitted successfully!');
      setRating(0);
      setComment('');
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error('Failed to submit review. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!job) {
    return <div>Job not found.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{job.title}</CardTitle>
          <CardDescription>Posted by Client #{job.client_id}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">{job.description}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary">Budget: ${job.budget}</Badge>
            <Badge variant="secondary">
              Duration: {job.duration_value} {job.duration_type}(s)
            </Badge>
            <Badge variant="outline">{job.workers_needed} worker(s) needed</Badge>
            <Badge variant="outline">{job.location}</Badge>
          </div>

          {job.status === 'completed' && (
            <div className="my-4">
              <h3 className="font-medium mb-2">Leave a Review for the Client</h3>
              <div className="flex items-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer ${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              <Textarea
                placeholder="Write your review here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-2"
              />
              <Button onClick={handleReviewSubmit}>Submit Review</Button>
            </div>
          )}

          {job.job_type === 'bidding' && job.status === 'posted' && (
            <div>
              <h2 className="text-2xl font-bold mt-8 mb-4">Place Your Bid</h2>
              <form onSubmit={handleBidSubmit}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="bidAmount">Your Bid Amount ($)</Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      placeholder="e.g., 450"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="message">Message to the Client</Label>
                    <Textarea
                      id="message"
                      placeholder="Explain why you are a good fit for this job..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Bid"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDetailsPage;