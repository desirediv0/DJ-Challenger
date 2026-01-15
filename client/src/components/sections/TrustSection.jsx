import { Star, Quote } from "lucide-react";

const stats = [
  { value: "25+", label: "Years of Excellence" },
  { value: "50,000+", label: "Happy Customers" },
  { value: "500+", label: "Products" },
  { value: "50+", label: "Countries" }
];

const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "Event Organizer, Mumbai",
    text: "DJ-Challenger speakers have been our go-to for 5 years. Unmatched quality at factory prices.",
    rating: 5
  },
  {
    name: "Vikram Singh",
    role: "Professional DJ, Delhi",
    text: "The sound clarity and power of these speakers is incredible. Best investment I have made.",
    rating: 5
  },
  {
    name: "Priya Patel",
    role: "Wedding Planner, Ahmedabad",
    text: "Reliable, powerful, and great support. We use DJ-Challenger for all our events.",
    rating: 5
  }
];

export const TrustSection = () => {
  return (
    <section className="section-padding bg-foreground text-white">
      <div className="section-container">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="font-display text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.value}
              </p>
              <p className="text-white/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">
              Testimonials
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Trusted by Professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
                <Quote className="h-8 w-8 text-primary/40 mb-4" />
                
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                
                <p className="text-white/80 mb-6 leading-relaxed">
                  &quot;{testimonial.text}&quot;
                </p>
                
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-white/50">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
