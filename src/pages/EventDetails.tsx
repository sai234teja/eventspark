
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Sparkles, ArrowLeft, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxCapacity: number;
  image: string;
  category: string;
  price: string;
  description: string;
  organizer: string;
}

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock event data - in real app, fetch from API
    const mockEvents: Event[] = [
      {
        id: 1,
        title: "Tech Innovation Summit 2024",
        date: "Dec 15, 2024",
        time: "9:00 AM - 6:00 PM",
        location: "San Francisco Convention Center",
        attendees: 450,
        maxCapacity: 500,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
        category: "Technology",
        price: "Free",
        description: "Join industry leaders for a day of innovation and networking. This summit will feature keynote speakers from top tech companies, interactive workshops, and networking sessions. Learn about the latest trends in AI, blockchain, and sustainable technology.",
        organizer: "TechEvents Inc."
      },
      {
        id: 2,
        title: "Creative Design Hackathon",
        date: "Jan 8, 2025",
        time: "48 Hours",
        location: "Virtual Event",
        attendees: 234,
        maxCapacity: 300,
        image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop",
        category: "Design",
        price: "$25",
        description: "48-hour design challenge with amazing prizes and mentorship. Collaborate with designers from around the world to solve real-world problems through innovative design solutions.",
        organizer: "Design Hub"
      }
    ];

    const foundEvent = mockEvents.find(e => e.id === parseInt(id || "0"));
    setEvent(foundEvent || null);

    // Check if user is already registered (mock)
    const user = localStorage.getItem("user");
    if (user && foundEvent) {
      setIsRegistered(Math.random() > 0.5); // Random for demo
    }
  }, [id]);

  const handleRegister = async () => {
    setIsLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      setIsRegistered(true);
      toast({
        title: "Registration Successful!",
        description: `You're now registered for ${event?.title}. Check your email for confirmation.`,
      });
      setIsLoading(false);
    }, 1500);
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
              <Badge variant="secondary" className="bg-purple-800/50 text-purple-200">
                {event.category}
              </Badge>
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
                <div className="flex items-center text-purple-100">
                  <MapPin className="h-5 w-5 mr-3 text-purple-300" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-purple-100">
                  <Users className="h-5 w-5 mr-3 text-purple-300" />
                  <span>{event.attendees}/{event.maxCapacity} registered</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-center p-6 bg-white/5 rounded-lg border border-purple-300/20">
                  <div className="text-3xl font-bold text-green-300 mb-2">{event.price}</div>
                  <div className="text-purple-200 text-sm">Registration Fee</div>
                </div>
                
                {!isRegistered ? (
                  <Button
                    onClick={handleRegister}
                    disabled={isLoading || event.attendees >= event.maxCapacity}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    {isLoading ? "Registering..." : 
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
    </div>
  );
};

export default EventDetails;
