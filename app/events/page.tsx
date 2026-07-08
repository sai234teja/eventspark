"use client";

import { useState } from "react";
import Link from "next/link";
import { OrganizationSwitcher } from "@/components/OrganizationSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Search, Filter, Sparkles } from "lucide-react";

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

  const events = [
    {
      id: 1,
      title: "Tech Innovation Summit 2024",
      date: "Dec 15, 2024",
      time: "9:00 AM - 6:00 PM",
      location: "San Francisco Convention Center",
      city: "San Francisco",
      country: "USA",
      attendees: 450,
      maxCapacity: 500,
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
      category: "Technology",
      price: "$75",
      description: "Join industry leaders for a day of innovation and networking.",
      isCompleted: false,
      registrationOpen: true
    },
    {
      id: 2,
      title: "Goa Beach Music Festival",
      date: "Jan 20, 2025",
      time: "6:00 PM - 2:00 AM",
      location: "Baga Beach",
      city: "Goa",
      country: "India",
      attendees: 1200,
      maxCapacity: 1500,
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop",
      category: "Entertainment",
      price: "$50",
      description: "Experience the ultimate beach party with international DJs.",
      isCompleted: false,
      registrationOpen: true
    },
    {
      id: 3,
      title: "Mumbai Design Workshop",
      date: "Feb 5, 2025",
      time: "10:00 AM - 4:00 PM",
      location: "Design Hub Mumbai",
      city: "Mumbai",
      country: "India",
      attendees: 89,
      maxCapacity: 100,
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop",
      category: "Design",
      price: "$30",
      description: "Learn modern design principles from industry experts.",
      isCompleted: false,
      registrationOpen: true
    },
    {
      id: 4,
      title: "Delhi Cultural Heritage Walk",
      date: "Jan 15, 2025",
      time: "8:00 AM - 12:00 PM",
      location: "Red Fort Area",
      city: "Delhi",
      country: "India",
      attendees: 45,
      maxCapacity: 50,
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop",
      category: "Cultural",
      price: "Free",
      description: "Explore Delhi's rich cultural heritage with expert guides.",
      isCompleted: false,
      registrationOpen: true
    },
    {
      id: 5,
      title: "Goa Photography Retreat",
      date: "Mar 10, 2025",
      time: "7:00 AM - 6:00 PM",
      location: "Various beaches in South Goa",
      city: "Goa",
      country: "India",
      attendees: 25,
      maxCapacity: 30,
      image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=400&fit=crop",
      category: "Education",
      price: "$80",
      description: "Capture Goa's beauty with professional photography guidance.",
      isCompleted: false,
      registrationOpen: true
    },
    {
      id: 6,
      title: "Completed Tech Event",
      date: "Nov 20, 2024",
      time: "9:00 AM - 5:00 PM",
      location: "Bangalore Tech Park",
      city: "Bangalore",
      country: "India",
      attendees: 300,
      maxCapacity: 300,
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
      category: "Technology",
      price: "$40",
      description: "This event has been completed successfully.",
      isCompleted: true,
      registrationOpen: false
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || event.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesLocation = locationFilter === "all" || event.city.toLowerCase() === locationFilter.toLowerCase();
    const matchesCountry = countryFilter === "all" || event.country.toLowerCase() === countryFilter.toLowerCase();
    return matchesSearch && matchesCategory && matchesLocation && matchesCountry;
  });

  const uniqueCountries = Array.from(new Set(events.map(event => event.country)));
  const uniqueCities = Array.from(new Set(events.map(event => event.city)));

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
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Dashboard
              </Button>
            </Link>
            <Link href="/create-event">
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
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-purple-300/30 text-white">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {uniqueCountries.map(country => (
                  <SelectItem key={country} value={country.toLowerCase()}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-purple-300/30 text-white">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {uniqueCities.map(city => (
                  <SelectItem key={city} value={city.toLowerCase()}>{city}</SelectItem>
                ))}
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
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-800/50 text-purple-200">
                      {event.category}
                    </Badge>
                    {event.isCompleted && (
                      <Badge className="bg-red-600 text-white text-xs">Completed</Badge>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-green-300">
                    {event.price === "Free" ? "Free" : `₹${parseFloat(event.price.replace('$', '')) * 75}`}
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
                    <span className="text-sm">{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{event.city}, {event.country}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">{event.attendees}/{event.maxCapacity} registered</span>
                  </div>
                </div>
                <Link href={`/events/${event.id}`}>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    {event.isCompleted ? "View Details" : "View & Register"}
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
                setLocationFilter("all");
                setCountryFilter("all");
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
