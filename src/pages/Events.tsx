
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Search, Filter, Sparkles } from "lucide-react";

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const events = [
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
      description: "Join industry leaders for a day of innovation and networking."
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
      description: "48-hour design challenge with amazing prizes and mentorship."
    },
    {
      id: 3,
      title: "Cultural Heritage Festival",
      date: "Feb 20, 2025",
      time: "2:00 PM - 10:00 PM",
      location: "Central Park Amphitheater",
      attendees: 890,
      maxCapacity: 1000,
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop",
      category: "Cultural",
      price: "$15",
      description: "Celebrate diverse cultures with music, food, and performances."
    },
    {
      id: 4,
      title: "Startup Pitch Competition",
      date: "Mar 5, 2025",
      time: "6:00 PM - 9:00 PM",
      location: "Innovation Hub",
      attendees: 156,
      maxCapacity: 200,
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
      category: "Business",
      price: "$10",
      description: "Watch promising startups pitch to top investors."
    },
    {
      id: 5,
      title: "Photography Workshop",
      date: "Mar 12, 2025",
      time: "10:00 AM - 4:00 PM",
      location: "Downtown Art Studio",
      attendees: 23,
      maxCapacity: 30,
      image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=400&fit=crop",
      category: "Education",
      price: "$75",
      description: "Learn professional photography techniques from experts."
    },
    {
      id: 6,
      title: "Music Festival 2025",
      date: "Apr 15, 2025",
      time: "12:00 PM - 11:00 PM",
      location: "Riverside Park",
      attendees: 2340,
      maxCapacity: 3000,
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop",
      category: "Entertainment",
      price: "$50",
      description: "A day of live music featuring local and international artists."
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || event.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

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
            <Link to="/dashboard">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Dashboard
              </Button>
            </Link>
            <Link to="/create-event">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Discover Events</h1>
          <p className="text-xl text-purple-200">Find your next amazing experience</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-purple-300/30 text-white placeholder:text-purple-300"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-purple-300/30 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="bg-white/10 backdrop-blur-sm border-purple-300/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer">
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="bg-purple-800/50 text-purple-200">
                    {event.category}
                  </Badge>
                  <span className="text-sm font-semibold text-green-300">
                    {event.price}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-200 transition-colors">
                  {event.title}
                </h3>
                <p className="text-purple-100 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
                <div className="space-y-2 text-purple-100 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">{event.date} • {event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">{event.attendees}/{event.maxCapacity} registered</span>
                  </div>
                </div>
                <Link to={`/events/${event.id}`}>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-purple-200 mb-4">No events found matching your criteria</p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
              }}
              variant="outline"
              className="border-purple-300 text-purple-100 hover:bg-purple-800/50"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
