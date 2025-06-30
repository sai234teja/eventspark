
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, QrCode, Sparkles, Plus, Settings, LogOut, Bell, Clock } from "lucide-react";
import QRCodeComponent from "@/components/QRCodeComponent";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxCapacity: number;
  status: "upcoming" | "ongoing" | "completed";
  registrationDate: string;
  qrCode?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [totalStats, setTotalStats] = useState({
    registeredEvents: 0,
    createdEvents: 0,
    upcomingEvents: 0,
    totalAttendees: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));

    // Mock registered events
    const mockRegisteredEvents = [
      {
        id: 1,
        title: "Tech Innovation Summit 2024",
        date: "Dec 15, 2024",
        time: "9:00 AM - 6:00 PM",
        location: "San Francisco Convention Center",
        attendees: 450,
        maxCapacity: 500,
        status: "upcoming" as const,
        registrationDate: "Nov 28, 2024",
        qrCode: "EVENT-TECH-2024-USER123"
      },
      {
        id: 2,
        title: "Creative Design Hackathon",
        date: "Jan 8, 2025",
        time: "48 Hours",
        location: "Virtual Event",
        attendees: 234,
        maxCapacity: 300,
        status: "upcoming" as const,
        registrationDate: "Dec 1, 2024",
        qrCode: "EVENT-DESIGN-2025-USER123"
      }
    ];

    // Mock created events (if user is an organizer)
    const mockCreatedEvents = [
      {
        id: 101,
        title: "Web Development Workshop",
        date: "Dec 20, 2024",
        time: "2:00 PM - 5:00 PM",
        location: "Tech Hub Downtown",
        attendees: 45,
        maxCapacity: 50,
        status: "upcoming" as const,
        registrationDate: "Nov 15, 2024"
      },
      {
        id: 102,
        title: "UI/UX Design Masterclass",
        date: "Jan 15, 2025",
        time: "10:00 AM - 4:00 PM",
        location: "Design Studio",
        attendees: 32,
        maxCapacity: 40,
        status: "upcoming" as const,
        registrationDate: "Dec 5, 2024"
      }
    ];

    setRegisteredEvents(mockRegisteredEvents);
    setCreatedEvents(mockCreatedEvents);

    // Calculate totals
    const upcomingCount = mockRegisteredEvents.filter(e => e.status === "upcoming").length;
    const totalAttendeesCount = mockCreatedEvents.reduce((sum, event) => sum + event.attendees, 0);

    setTotalStats({
      registeredEvents: mockRegisteredEvents.length,
      createdEvents: mockCreatedEvents.length,
      upcomingEvents: upcomingCount,
      totalAttendees: totalAttendeesCount
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-500";
      case "ongoing": return "bg-green-500";
      case "completed": return "bg-gray-500";
      default: return "bg-blue-500";
    }
  };

  if (!user) return null;

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
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/10">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.name || user.email}!
          </h1>
          <p className="text-purple-200">Manage your events and discover new opportunities</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Registered Events</p>
                  <p className="text-3xl font-bold text-white">{totalStats.registeredEvents}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-300" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Created Events</p>
                  <p className="text-3xl font-bold text-white">{totalStats.createdEvents}</p>
                </div>
                <Plus className="h-8 w-8 text-purple-300" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Upcoming Events</p>
                  <p className="text-3xl font-bold text-white">{totalStats.upcomingEvents}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-300" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Total Attendees</p>
                  <p className="text-3xl font-bold text-white">{totalStats.totalAttendees}</p>
                </div>
                <Users className="h-8 w-8 text-purple-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="registered" className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-sm border-purple-300/20">
            <TabsTrigger value="registered" className="data-[state=active]:bg-purple-600">
              My Registrations
            </TabsTrigger>
            <TabsTrigger value="created" className="data-[state=active]:bg-purple-600">
              My Events
            </TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-purple-600">
              My Tickets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registered" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Registered Events</h2>
              <Link to="/events">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Browse More Events
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {registeredEvents.map((event) => (
                <Card key={event.id} className="bg-white/10 backdrop-blur-sm border-purple-300/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{event.title}</CardTitle>
                      <Badge className={`${getStatusColor(event.status)} text-white`}>
                        {event.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-purple-200">
                      Registered on {event.registrationDate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-purple-100">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-center text-purple-100">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center text-purple-100">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.attendees}/{event.maxCapacity} registered</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Link to={`/events/${event.id}`}>
                        <Button variant="outline" size="sm" className="border-purple-300 text-purple-100 hover:bg-purple-800/50">
                          View Details
                        </Button>
                      </Link>
                      <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        <QrCode className="h-4 w-4 mr-2" />
                        Show Ticket
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="created" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">My Created Events</h2>
              <Link to="/create-event">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Event
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {createdEvents.map((event) => (
                <Card key={event.id} className="bg-white/10 backdrop-blur-sm border-purple-300/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{event.title}</CardTitle>
                      <Badge className={`${getStatusColor(event.status)} text-white`}>
                        {event.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-purple-200">
                      Created on {event.registrationDate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-purple-100">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-center text-purple-100">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center text-purple-100">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.attendees}/{event.maxCapacity} registered</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="border-purple-300 text-purple-100 hover:bg-purple-800/50">
                        Edit Event
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        View Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Event Tickets</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {registeredEvents.filter(e => e.qrCode).map((event) => (
                <Card key={event.id} className="bg-white/10 backdrop-blur-sm border-purple-300/20">
                  <CardHeader>
                    <CardTitle className="text-white">{event.title}</CardTitle>
                    <CardDescription className="text-purple-200">
                      {event.date} • {event.time}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <QRCodeComponent value={event.qrCode!} size={200} />
                    </div>
                    <div className="text-purple-100">
                      <p className="text-sm font-mono">{event.qrCode}</p>
                      <p className="text-xs mt-1">Show this QR code at the event entrance</p>
                    </div>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(event.qrCode!);
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      Copy Code
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
