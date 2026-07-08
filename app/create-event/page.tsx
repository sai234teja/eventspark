"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Clock, Sparkles, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    city: "",
    country: "",
    category: "",
    maxCapacity: "",
    price: "",
    registrationDeadline: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.date || !formData.time || 
        !formData.location || !formData.city || !formData.country || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Simulate event creation
    setTimeout(() => {
      toast({
        title: "Event Created Successfully!",
        description: `${formData.title} has been created and is now live.`,
      });
      router.push("/dashboard");
      setIsLoading(false);
    }, 1500);
  };

  const countries = [
    "India", "USA", "UK", "Canada", "Australia", "Germany", "France", "Japan", "Singapore", "UAE"
  ];

  const indianCities = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune", "Hyderabad", "Ahmedabad", "Goa", "Jaipur"
  ];

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
            <Link href="/events">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Browse Events
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Create New Event</h1>
          <p className="text-xl text-purple-200">Bring your vision to life</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
          <CardHeader>
            <CardTitle className="text-white">Event Details</CardTitle>
            <CardDescription className="text-purple-200">
              Fill in the information below to create your event
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-purple-200">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter event title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="bg-white/5 border-purple-300/30 text-white placeholder:text-purple-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-purple-200">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} required>
                    <SelectTrigger className="bg-white/5 border-purple-300/30 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
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

              <div className="space-y-2">
                <Label htmlFor="description" className="text-purple-200">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="bg-white/5 border-purple-300/30 text-white placeholder:text-purple-300 min-h-[100px]"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-purple-200 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Event Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="bg-white/5 border-purple-300/30 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-purple-200 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Time *
                  </Label>
                  <Input
                    id="time"
                    placeholder="e.g., 9:00 AM - 6:00 PM"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    className="bg-white/5 border-purple-300/30 text-white placeholder:text-purple-300"
                    required
                  />
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-purple-300/20">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Event Location
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-purple-200">Venue Address *</Label>
                  <Input
                    id="location"
                    placeholder="Enter complete venue address"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="bg-white/5 border-purple-300/30 text-white placeholder:text-purple-300"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-purple-200">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)} required>
                      <SelectTrigger className="bg-white/5 border-purple-300/30 text-white">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-purple-200">City *</Label>
                    {formData.country === "India" ? (
                      <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)} required>
                        <SelectTrigger className="bg-white/5 border-purple-300/30 text-white">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {indianCities.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="city"
                        placeholder="Enter city name"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="bg-white/5 border-purple-300/30 text-white placeholder:text-purple-300"
                        required
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxCapacity" className="text-purple-200 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Max Capacity *
                  </Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    placeholder="100"
                    value={formData.maxCapacity}
                    onChange={(e) => handleInputChange("maxCapacity", e.target.value)}
                    className="bg-white/5 border-purple-300/30 text-white placeholder:text-purple-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-purple-200">Registration Fee *</Label>
                  <Input
                    id="price"
                    placeholder="Free or ₹500"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="bg-white/5 border-purple-300/30 text-white placeholder:text-purple-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationDeadline" className="text-purple-200">Registration Deadline</Label>
                <Input
                  id="registrationDeadline"
                  type="date"
                  value={formData.registrationDeadline}
                  onChange={(e) => handleInputChange("registrationDeadline", e.target.value)}
                  className="bg-white/5 border-purple-300/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-purple-200 flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Event Image
                </Label>
                <div className="border-2 border-dashed border-purple-300/30 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-purple-300 mx-auto mb-2" />
                  <p className="text-purple-200 text-sm">Click to upload or drag and drop</p>
                  <p className="text-purple-300 text-xs">PNG, JPG up to 10MB</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Link href="/dashboard" className="flex-1 block w-full">
                  <Button variant="outline" className="w-full border-purple-300 text-purple-100 hover:bg-purple-800/50">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Event..." : "Create Event"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateEvent;
