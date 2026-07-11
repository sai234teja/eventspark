"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, ArrowRight, Sparkles, Zap, Trophy } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const featuredEvents = [
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
      price: "Free"
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
      price: "$25"
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
      price: "$15"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
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
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl rounded-full"></div>
          <h1 className="relative text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 mb-6">
            EventSpark
          </h1>
          <p className="relative text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Discover amazing events, connect with like-minded people, and create unforgettable experiences. Your next adventure is just a click away.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/events">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg">
                Browse Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/create-event">
              <Button size="lg" variant="outline" className="border-purple-300 text-purple-100 hover:bg-purple-800/50 px-8 py-4 text-lg">
                Create Event
                <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Why Choose EventSpark?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Easy Event Discovery</h3>
                <p className="text-purple-100">Find events that match your interests with our intelligent recommendation system.</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Connect & Network</h3>
                <p className="text-purple-100">Meet new people and build meaningful connections at every event you attend.</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Seamless Experience</h3>
                <p className="text-purple-100">From registration to check-in, enjoy a smooth and hassle-free event experience.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Featured Events
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
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
                    <span className="text-sm text-purple-300 bg-purple-800/50 px-2 py-1 rounded">
                      {event.category}
                    </span>
                    <span className="text-sm font-semibold text-green-300">
                      {event.price}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-200 transition-colors">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-purple-100">
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
                  <Link href={`/events/${event.id}`}>
                    <Button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Spark Your Next Event?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of event creators and attendees who trust EventSpark for their event management needs.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg">
              Get Started Free
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-purple-800/50">
        <div className="max-w-7xl mx-auto text-center text-purple-300">
          <p>&copy; 2024 EventSpark. All rights reserved. Built with ❤️ for event enthusiasts.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
