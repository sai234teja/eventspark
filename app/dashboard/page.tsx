"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OrganizationSwitcher } from "@/components/OrganizationSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  IndianRupee,
  Edit,
  Eye,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/RoleGuard";
import { Permission } from "@/types/rbac";

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

const Dashboard = () => {
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { toast } = useToast();

  const allEvents: Event[] = [
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

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const registrations = JSON.parse(localStorage.getItem("registrations") || "[]");
      const registered = allEvents.filter(event => registrations.includes(event.id));
      setRegisteredEvents(registered);
      
      // Mock created events (in real app, this would come from API)
      const created = allEvents.filter(event => event.organizer === "User Created Events");
      setCreatedEvents(created);
    }
  }, []);

  const handleDeleteEvent = (eventId: number) => {
    // Remove from created events
    setCreatedEvents(prev => prev.filter(event => event.id !== eventId));
    toast({
      title: "Event Deleted",
      description: "Event has been successfully deleted.",
    });
  };

  const totalRevenue = registeredEvents.reduce((sum, event) => {
    const price = event.price === "Free" ? 0 : parseFloat(event.price.replace('$', '')) * 75;
    return sum + price;
  }, 0);

  const AnalyticsView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{registeredEvents.length}</div>
            <p className="text-purple-200 text-xs">Registered events</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300 flex items-center">
              <IndianRupee className="h-5 w-5 mr-1" />
              {totalRevenue.toLocaleString()}
            </div>
            <p className="text-purple-200 text-xs">From registrations</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Created Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{createdEvents.length}</div>
            <p className="text-purple-200 text-xs">Events you organized</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Avg. Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {registeredEvents.length > 0 ? 
                Math.round(registeredEvents.reduce((sum, event) => sum + event.attendees, 0) / registeredEvents.length) : 0}
            </div>
            <p className="text-purple-200 text-xs">Per event</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
        <CardHeader>
          <CardTitle className="text-white">Event Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {registeredEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">{event.title}</h4>
                  <p className="text-purple-200 text-sm">{event.city}, {event.country}</p>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{event.attendees}/{event.maxCapacity}</div>
                  <div className="text-purple-200 text-sm">
                    {Math.round((event.attendees / event.maxCapacity) * 100)}% filled
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b border-purple-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-purple-300" />
            <span className="text-2xl font-bold text-white">EventSpark</span>
          </Link>
          <div className="flex items-center space-x-4">
            <OrganizationSwitcher />
            <Link href="/events">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Browse Events
              </Button>
            </Link>
            <RoleGuard require={Permission.CREATE_EVENT}>
              <Link href="/create-event">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Create Event
                </Button>
              </Link>
            </RoleGuard>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-xl text-purple-200">Manage your events and view analytics</p>
          </div>
          <Button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showAnalytics ? "Hide Analytics" : "View Analytics"}
          </Button>
        </div>

        {showAnalytics ? (
          <AnalyticsView />
        ) : (
          <Tabs defaultValue="registered" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="registered" className="text-white data-[state=active]:bg-purple-600">
                My Tickets ({registeredEvents.length})
              </TabsTrigger>
              <TabsTrigger value="created" className="text-white data-[state=active]:bg-purple-600">
                Created Events ({createdEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="registered" className="space-y-6">
              {registeredEvents.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
                  <CardContent className="text-center py-12">
                    <h3 className="text-2xl font-bold text-white mb-4">No Events Registered</h3>
                    <p className="text-purple-200 mb-6">You haven't registered for any events yet.</p>
                    <Link href="/events">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        Browse Events
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registeredEvents.map((event) => (
                    <Card key={event.id} className="bg-white/10 backdrop-blur-sm border-purple-300/20 overflow-hidden">
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
                          {event.isCompleted && (
                            <Badge className="bg-red-600 text-white">Completed</Badge>
                          )}
                        </div>
                        <CardTitle className="text-white">{event.title}</CardTitle>
                        <CardDescription className="text-purple-200">
                          {event.city}, {event.country}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center text-purple-100 text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-purple-300" />
                          {event.date}
                        </div>
                        <div className="flex items-center text-purple-100 text-sm">
                          <Clock className="h-4 w-4 mr-2 text-purple-300" />
                          {event.time}
                        </div>
                        <div className="flex items-center text-purple-100 text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-purple-300" />
                          {event.location}
                        </div>
                        <Link href={`/events/${event.id}`}>
                          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                            View Ticket
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="created" className="space-y-6">
              {createdEvents.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
                  <CardContent className="text-center py-12">
                    <h3 className="text-2xl font-bold text-white mb-4">No Events Created</h3>
                    <p className="text-purple-200 mb-6">You haven't created any events yet.</p>
                    <Link href="/create-event">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        Create Your First Event
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {createdEvents.map((event) => (
                    <Card key={event.id} className="bg-white/10 backdrop-blur-sm border-purple-300/20 overflow-hidden">
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
                          <div className="flex space-x-2">
                            <RoleGuard require={Permission.EDIT_EVENT}>
                              <Button size="sm" variant="outline" className="border-purple-300 text-purple-100">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </RoleGuard>
                            <Button size="sm" variant="outline" className="border-purple-300 text-purple-100">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <RoleGuard require={Permission.DELETE_EVENT}>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-300 text-red-300 hover:bg-red-600"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </RoleGuard>
                          </div>
                        </div>
                        <CardTitle className="text-white">{event.title}</CardTitle>
                        <CardDescription className="text-purple-200">
                          {event.attendees}/{event.maxCapacity} registered
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center text-purple-100 text-sm">
                          <Users className="h-4 w-4 mr-2 text-purple-300" />
                          {Math.round((event.attendees / event.maxCapacity) * 100)}% capacity
                        </div>
                        <div className="flex items-center text-purple-100 text-sm">
                          <TrendingUp className="h-4 w-4 mr-2 text-purple-300" />
                          ₹{event.price === "Free" ? "0" : (parseFloat(event.price.replace('$', '')) * 75 * event.attendees).toLocaleString()} revenue
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
