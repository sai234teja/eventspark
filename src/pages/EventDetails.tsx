
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Sparkles, ArrowLeft, Share2 } from "lucide-react";
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
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    // Mock event data with location and status
    const mockEvents: Event[] = [
      {
        id: 1,
        title: "Tech Innovation Summit 2024",
        date: "Dec 15, 2024",
        time: "9:00 AM - 6:00 PM",
        location: "San Francisco Convention Center, 747 Howard St",
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
        location: "Baga Beach, North Goa",
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
      }
    ];

    const foundEvent = mockEvents.find(e => e.id === parseInt(id || "0"));
    setEvent(foundEvent || null);

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
      registrations.push(event.id);
      localStorage.setItem("registrations", JSON.stringify(registrations));
      setIsRegistered(true);
      
      // Update attendee count
      setEvent(prev => prev ? { ...prev, attendees: prev.attendees + 1 } : null);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Event link has been copied to clipboard.",
    });
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <Link to="/events">
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
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-purple-300" />
            <span className="text-2xl font-bold text-white">EventSpark</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/events">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
            <Link to="/dashboard">
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="border-purple-300/30 text-purple-100 hover:bg-purple-800/50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            <CardTitle className="text-3xl text-white mt-4">{event.title}</CardTitle>
            <CardDescription className="text-purple-200">
              Organized by {event.organizer}
            </CardDescription>
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
                    <div>{event.location}</div>
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
                    <Badge className="bg-green-600 text-white mb-2">Already Registered</Badge>
                    <Link to="/dashboard">
                      <Button variant="outline" className="w-full border-purple-300 text-purple-100 hover:bg-purple-800/50">
                        View My Tickets
                      </Button>
                    </Link>
                  </div>
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
