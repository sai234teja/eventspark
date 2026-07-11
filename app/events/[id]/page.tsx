"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, Users, Clock, Sparkles, ArrowLeft, Share2, Edit, Save, X } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useToast } from "@/hooks/use-toast";
import PaymentModal from "@/components/PaymentModal";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  city: string;
  country: string;
  attendees: number;
  maxCapacity: number;
  image: string;
  category: string;
  price: string;
  description: string;
  organizer: string;
  isCompleted: boolean;
  registrationOpen: boolean;
}

const EventDetails = () => {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Event>>({});

  useEffect(() => {
    // Mock event data with proper location details
    const mockEvents: Event[] = [
      {
        id: 1,
        title: "Tech Innovation Summit 2024",
        date: "Dec 15, 2024",
        time: "9:00 AM - 6:00 PM",
        location: "San Francisco Convention Center, 747 Howard St, San Francisco, CA 94103",
        city: "San Francisco",
        country: "USA",
        attendees: 450,
        maxCapacity: 500,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
        category: "Technology",
        price: "$75",
        description: "Join industry leaders for a day of innovation and networking. This summit will feature keynote speakers from top tech companies, interactive workshops, and networking sessions.",
        organizer: "TechEvents Inc.",
        isCompleted: false,
        registrationOpen: true
      },
      {
        id: 2,
        title: "Goa Beach Music Festival",
        date: "Jan 20, 2025",
        time: "6:00 PM - 2:00 AM",
        location: "Baga Beach, Calangute, North Goa, Goa 403516, India",
        city: "Goa",
        country: "India",
        attendees: 1200,
        maxCapacity: 1500,
        image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop",
        category: "Entertainment",
        price: "$50",
        description: "Experience the ultimate beach party with international DJs and local artists. Dance under the stars at Goa's most beautiful beach location.",
        organizer: "Goa Events",
        isCompleted: false,
        registrationOpen: true
      },
      {
        id: 3,
        title: "Mumbai Design Workshop",
        date: "Feb 5, 2025",
        time: "10:00 AM - 4:00 PM",
        location: "Design Hub Mumbai, Bandra West, Mumbai, Maharashtra 400050, India",
        city: "Mumbai",
        country: "India",
        attendees: 89,
        maxCapacity: 100,
        image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop",
        category: "Design",
        price: "$30",
        description: "Learn modern design principles from industry experts.",
        organizer: "Design Masters",
        isCompleted: false,
        registrationOpen: true
      },
      {
        id: 4,
        title: "Delhi Cultural Heritage Walk",
        date: "Jan 15, 2025",
        time: "8:00 AM - 12:00 PM",
        location: "Red Fort, Netaji Subhash Marg, Chandni Chowk, New Delhi, Delhi 110006, India",
        city: "Delhi",
        country: "India",
        attendees: 45,
        maxCapacity: 50,
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop",
        category: "Cultural",
        price: "Free",
        description: "Explore Delhi's rich cultural heritage with expert guides.",
        organizer: "Heritage Tours India",
        isCompleted: false,
        registrationOpen: true
      },
      {
        id: 5,
        title: "Goa Photography Retreat",
        date: "Mar 10, 2025",
        time: "7:00 AM - 6:00 PM",
        location: "Palolem Beach, Canacona, South Goa, Goa 403702, India",
        city: "Goa",
        country: "India",
        attendees: 25,
        maxCapacity: 30,
        image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=400&fit=crop",
        category: "Education",
        price: "$80",
        description: "Capture Goa's beauty with professional photography guidance.",
        organizer: "Goa Photography Club",
        isCompleted: false,
        registrationOpen: true
      }
    ];

    const foundEvent = mockEvents.find(e => e.id === parseInt(id || "0"));
    setEvent(foundEvent || null);
    setEditForm(foundEvent || {});

    // Check registration status
    const user = localStorage.getItem("user");
    if (user && foundEvent) {
      const registrations = JSON.parse(localStorage.getItem("registrations") || "[]");
      setIsRegistered(registrations.includes(foundEvent.id));
    }
  }, [id]);

  const handleRegistrationSuccess = () => {
    if (event) {
      const registrations = JSON.parse(localStorage.getItem("registrations") || "[]");
      if (!registrations.includes(event.id)) {
        registrations.push(event.id);
        localStorage.setItem("registrations", JSON.stringify(registrations));
        setIsRegistered(true);
        
        // Update attendee count
        setEvent(prev => prev ? { ...prev, attendees: prev.attendees + 1 } : null);
        
        // Trigger storage event to update other components
        window.dispatchEvent(new Event('storage'));
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Event link has been copied to clipboard.",
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (event && editForm) {
      const updatedEvent = { ...event, ...editForm };
      setEvent(updatedEvent);
      setIsEditing(false);
      toast({
        title: "Event Updated!",
        description: "Event details have been successfully updated.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditForm(event || {});
    setIsEditing(false);
  };

  const handleCompleteEvent = () => {
    if (event) {
      setEvent(prev => prev ? { ...prev, isCompleted: true, registrationOpen: false } : null);
      toast({
        title: "Event Completed!",
        description: "Event has been marked as completed and registration is now closed.",
      });
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <Link href="/events">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Browse Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b border-purple-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center space-x-4">
            <Link href="/events">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20 overflow-hidden">
          <div className="aspect-video overflow-hidden">
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-800/50 text-purple-200">
                  {event.category}
                </Badge>
                {event.isCompleted && (
                  <Badge className="bg-red-600 text-white">Event Completed</Badge>
                )}
                {!event.registrationOpen && !event.isCompleted && (
                  <Badge className="bg-orange-600 text-white">Registration Closed</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="border-purple-300/30 text-purple-100 hover:bg-purple-800/50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {/* Edit button for event organizers */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isEditing ? handleSaveEdit : handleEdit}
                  className="border-purple-300/30 text-purple-100 hover:bg-purple-800/50"
                >
                  {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                  {isEditing ? "Save" : "Edit"}
                </Button>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="border-red-300/30 text-red-100 hover:bg-red-800/50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-purple-200">Event Title</Label>
                  <Input
                    value={editForm.title || ""}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-white/5 border-purple-300/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-purple-200">Description</Label>
                  <Textarea
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-white/5 border-purple-300/30 text-white"
                  />
                </div>
              </div>
            ) : (
              <>
                <CardTitle className="text-3xl text-white mt-4">{event.title}</CardTitle>
                <CardDescription className="text-purple-200">
                  Organized by {event.organizer}
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center text-purple-100">
                  <Calendar className="h-5 w-5 mr-3 text-purple-300" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-purple-100">
                  <Clock className="h-5 w-5 mr-3 text-purple-300" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-start text-purple-100">
                  <MapPin className="h-5 w-5 mr-3 text-purple-300 mt-0.5" />
                  <div>
                    <div className="font-medium">{event.location}</div>
                    <div className="text-sm text-purple-300">{event.city}, {event.country}</div>
                  </div>
                </div>
                <div className="flex items-center text-purple-100">
                  <Users className="h-5 w-5 mr-3 text-purple-300" />
                  <span>{event.attendees}/{event.maxCapacity} registered</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-center p-6 bg-white/5 rounded-lg border border-purple-300/20">
                  <div className="text-3xl font-bold text-green-300 mb-2">
                    {event.price === "Free" ? "Free" : `₹${parseFloat(event.price.replace('$', '')) * 75}`}
                  </div>
                  <div className="text-purple-200 text-sm">Registration Fee</div>
                </div>
                
                {!isRegistered ? (
                  <Button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={!event.registrationOpen || event.isCompleted || event.attendees >= event.maxCapacity}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    {event.isCompleted ? "Event Completed" :
                     !event.registrationOpen ? "Registration Closed" :
                     event.attendees >= event.maxCapacity ? "Event Full" : "Register Now"}
                  </Button>
                ) : (
                  <div className="text-center">
                    <Badge className="bg-green-600 text-white mb-2">✓ Registered</Badge>
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full border-purple-300 text-purple-100 hover:bg-purple-800/50">
                        View My Tickets
                      </Button>
                    </Link>
                  </div>
                )}
                
                {/* Event management buttons for organizers */}
                {!event.isCompleted && (
                  <Button
                    onClick={handleCompleteEvent}
                    variant="outline"
                    className="w-full border-red-300 text-red-100 hover:bg-red-800/50"
                  >
                    Mark Event as Completed
                  </Button>
                )}
              </div>
            </div>

            <div className="border-t border-purple-300/20 pt-6">
              <h3 className="text-xl font-semibold text-white mb-3">About This Event</h3>
              <p className="text-purple-100 leading-relaxed">{event.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handleRegistrationSuccess}
        eventTitle={event.title}
        price={event.price}
      />
    </div>
  );
};

export default EventDetails;
