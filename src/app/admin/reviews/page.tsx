'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { useProductStore } from '@/store/productStore';
import { 
  Search, 
  Filter, 
  Trash2, 
  Check, 
  X, 
  Star, 
  Eye,
  Loader2,
  ShieldCheck,
  Clock,
  AlertCircle,
  MessageSquare,
  Download
} from 'lucide-react';

interface Review {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  video?: string;
  variant?: {
    color?: string;
    size?: string;
    material?: string;
  };
  isVerifiedPurchase: boolean;
  likes: number;
  helpful: number;
  sellerReply?: {
    reply: string;
    date: string;
    sellerName: string;
  };
  reports?: Array<{
    userId: string;
    reason: string;
    date: string;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  sessionId?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const { success, error } = useToast();
  const { refetchProducts } = useProductStore();

  useEffect(() => {
    fetchReviews();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews?all=true');
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      error('Failed to fetch reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const handleApprove = async (reviewId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, status: 'approved' }),
      });
      const data = await response.json();
      if (data.success) {
        success('Review approved successfully');
        fetchReviews();
      } else {
        error(data.error || 'Failed to approve review');
      }
    } catch (err) {
      error('Failed to approve review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (reviewId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, status: 'rejected' }),
      });
      const data = await response.json();
      if (data.success) {
        success('Review rejected successfully');
        fetchReviews();
      } else {
        error(data.error || 'Failed to reject review');
      }
    } catch (err) {
      error('Failed to reject review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    setReviewToDelete(reviews.find(r => r.id === reviewId) || null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/reviews?id=${reviewToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        success('Review deleted successfully');
        setIsDeleteDialogOpen(false);
        setReviewToDelete(null);
        fetchReviews();
        // Refresh product store to update rating and review count immediately on product pages
        await refetchProducts();
      } else {
        error(data.error || 'Failed to delete review');
      }
    } catch (err) {
      error('Failed to delete review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkVerified = async (reviewId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, isVerifiedPurchase: true }),
      });
      const data = await response.json();
      if (data.success) {
        success('Review marked as verified purchase');
        fetchReviews();
      } else {
        error(data.error || 'Failed to mark as verified');
      }
    } catch (err) {
      error('Failed to mark as verified');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSellerReply = async () => {
    if (!selectedReview || !replyText.trim()) {
      error('Please enter a reply');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/reviews/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: selectedReview.id,
          reply: replyText.trim(),
          sellerName: 'Alhamd Collection',
        }),
      });
      const data = await response.json();
      if (data.success) {
        success('Reply added successfully');
        setReplyText('');
        setIsReplyDialogOpen(false);
        fetchReviews();
      } else {
        error(data.error || 'Failed to add reply');
      }
    } catch (err) {
      error('Failed to add reply');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportReviews = () => {
    const csvContent = [
      ['ID', 'Product', 'Customer', 'Email', 'Rating', 'Title', 'Comment', 'Status', 'Verified', 'Date'],
      ...filteredReviews.map(r => [
        r.id,
        getProductName(r.productId),
        r.customerName,
        r.customerEmail,
        r.rating,
        r.title || '',
        r.comment.replace(/,/g, ';'),
        r.status,
        r.isVerifiedPurchase ? 'Yes' : 'No',
        new Date(r.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reviews-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    success('Reviews exported successfully');
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getProductName(review.productId).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Review Management</h1>
              <p className="text-muted-foreground">Manage and moderate customer reviews</p>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExportReviews}
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                    <p className="text-2xl font-bold">{reviews.length}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{reviews.filter(r => r.status === 'pending').length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold">{reviews.filter(r => r.status === 'approved').length}</p>
                  </div>
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold">{reviews.filter(r => r.status === 'rejected').length}</p>
                  </div>
                  <X className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No reviews found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          {getStatusBadge(review.status)}
                          {review.isVerifiedPurchase && (
                            <Badge className="bg-blue-500">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        <div className="mb-2">
                          <p className="font-semibold">{review.customerName}</p>
                          <p className="text-sm text-muted-foreground">{review.customerEmail}</p>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          Product: {getProductName(review.productId)}
                        </p>
                        
                        <p className="text-muted-foreground mb-3">{review.comment}</p>
                        
                        {/* Seller Reply Display */}
                        {review.sellerReply && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-sm">{review.sellerReply.sellerName}</span>
                              <Badge className="bg-primary text-xs">Seller</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{review.sellerReply.reply}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(review.sellerReply.date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Dialog open={isViewDialogOpen && selectedReview?.id === review.id} onOpenChange={(open: boolean) => {
                          setIsViewDialogOpen(open);
                          if (!open) setSelectedReview(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReview(review)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Review Details</DialogTitle>
                            </DialogHeader>
                            {selectedReview && (
                              <div className="space-y-4">
                                <div>
                                  <p className="font-semibold">{selectedReview.customerName}</p>
                                  <p className="text-sm text-muted-foreground">{selectedReview.customerEmail}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < selectedReview.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  {getStatusBadge(selectedReview.status)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Product: {getProductName(selectedReview.productId)}
                                </p>
                                {selectedReview.title && (
                                  <p className="font-medium">{selectedReview.title}</p>
                                )}
                                <p className="text-muted-foreground">{selectedReview.comment}</p>
                                {selectedReview.variant && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedReview.variant.color && (
                                      <Badge variant="outline">Color: {selectedReview.variant.color}</Badge>
                                    )}
                                    {selectedReview.variant.size && (
                                      <Badge variant="outline">Size: {selectedReview.variant.size}</Badge>
                                    )}
                                    {selectedReview.variant.material && (
                                      <Badge variant="outline">Material: {selectedReview.variant.material}</Badge>
                                    )}
                                  </div>
                                )}
                                {selectedReview.images && selectedReview.images.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedReview.images.map((img, i) => (
                                      <div key={i} className="relative w-16 h-16">
                                        <Image src={img} alt={`Review ${i}`} fill className="object-cover rounded" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {selectedReview.sellerReply && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="font-semibold text-sm">{selectedReview.sellerReply.sellerName} (Seller)</p>
                                    <p className="text-sm text-muted-foreground">{selectedReview.sellerReply.reply}</p>
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  Submitted: {new Date(selectedReview.createdAt).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Seller Reply Button */}
                        <Dialog open={isReplyDialogOpen && selectedReview?.id === review.id} onOpenChange={(open: boolean) => {
                          setIsReplyDialogOpen(open);
                          if (!open) {
                            setSelectedReview(null);
                            setReplyText('');
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReview(review)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Reply
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reply to Review</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="font-semibold">{selectedReview?.customerName}</p>
                                <p className="text-sm text-muted-foreground">{selectedReview?.comment}</p>
                              </div>
                              <Textarea
                                placeholder="Write your reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={4}
                              />
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsReplyDialogOpen(false);
                                    setReplyText('');
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleSellerReply}
                                  disabled={isProcessing}
                                >
                                  {isProcessing ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Sending...
                                    </>
                                  ) : (
                                    'Send Reply'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {review.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(review.id)}
                              disabled={isProcessing}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(review.id)}
                              disabled={isProcessing}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {!review.isVerifiedPurchase && review.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkVerified(review.id)}
                            disabled={isProcessing}
                          >
                            <ShieldCheck className="h-4 w-4 mr-1" />
                            Mark Verified
                          </Button>
                        )}
                        
                        <Dialog open={isDeleteDialogOpen && reviewToDelete?.id === review.id} onOpenChange={(open: boolean) => {
                          setIsDeleteDialogOpen(open);
                          if (!open) setReviewToDelete(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(review.id)}
                              disabled={isProcessing}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Review</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-muted-foreground">
                                Are you sure you want to delete this review by <strong>{reviewToDelete?.customerName}</strong>?
                                This action cannot be undone.
                              </p>
                              {reviewToDelete && (
                                <div className="p-3 bg-muted rounded-lg">
                                  <p className="text-sm font-medium mb-1">{reviewToDelete.comment}</p>
                                  <p className="text-xs text-muted-foreground">Product: {getProductName(reviewToDelete.productId)}</p>
                                </div>
                              )}
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    setReviewToDelete(null);
                                  }}
                                  disabled={isProcessing}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={confirmDelete}
                                  disabled={isProcessing}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {isProcessing ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    'Delete Review'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
      <ToastContainer />
    </>
  );
}
