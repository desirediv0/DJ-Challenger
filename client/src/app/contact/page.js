"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Loader2, MessageSquare, Headphones, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchApi } from "@/lib/utils";
import { toast } from "sonner";

export default function ContactPage() {
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "Product Inquiry",
        message: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const response = await fetchApi("/content/contact", {
                method: "POST",
                body: JSON.stringify(formData),
            });

            toast.success(response.data?.message || "Your message has been sent!");
            setFormData({ name: "", email: "", phone: "", subject: "Product Inquiry", message: "" });
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-20 w-60 h-60 bg-orange-100 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
                        <MessageSquare className="w-4 h-4" />
                        We&apos;re Here to Help
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Get in <span className="text-primary">Touch</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Have questions about our products? Need a quote for bulk orders? Our team is ready to assist you.
                    </p>
                </div>
            </section>

            {/* Contact Cards */}
            <section className="max-w-7xl mx-auto px-4 -mt-4 pb-12">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Email */}
                    <a href="mailto:DjChallengerIndia@gmail.com" className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center">
                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                            <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Email Us</h3>
                        <p className="text-primary font-semibold text-sm mb-1 break-all">DjChallengerIndia@gmail.com</p>
                        <p className="text-gray-500 text-sm">We reply within 24 hours</p>
                    </a>

                    {/* Location */}
                    <div className="group bg-white rounded-2xl p-6 border border-gray-200 text-center">
                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Visit Us</h3>
                        <p className="text-gray-700 font-medium mb-1">Industrial Area, Delhi NCR</p>
                        <p className="text-gray-500 text-sm">India - 110001</p>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-5 gap-10">
                        {/* Left Side - Info */}
                        <div className="lg:col-span-2">
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">Contact Form</span>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                Send Us a Message
                            </h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Fill out the form and our team will get back to you within 24 hours.
                            </p>

                            {/* Features */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Headphones className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Expert Support</h4>
                                        <p className="text-sm text-gray-500">Get advice from our audio specialists</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Zap className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Fast Response</h4>
                                        <p className="text-sm text-gray-500">We respond within 24 hours</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Clock className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Business Hours</h4>
                                        <p className="text-sm text-gray-500">Mon-Sat: 9:00 AM - 7:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="John Doe" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="+91 9876543210" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="john@example.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                                        <select name="subject" value={formData.subject} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all">
                                            <option>Product Inquiry</option>
                                            <option>Bulk Order Quote</option>
                                            <option>Technical Support</option>
                                            <option>Order Status</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                                        <textarea name="message" value={formData.message} onChange={handleInputChange} required rows={4} placeholder="Tell us how we can help you..." className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all resize-none" />
                                    </div>

                                    <Button type="submit" size="lg" className="w-full h-12 rounded-xl font-semibold gap-2 bg-primary hover:bg-primary/90" disabled={formLoading}>
                                        {formLoading ? <><Loader2 className="h-5 w-5 animate-spin" />Sending...</> : <><Send className="h-5 w-5" />Send Message</>}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 bg-primary/5 border-t border-primary/10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Ready to upgrade your sound?</h2>
                            <p className="text-gray-600">Browse our collection of professional audio equipment</p>
                        </div>
                        <Link href="/products">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-6 h-12 rounded-xl font-semibold gap-2">
                                Browse Products <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
